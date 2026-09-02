# Recipe Finder & Meal Planner

Discover meals from [TheMealDB](https://www.themealdb.com/), save favorites, create your own recipes, and plan a week of meals — all in the browser.

## Project overview

This is an npm-workspaces monorepo:

| Package | Role |
|---------|------|
| `apps/web` | SvelteKit (Svelte 5) application |
| `packages/recipe-ui` | StencilJS web-component library (`@recipe-finder/recipe-ui`) |

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
- Stencil must be built before the web app can resolve `@recipe-finder/recipe-ui`

## Setup instructions

**Requirements:** Node.js 18+ and npm 9+ (workspaces).

```bash
# From the monorepo root
npm install
npm run build:ui    # builds @recipe-finder/recipe-ui (dist + loader)
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

## Stencil library (`@recipe-finder/recipe-ui`)

- **Version:** `0.1.0` (semver)
- **Publish access:** public scoped package (`publishConfig.access: public`)
- **Entries:** main package + `@recipe-finder/recipe-ui/loader` (`defineCustomElements`)
- **Artifacts published:** `dist/`, `loader/`, `README.md` (source/tests excluded via `.npmignore` + `files`)
- **Local monorepo:** `apps/web` depends on `"@recipe-finder/recipe-ui": "^0.1.0"` resolved through workspaces to the package’s built outputs

Package docs: [packages/recipe-ui/README.md](./packages/recipe-ui/README.md)

### npm package link

> **Not published yet.** After you publish (see [RELEASE.md](./RELEASE.md)), replace this placeholder:

```text
npm: https://www.npmjs.com/package/@recipe-finder/recipe-ui
```

### Manual publish steps (credentials required)

1. Create an [npm](https://www.npmjs.com/) account and verify email.
2. If the `@recipe-finder` scope is new to you, ensure you can publish under that scope (org membership or first-time scoped publish).
3. In a terminal:

```bash
npm login
# Interactive: username, password/OTP, email — do this yourself; do not paste tokens into chat.

cd packages/recipe-ui
# Or from root:
npm publish -w @recipe-finder/recipe-ui --access public
```

`prepublishOnly` runs `stencil build` automatically before publish.

## GitHub repository link

```text
GitHub: https://github.com/sandeepsaini01/recipe-finder
```

## Deployed application URL

> **Not deployed yet.** After you deploy (Vercel, Netlify, or GitHub Pages), replace this placeholder:

```text
Live app: <YOUR_DEPLOYED_APP_URL>
```

Static hosting config is included:

- Root [`vercel.json`](./vercel.json) / [`netlify.toml`](./netlify.toml)
- App-level copies under `apps/web/` if you point the host at that folder

SPA fallback rewrites unknown paths to `/index.html` so client routes work on refresh.

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
