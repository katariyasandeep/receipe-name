# Recipe Finder & Meal Planner — Architecture

> Lead Frontend Architect decisions for the assignment.  
> Stack: **Svelte 5 + SvelteKit + TypeScript + StencilJS**.  
> Status: greenfield (no application code yet). Prefer simple, production-quality patterns over unnecessary complexity.

---

## 1. Monorepo / project structure

npm workspaces monorepo with two packages:

```text
recipe-finder/
├── apps/
│   └── web/                      # SvelteKit application
│       ├── src/
│       │   ├── lib/
│       │   │   ├── api/          # TheMealDB client + mappers
│       │   │   ├── stores/       # favorites, user recipes, meal plan
│       │   │   ├── types/        # shared domain types
│       │   │   ├── validation/   # user-recipe form validation
│       │   │   └── utils/        # helpers (ids, dates, localStorage)
│       │   ├── routes/           # file-based routing
│       │   ├── app.html
│       │   ├── app.css
│       │   └── app.d.ts
│       ├── static/
│       ├── package.json
│       ├── svelte.config.js
│       ├── vite.config.ts
│       └── tsconfig.json
├── packages/
│   └── recipe-ui/                # StencilJS component library (published)
│       ├── src/
│       │   ├── components/
│       │   ├── utils/
│       │   ├── index.ts
│       │   └── global/
│       ├── stencil.config.ts
│       ├── package.json
│       ├── tsconfig.json
│       └── README.md
├── ARCHITECTURE.md
├── INTEGRATION.md                # later (stencil-svelte-integration)
├── RELEASE.md                    # later (deployment-npm)
├── ASSIGNMENT_REVIEW.md          # later (final-review)
├── README.md
├── package.json                  # workspaces root
└── .gitignore
```

**Workspace root `package.json`:**

- `"workspaces": ["apps/*", "packages/*"]`
- Scripts delegate: `dev` → web, `build` → recipe-ui then web, `test` → both

**Hard rule:** `apps/web` depends on `@sandeep_saini/recipe-ui` via the **published npm package** (or a versioned registry install). It must **not** import Stencil source from `packages/recipe-ui/src`.

---

## 2. SvelteKit architecture

| Concern | Decision |
|--------|----------|
| Framework | SvelteKit (Svelte 5 runes) + TypeScript |
| Adapter | `@sveltejs/adapter-static` (or Vercel/Netlify adapter if hosting requires it) — SPA-friendly static export is fine for this assignment |
| Rendering | Client-heavy app: recipe API + `localStorage` need the browser. Use `+page.ts` load functions where useful; guard browser-only APIs with `browser` from `$app/environment` |
| Layout | Root `+layout.svelte`: nav shell, register Stencil components once, global styles |
| Domain logic | `$lib/api`, `$lib/stores`, `$lib/types`, `$lib/validation` — **not** inside Stencil |
| UI composition | Routes compose published Stencil web components; thin Svelte wrappers only when binding/events need glue |

**App responsibilities (SvelteKit owns):**

- Routing and page orchestration
- Fetching/normalizing TheMealDB data
- Persistence (user recipes, favorites, meal plans)
- Form validation for user-created recipes
- Wiring Stencil props/events/slots

**Not in SvelteKit:** reusable presentational primitives (those live in `recipe-ui`).

---

## 3. StencilJS architecture

| Concern | Decision |
|--------|----------|
| Package name | `@sandeep_saini/recipe-ui` |
| Output | Dist custom elements + hydrated loader; `customElements` target for framework-agnostic use |
| Styling | Shadow DOM per component; CSS custom properties for theming (`--rf-*`) so the app can skin without piercing shadows |
| State | **Presentational only** — no favorites/API/localStorage inside components |
| API surface | Props in, `CustomEvent` out, named slots for flexible content |
| Docs | Package `README.md` lists props, events, slots, and usage examples |

**Build outputs** (typical Stencil):

- `dist/components/` — lazy-loaded custom elements
- `loader/` — `defineCustomElements()` entry for SvelteKit
- Types via `components.d.ts` / package `types` field

---

## 4. State management strategy

Keep state **local and simple** — no Redux/global store library.

| State | Location | Why |
|-------|----------|-----|
| Search query, filters, browse results | Route/`+page.svelte` local state (`$state`) | Ephemeral UI |
| Recipe detail (API) | Page load or page `$state` | Request-scoped |
| Favorites | `$lib/stores/favorites.svelte.ts` (Svelte 5 rune module) | Shared across routes |
| User-created recipes | `$lib/stores/user-recipes.svelte.ts` | Shared CRUD |
| Meal plan | `$lib/stores/meal-plan.svelte.ts` | Shared week grid |
| Loading / error for a fetch | Page or small `createAsyncState()` helper | Avoid global loading flags |

**Store pattern:** Svelte 5 runes in `.svelte.ts` modules exporting reactive state + methods (`addFavorite`, `removeFavorite`, etc.). Each store hydrates from `localStorage` on init (browser only) and persists on change.

**Stencil components never own app state** — they receive props and emit events; Svelte stores update in response.

---

## 5. API / data model strategy

### Public API: TheMealDB

- Base URL: `https://www.themealdb.com/api/json/v1/1/`
- **No API key** (free tier) — good for demos and student assignments
- Alternative (document only if needed later): Spoonacular (requires key) — not preferred

### Supported TheMealDB operations (mapped in `$lib/api`)

| Feature | Endpoint (conceptual) |
|---------|----------------------|
| Search by name | `search.php?s={query}` |
| Browse by first letter | `search.php?f={letter}` |
| Filter by category | `filter.php?c={category}` |
| Filter by area (cuisine) | `filter.php?a={area}` |
| Filter by main ingredient | `filter.php?i={ingredient}` |
| Categories list | `list.php?c=list` |
| Areas list | `list.php?a=list` |
| Recipe detail | `lookup.php?i={id}` |
| Random (optional home) | `random.php` |

### Assumptions / limitations

- Filter endpoints return **lightweight** meals (id, name, thumb) — detail requires a second `lookup` call when needed
- No full-text multi-field search; combine search + category/area filters in the UI
- Rate limits are soft; keep UI caching light (in-memory Map for recent lookups is enough)
- Network errors surface as typed `ApiError`; empty arrays are valid “no results”

### Canonical domain types (`$lib/types`)

```ts
RecipeId = string; // `mealdb:{id}` or `user:{uuid}`

Ingredient { name: string; measure: string }

Recipe {
  id: RecipeId;
  source: 'mealdb' | 'user';
  title: string;
  category?: string;
  area?: string;
  thumbnailUrl?: string;
  ingredients: Ingredient[];
  instructions: string;      // plain text; split by newlines for display
  tags?: string[];
  youtubeUrl?: string;
  sourceUrl?: string;
}

RecipeSearchResult {
  id: RecipeId;
  title: string;
  thumbnailUrl?: string;
  category?: string;
  area?: string;
}

RecipeFilter {
  query?: string;
  category?: string;
  area?: string;
  ingredient?: string;
  letter?: string;
}

UserRecipe extends Recipe { source: 'user'; createdAt: string; updatedAt: string }

Favorite { recipeId: RecipeId; savedAt: string; snapshot: RecipeSearchResult }

MealPlan {
  weekStart: string; // ISO date (Monday)
  meals: PlannedMeal[];
}

PlannedMeal {
  id: string;
  day: 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
  slot: 'breakfast' | 'lunch' | 'dinner';
  recipeId: RecipeId;
  snapshot: RecipeSearchResult; // denormalized for offline display
}
```

### Service layer (`$lib/api`)

- `mealdb-client.ts` — raw fetch wrappers
- `mappers.ts` — TheMealDB JSON → `Recipe` / `RecipeSearchResult`
- `recipes-service.ts` — `search`, `browse`, `filter`, `getById` (UI-facing)
- Never call TheMealDB directly from `.svelte` pages

---

## 6. Persistence strategy

**Browser `localStorage` only** — no backend, no auth. Fits assignment scope and static hosting.

| Key | Value |
|-----|--------|
| `rf:favorites` | `Favorite[]` |
| `rf:user-recipes` | `UserRecipe[]` |
| `rf:meal-plan` | `MealPlan` (current week; optional history out of scope) |

**Rules:**

- Persist on every mutating store method
- Hydrate once on first browser access; ignore corrupt JSON (reset to defaults + console warn)
- Favorites and meal plan store a **snapshot** so UI still works if MealDB is down or a meal is removed upstream
- User recipes are fully local; IDs use `user:` + `crypto.randomUUID()`
- No cross-device sync (document in README)

---

## 7. Routing structure

```text
/                          → Home: search entry + featured/random + category shortcuts
/recipes                   → Browse / search results + filters
/recipes/[id]              → Recipe details (MealDB or user; id includes source prefix)
/favorites                 → Favorite recipes list
/my-recipes                → User-created recipe list
/my-recipes/new            → Create recipe form
/my-recipes/[id]/edit      → Edit user recipe
/meal-planner              → Weekly meal planner
```

**Notes:**

- `[id]` is URL-encoded `RecipeId` (e.g. `mealdb:52772`, `user:…`)
- Invalid / missing recipes → not-found UI (see §11)
- Optional redirect: `/` search submit → `/recipes?q=…`

---

## 8. Component boundaries

| Layer | Owns | Does not own |
|-------|------|--------------|
| **Stencil (`recipe-ui`)** | Layout, visuals, a11y controls, emitting interaction events | Fetching, persistence, routing, validation rules |
| **Svelte routes** | Page composition, wiring props/events, navigation | Low-level presentational markup duplicated from Stencil |
| **`$lib/stores`** | Shared mutable domain state + persistence | Rendering |
| **`$lib/api`** | Network + mapping | UI state |
| **`$lib/validation`** | User recipe field rules | Stencil form chrome (Stencil owns inputs; Svelte owns validity messages passed as props) |

**Boundary rule:** If a piece of UI is reusable and presentational → Stencil. If it needs the router, stores, or API → Svelte.

---

## 9. Stencil component list

| Component | Role | Key props | Key events | Slots |
|-----------|------|-----------|------------|-------|
| `rf-button` | Shared button | `variant`, `disabled`, `type` | `rfClick` | default (label) |
| `rf-input` | Text input | `label`, `value`, `name`, `error`, `type` | `rfInput`, `rfChange` | hint |
| `rf-select` | Select | `label`, `value`, `options`, `error` | `rfChange` | — |
| `rf-search-bar` | Search field + submit | `value`, `placeholder`, `loading` | `rfSearch` | actions |
| `rf-filter-panel` | Category / area / ingredient filters | `categories`, `areas`, `value` (filter object) | `rfFilterChange` | — |
| `rf-recipe-card` | Summary card | `recipe` (summary), `favorited` | `rfRecipeSelect`, `rfFavoriteToggle` | badge, actions |
| `rf-recipe-grid` | Responsive grid of cards | `recipes`, `favoritedIds` | (bubbles card events) | empty |
| `rf-favorite-button` | Heart toggle | `active`, `disabled` | `rfToggle` | — |
| `rf-recipe-form` | Create/edit fields | `value` (UserRecipe draft), `errors` | `rfSubmit`, `rfChange` | footer |
| `rf-meal-plan-week` | 7-day planner grid | `weekStart`, `meals` | `rfSlotClick`, `rfMealRemove`, `rfMealMove` | header |
| `rf-meal-plan-card` | Single planned meal cell | `meal`, `day`, `slot` | `rfRemove`, `rfSelect` | — |
| `rf-modal` | Dialog | `open`, `heading` | `rfClose` | default, footer |
| `rf-empty-state` | Empty placeholder | `heading`, `message` | — | action |
| `rf-loading-state` | Loading indicator | `label` | — | — |

Prefix `rf-` avoids collisions. Demonstrate **props**, **custom events**, and **slots** across this set (cards, modal, empty-state, search actions).

---

## 10. Svelte ↔ Stencil integration approach

1. Publish `@sandeep_saini/recipe-ui` to npm (see §13).
2. In `apps/web`, depend on the **published version** (semver), not `file:../../packages/recipe-ui/src`.
3. Register once in root layout (browser):

   ```ts
   import { defineCustomElements } from '@sandeep_saini/recipe-ui/loader';
   defineCustomElements();
   ```

4. Use tags in Svelte: `<rf-recipe-card recipe={…} on:rfRecipeSelect={…}>` (or `addEventListener` / Svelte 5 event attributes as supported for custom elements).
5. **Props:** pass serializable data (objects/arrays/primitives). Prefer JSON-friendly shapes matching domain types.
6. **Events:** listen for `rf*` CustomEvents; read `event.detail`.
7. **Slots:** project Svelte content into Stencil slots (e.g. modal footer buttons, empty-state CTA).
8. TypeScript: reference Stencil-generated JSX/intrinsic element types or a small `app.d.ts` augmentation for `rf-*` tags.
9. SSR: custom elements are client-only — render after mount or use a client boundary so SSR doesn’t break.

**Local development:** use workspace protocol only if it resolves to the **built package dist** (`workspace:*` → `packages/recipe-ui` package entry pointing at `dist/`), never raw `src/`. CI and production always install from the registry after publish.

Document the final wiring in `INTEGRATION.md` (later agent).

---

## 11. Error / loading / empty-state strategy

| State | Pattern |
|-------|---------|
| Loading | Show `<rf-loading-state>` in the content region that is fetching; disable search submit while in-flight |
| Empty results | `<rf-empty-state>` with heading + suggestion (“Try another category”) + optional slot CTA |
| API error | Inline error banner on the page (message + Retry); log details to console; do not crash the shell |
| Not found (detail) | Dedicated empty/not-found block with link back to `/recipes` |
| Validation (forms) | Field-level `errors` object passed into `<rf-recipe-form>`; block submit until valid |
| Persistence failure | Rare (`QuotaExceeded`); toast/banner “Could not save locally” |

Avoid global full-page spinners except initial app boot if needed.

---

## 12. Testing strategy

| Layer | Tooling | Focus |
|-------|---------|--------|
| Stencil units | Stencil’s Jest/Spec (`*.spec.ts`) | Props render, events emit, a11y basics for card, search, form, meal-plan-week |
| API mappers | Vitest in `apps/web` | TheMealDB fixtures → `Recipe` / search results; error paths |
| Stores | Vitest + mock `localStorage` | Favorites toggle, user CRUD, meal plan assign/remove |
| Validation | Vitest | Required fields, min lengths, ingredient list rules |
| E2E (light) | Playwright (optional, later) | Search → detail; favorite; add user recipe; plan a meal |

**Principle:** test pure logic and component contracts heavily; keep E2E to a few happy paths.

---

## 13. npm publishing strategy

| Item | Decision |
|------|----------|
| Package | `@sandeep_saini/recipe-ui` |
| Access | Public npm (scoped package; `publishConfig.access: public`) |
| Versioning | Semver; start at `0.1.0` |
| Artifacts | Only `dist`, `loader`, README, package.json (`.npmignore` excludes src tests) |
| Prepublish | `stencil build` must succeed |
| App dependency | Pin published version in `apps/web/package.json` (e.g. `^0.1.0`) |
| Docs | Package README + root README link to npm |

**RELEASE.md** (later) records: npm package URL, version, publish steps — **no invented URLs**; fill in after real publish.

---

## 14. Deployment strategy

| Item | Decision |
|------|----------|
| App host | Static hosting: **Vercel**, **Netlify**, or **GitHub Pages** (choose one at deploy time) |
| Build | `npm run build` at root: build `recipe-ui` (if needed) → build `apps/web` |
| Env | No secrets required for TheMealDB; no `.env` mandatory |
| CORS | TheMealDB allows browser requests; if blocked in future, add a tiny SvelteKit server proxy — not needed initially |
| Deliverables | Live app URL + GitHub repo URL + npm package link in README / RELEASE.md |

Prefer static deploy for simplicity. If adapter-static + TheMealDB from the client works end-to-end, do not add a backend.

---

## 15. Development sequence for remaining agents

Follow this order (matches workspace agent workflow):

| Step | Agent | Output |
|------|-------|--------|
| 1 | **architecture** (this doc) | `ARCHITECTURE.md` |
| 2 | **stencil-component-library** | `packages/recipe-ui` — components, tests, package README |
| 3 | **api-data-layer** | `apps/web` types, TheMealDB client, mappers, services, Vitest |
| 4 | **sveltekit-ui** | App shell, routes, layout, Stencil registration, discovery + detail pages |
| 5 | **recipe-management** / **favorites** / **meal-planner** (parallel OK) | Feature stores + pages wired to Stencil |
| 6 | **stencil-svelte-integration** | Verify props/events/slots; write `INTEGRATION.md` |
| 7 | **testing-quality** | Fill gaps, fix failures, harden edge cases |
| 8 | **deployment-npm** | Publish npm package, deploy app, `RELEASE.md` + root `README.md` (real URLs only) |
| 9 | **final-review** | `ASSIGNMENT_REVIEW.md` checklist vs requirements |

**Constraint reminder for all agents:** do not rewrite working pieces; consume published (or dist-built) Stencil package from SvelteKit, never Stencil source.

---

## Summary of key decisions

1. **Monorepo:** `apps/web` (SvelteKit) + `packages/recipe-ui` (Stencil), npm workspaces.
2. **API:** TheMealDB (no key); normalize to shared `Recipe*` types via a service layer.
3. **Persistence:** `localStorage` for favorites, user recipes, and the current week meal plan.
4. **State:** Svelte 5 rune stores for shared data; page-local state for search/browse.
5. **Stencil:** Presentational `rf-*` components with props, `rf*` events, and slots; Shadow DOM + CSS variables.
6. **Integration:** SvelteKit installs `@sandeep_saini/recipe-ui` from npm and calls `defineCustomElements()`.
7. **Ship:** Public npm package + static app host; document real links in RELEASE/README later.
