# Recipe Finder & Meal Planner

Discover meals from [TheMealDB](https://www.themealdb.com/), save favorites, create your own recipes, and plan a week of meals — all in the browser.

## Project overview

This is an npm-workspaces monorepo:

| Package | Role |
|---------|------|
| `apps/web` | SvelteKit (Svelte 5) application |
| `packages/recipe-ui` | StencilJS web-component library (`@sandeep_saini/recipe-ui`) |

The app consumes the **built** Stencil package (`dist` / `loader`) — never Stencil source under `packages/recipe-ui/src`.

## Architecture summary

- **UI primitives:** Stencil custom elements (`rf-*`) with Shadow DOM, props, `rf*` events, and slots
- **App shell / routing:** SvelteKit with `@sveltejs/adapter-static` (SPA fallback `index.html`)
- **Data:** TheMealDB public API (no API key) via `$lib/api`
- **Persistence:** `localStorage` for favorites, user recipes, and the current meal plan
- **State:** Svelte 5 rune stores in `$lib/stores`

See [ARCHITECTURE.md](./ARCHITECTURE.md) and [INTEGRATION.md](./INTEGRATION.md) for details.

## Assumptions

- TheMealDB free tier is available from the browser (CORS allowed; soft rate limits)
- No backend, auth, or cross-device sync — data stays on the device
- Filter endpoints return lightweight meals; detail views call `lookup` when needed
- Stencil must be built before the web app can resolve `@sandeep_saini/recipe-ui`

## Setup instructions

**Requirements:** Node.js 18+ and npm 9+ (workspaces).

```bash
# From the monorepo root
npm install
npm run build:ui    # builds @sandeep_saini/recipe-ui (dist + loader)
```

If you only need the app after a clean clone, `npm run build` builds the UI package then the web app.

## Starting the development server

```bash
npm run build:ui   # once (or after UI changes)
npm run dev        # http://localhost:5173 (Vite default)
```

Preview the production static build locally:

```bash
npm run build
npm run preview
```

## Environment variables

**None required.** TheMealDB does not need an API key for the free demo endpoint.

See [`.env.example`](./.env.example). Optional `PUBLIC_*` variables are reserved for future client overrides; the MealDB base URL is currently hardcoded in `apps/web/src/lib/api/mealdb-client.ts`.

Do **not** commit real secrets. There are no secrets in this project today.

## Stencil library (`@sandeep_saini/recipe-ui`)

- **Version:** `0.1.0` (semver)
- **Publish access:** public scoped package (`publishConfig.access: public`)
- **Entries:** main package + `@sandeep_saini/recipe-ui/loader` (`defineCustomElements`)
- **Artifacts published:** `dist/`, `loader/`, `README.md` (source/tests excluded via `.npmignore` + `files`)
- **Local monorepo:** `apps/web` depends on `"@sandeep_saini/recipe-ui": "^0.1.0"` resolved through workspaces to the package’s built outputs

Package docs: [packages/recipe-ui/README.md](./packages/recipe-ui/README.md)

### npm package link

Published: **[@sandeep_saini/recipe-ui@0.1.0](https://www.npmjs.com/package/@sandeep_saini/recipe-ui)**

```text
npm: https://www.npmjs.com/package/@sandeep_saini/recipe-ui
```

Install:

```bash
npm install @sandeep_saini/recipe-ui
```

## GitHub repository link

```text
GitHub: https://github.com/sandeepsaini01/recipe-finder
```

## Deployed application URL

> **Pending first GitHub Pages deploy.** Enable Pages (Settings → Pages → Source: GitHub Actions), then after the workflow succeeds the app will be at:

```text
Live app: https://sandeepsaini01.github.io/recipe-finder/
```

Deploy is automated via [`.github/workflows/deploy-pages.yml`](./.github/workflows/deploy-pages.yml) (`BASE_PATH=/recipe-finder`).

Also supported: Netlify / Vercel configs at the repo root (see [RELEASE.md](./RELEASE.md)).

SPA fallback: GitHub Pages uses a copied `404.html`; Netlify/Vercel rewrite unknown paths to `/index.html`.

Full checklist: [RELEASE.md](./RELEASE.md).

## Testing instructions

```bash
# All workspace tests (Stencil specs + Vitest in apps/web)
npm test

# Stencil only
npm run test:ui

# Web app only
npm run test -w apps/web
```

Manual smoke after `npm run preview` or a deploy:

1. Home — search / featured recipes load from TheMealDB
2. `/recipes` — filters and results; open a detail page
3. Favorite a recipe; confirm `/favorites`
4. Create a recipe under `/my-recipes/new`; edit it
5. Assign meals on `/meal-planner`
6. Hard-refresh a deep link (e.g. `/meal-planner`) to confirm SPA fallback

## License

MIT
