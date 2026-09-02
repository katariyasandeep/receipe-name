# Release checklist — Recipe Finder

Use this checklist when publishing `@sandeep_saini/recipe-ui` and deploying `apps/web`.  
**Do not invent URLs.** Fill in the real npm / GitHub / live-app links in this file and in `README.md` only after each step succeeds.

---

## 0. Preconditions

- [ ] Node.js ≥ 18 installed
- [ ] `npm install` at monorepo root succeeds
- [ ] You have permission to publish the npm scope `@recipe-finder` (or change the package name / scope first)
- [ ] You have access to a static host (Vercel, Netlify, or GitHub Pages)
- [ ] Git remote exists when you are ready to push (this workspace may start without one)

---

## 1. Verify Stencil package locally

- [ ] `npm run build:ui` completes without errors
- [ ] `packages/recipe-ui/dist/` and `packages/recipe-ui/loader/` exist
- [ ] Package metadata looks correct (`name`, `version` `0.1.0`, `exports`, `files`, `publishConfig.access: public`)
- [ ] `npm pack -w @sandeep_saini/recipe-ui` (or `npm run pack:ui`) only includes `dist/`, `loader/`, `README.md`, `package.json` — **no** `src/`
- [ ] App depends on `@sandeep_saini/recipe-ui` (workspace / published name), not `packages/recipe-ui/src`

---

## 2. Publish `@sandeep_saini/recipe-ui` to npm

**Manual auth (required — do this yourself):**

```bash
npm login
```

Enter username, password, and OTP when prompted. Do not store tokens in the repo or paste them into chat.

**Publish:**

```bash
# From monorepo root (recommended)
npm publish -w @sandeep_saini/recipe-ui --access public

# Equivalent from the package directory
cd packages/recipe-ui
npm publish --access public
```

Notes:

- `prepublishOnly` runs `npm run build` (Stencil) before publish
- Scoped packages need `--access public` (also set in `publishConfig`)
- If publish fails with 403/404 on the scope, create an npm org named `recipe-finder` or rename the package

**After a successful publish:**

- [x] Confirm the package page loads: `https://www.npmjs.com/package/@sandeep_saini/recipe-ui`
- [x] Paste that URL into `README.md` (replace the npm placeholder)
- [x] Record version here: **published version:** `0.1.0`

---

## 3. Verify application production build

- [ ] `npm run build` at root succeeds (UI then web)
- [ ] Output directory: `apps/web/build/` contains `index.html` (SPA fallback)
- [ ] `npm run preview` serves the static build; deep links work (e.g. `/recipes`, `/meal-planner`)
- [ ] No API keys or secrets required; MealDB HTTPS base URL is production-safe
- [ ] Unexpected failures show `+error.svelte`; API failures use in-page retry banners

---

## 4. Deploy the static app

Choose **one** host. Config files are already in the repo:

| Host | Config | Publish directory |
|------|--------|-------------------|
| Netlify | `netlify.toml` (root) | `apps/web/build` |
| Vercel | `vercel.json` (root) | `apps/web/build` |
| GitHub Pages | Upload / Actions on `apps/web/build` | Ensure SPA fallback to `index.html` |

### Netlify (manual)

1. Log in to Netlify and create a new site from this Git repo (or drag-and-drop `apps/web/build` after a local build).
2. If linking the repo: build command `npm run build`, publish `apps/web/build` (matches root `netlify.toml`).
3. Confirm redirect `/* → /index.html` (200) is active for SPA routes.
4. After deploy, open a deep URL and refresh — it must not 404 at the host layer.

### Vercel (manual)

1. Log in to Vercel and import the Git repo (or `vercel` CLI from the monorepo root).
2. Root `vercel.json` sets build command `npm run build` and `outputDirectory` `apps/web/build`, plus SPA rewrites.
3. Deploy and verify deep-link refresh.

### GitHub Pages (manual)

1. Build locally: `npm run build`.
2. Publish contents of `apps/web/build` (gh-pages branch or Actions).
3. Configure the host so unknown paths fall back to `index.html`.

**After a successful deploy:**

- [ ] Paste the live URL into `README.md` (replace the deployed-app placeholder)
- [ ] Record here: **live app URL:** `________`

---

## 5. GitHub repository

- [x] Initialize / push git remote if missing
- [x] Paste the real repo URL into `README.md` (replace the GitHub placeholder)
- [x] Optionally add `repository` fields to root / `packages/recipe-ui` `package.json` **only with the real URL**
- [x] Record here: **GitHub URL:** `https://github.com/sandeepsaini01/recipe-finder`

---

## 6. Post-release smoke test

Against the **live** URL:

- [ ] Home loads recipes / search
- [ ] `/recipes` and `/recipes/mealdb:…` (or a known id) work
- [ ] Favorites, my-recipes CRUD, meal planner persist after refresh (same browser)
- [ ] Hard refresh on `/meal-planner` and `/favorites` still loads the app (SPA fallback)
- [ ] Network offline / MealDB error shows recoverable UI (banner + retry), not a blank shell

---

## 7. Version bump (later releases)

1. Bump `packages/recipe-ui` `version` (semver)
2. Align `apps/web` dependency range if needed
3. `npm publish -w @sandeep_saini/recipe-ui --access public`
4. Redeploy the app
5. Update links/version notes in `README.md`

---

## Links (fill after release — placeholders only until then)

| Artifact | URL |
|----------|-----|
| npm `@sandeep_saini/recipe-ui` | https://www.npmjs.com/package/@sandeep_saini/recipe-ui |
| GitHub repository | https://github.com/sandeepsaini01/recipe-finder |
| Deployed application | _Not deployed yet_ |

See also: [ARCHITECTURE.md](./ARCHITECTURE.md) §13–14, [INTEGRATION.md](./INTEGRATION.md).
