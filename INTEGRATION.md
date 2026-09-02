# SvelteKit ↔ Stencil integration

How `apps/web` consumes `@sandeep_saini/recipe-ui` and demonstrates **properties**, **custom events**, and **slots**.

---

## Package consumption (not source)

The SvelteKit app depends on the published workspace package and registers custom elements from the **loader** entry — never from `packages/recipe-ui/src`.

```ts
// apps/web/src/lib/stencil.ts
import { defineCustomElements } from '@sandeep_saini/recipe-ui/loader';
await defineCustomElements();
```

- Dependency: `"@sandeep_saini/recipe-ui": "^0.1.0"` in `apps/web/package.json`
- Package `exports["./loader"]` → built `loader/` + `dist/` (see `packages/recipe-ui/package.json`)
- Root layout (`+layout.svelte`) calls `registerRecipeUi()` once on the client and gates page content until elements are defined (SSR-safe)

---

## Complex props via element properties

Svelte attribute bindings stringify objects. The app uses a small action so object/array props are assigned as **DOM properties**:

```ts
// apps/web/src/lib/actions/ce-props.ts
export function ceProps(node: HTMLElement, props: Record<string, unknown>) {
  for (const [key, value] of Object.entries(props)) {
    (node as unknown as Record<string, unknown>)[key] = value;
  }
  // …update on change
}
```

Primitives (`label`, `heading`, `loading`, `active`, …) bind normally as attributes/props.

---

## Example 1 — SvelteKit → `rf-recipe-grid` property

**Where:** Home (`/`), Discover (`/recipes`), Favorites (`/favorites`)

Featured / search / favorite lists pass recipe summaries and favorited ids as properties:

```svelte
<rf-recipe-grid
  label="Featured recipes"
  use:ceProps={{ recipes: featured, favoritedIds: favorites.ids }}
  onrfRecipeSelect={onRecipeSelect}
  onrfFavoriteToggle={onFavoriteToggle}
></rf-recipe-grid>
```

| Direction | Mechanism | Payload |
|-----------|-----------|---------|
| Svelte → Stencil | `recipes`, `favoritedIds` via `ceProps` | `RecipeSearchResult[]`, `RecipeId[]` |
| Stencil → Svelte | `rfRecipeSelect`, `rfFavoriteToggle` | `{ recipe }`, `{ recipe, active }` |

Same pattern for a single card on **My recipes**:

```svelte
<rf-recipe-card
  hideFavorite={true}
  use:ceProps={{ recipe: summary }}
  onrfRecipeSelect={onRecipeSelect}
>
  …
</rf-recipe-card>
```

Other object props using `ceProps`:

- `rf-filter-panel` → `categories`, `areas`, `value`
- `rf-recipe-form` → `value`, `errors`
- `rf-meal-plan-week` → `weekStart`, `meals`
- `rf-select` → `options`

---

## Example 2 — `rf-recipe-card` / favorite → custom event

**Where:** Grids on home / discover / favorites; detail page favorite control

### Card / grid favorite toggle

Stencil `rf-recipe-card` listens to inner `rf-favorite-button` and re-emits a **domain** event (not a raw DOM click):

```ts
// packages/recipe-ui — rf-recipe-card
rfFavoriteToggle.emit({ recipe, active: event.detail.active });
```

SvelteKit updates the favorites store from `event.detail`:

```ts
function onFavoriteToggle(
  event: CustomEvent<{ recipe: RecipeSearchResult; active: boolean }>
) {
  const recipe = event.detail?.recipe;
  if (!recipe) return;
  favorites.setFavorite(recipe, Boolean(event.detail?.active));
}
```

`rf-recipe-grid` re-emits the same event names so pages listen once on the grid host.

### Detail page `rf-favorite-button`

```svelte
<rf-favorite-button active={favorited} onrfToggle={onFavoriteToggle}></rf-favorite-button>
```

```ts
function onFavoriteToggle(event: CustomEvent<{ active: boolean }>) {
  if (!recipe) return;
  favorites.setFavorite(recipeToSearchResult(recipe), Boolean(event.detail?.active));
}
```

Event contracts stay intentional (`query`, `recipe`, `active`, meal slot ids) — no MouseEvent / DOM nodes in `detail`. Buttons emit `rfClick` with empty detail; hosts decide what to do.

---

## Example 3 — Stencil slots for projected content

Slots let Svelte own navigation and CTAs while Stencil owns layout chrome.

### `rf-empty-state` → `action` (Discover, Favorites, …)

```svelte
<rf-empty-state heading="No favorites yet" message="…">
  <div slot="action">
    <a class="chip" href="/recipes">Discover recipes</a>
  </div>
</rf-empty-state>
```

### `rf-recipe-card` → `badge` + `actions` (My recipes)

```svelte
<rf-recipe-card hideFavorite={true} use:ceProps={{ recipe: summary }} …>
  <span slot="badge" class="owned-badge">Yours</span>
  <div slot="actions" class="card-actions">
    <a class="chip" href="…/edit">Edit</a>
    <rf-button type="button" variant="danger" onrfClick={…}>Delete</rf-button>
  </div>
</rf-recipe-card>
```

### `rf-modal` → default + `footer` (delete confirm, meal editor)

```svelte
<rf-modal heading="Delete this recipe?" open={!!deleteTarget} onrfClose={closeDelete}>
  <p>…</p>
  <div slot="footer">
    <rf-button … onrfClick={closeDelete}>Cancel</rf-button>
    <rf-button … onrfClick={confirmDelete}>Delete recipe</rf-button>
  </div>
</rf-modal>
```

### Additional slots in the main experience

| Component | Slot | App usage |
|-----------|------|-----------|
| `rf-meal-plan-week` | `header` | Meal count / drag hint (week label from `weekStart` prop) |
| `rf-recipe-form` | `footer` | Cancel / back links |
| `rf-button` | default | Label text |
| `rf-search-bar` | `actions` | Available for trailing controls (optional) |

---

## Main app experience checklist

| Route | Stencil usage |
|-------|----------------|
| `/` | `rf-search-bar`, `rf-recipe-grid`, `rf-button`, `rf-loading-state` |
| `/recipes` | `rf-search-bar`, `rf-filter-panel`, `rf-recipe-grid`, `rf-empty-state` |
| `/recipes/[id]` | `rf-favorite-button`, `rf-empty-state`, `rf-loading-state` |
| `/favorites` | `rf-recipe-grid`, `rf-empty-state` |
| `/my-recipes*` | `rf-recipe-card` (+ slots), `rf-recipe-form`, `rf-modal` |
| `/meal-planner` | `rf-meal-plan-week`, `rf-modal`, `rf-search-bar`, `rf-select` |

Domain logic (API, favorites, meal plan, validation) stays in `$lib`; Stencil components stay presentational.

---

## Integration rules (summary)

1. Import `@sandeep_saini/recipe-ui/loader` only — not Stencil source.
2. Pass objects/arrays with `use:ceProps={{ … }}`.
3. Listen with `onrf*` handlers; read typed `event.detail`.
4. Project app-specific UI through named slots (`action`, `footer`, `badge`, `actions`, `header`).
5. Register custom elements once in the root layout before rendering pages that use them.
