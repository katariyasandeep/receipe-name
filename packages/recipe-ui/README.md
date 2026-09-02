# @sandeep_saini/recipe-ui

Reusable **StencilJS** web components for the Recipe Finder & Meal Planner app.

- Presentational only (no API / localStorage / routing)
- Shadow DOM + `--rf-*` CSS custom properties for theming
- Strong props, `rf*` custom events, and named slots
- Consumed by SvelteKit via the **published** package (or built `dist` / `loader`) — never from `src/`

## Install

```bash
npm install @sandeep_saini/recipe-ui
```

## Register in the host app

```ts
import { defineCustomElements } from '@sandeep_saini/recipe-ui/loader';

defineCustomElements();
```

Then use tags such as `<rf-recipe-card>`, `<rf-search-bar>`, etc.

## Theming

Override CSS variables on `:root` or a parent:

| Variable | Purpose |
|----------|---------|
| `--rf-color-primary` | Primary actions |
| `--rf-color-text` | Body text |
| `--rf-color-surface` | Subtle backgrounds |
| `--rf-color-border` | Borders |
| `--rf-color-favorite` | Favorite heart |
| `--rf-radius-md` | Control radius |
| `--rf-font-sans` | Font family |

## Components

### `rf-button`

| | |
|--|--|
| **Props** | `variant` (`primary` \| `secondary` \| `ghost` \| `danger`), `type`, `disabled`, `ariaLabel` |
| **Events** | `rfClick` |
| **Slots** | default (label) |

### `rf-input`

| | |
|--|--|
| **Props** | `label`, `value`, `name`, `type`, `placeholder`, `error`, `disabled`, `required` |
| **Events** | `rfInput`, `rfChange` |
| **Slots** | `hint` |

### `rf-select`

| | |
|--|--|
| **Props** | `label`, `value`, `name`, `options` (`SelectOption[]`), `error`, `disabled`, `placeholder`, `required` |
| **Events** | `rfChange` |

### `rf-search-bar`

| | |
|--|--|
| **Props** | `value`, `placeholder`, `loading`, `disabled`, `label`, `submitLabel` |
| **Events** | `rfSearch` → `{ query: string }` |
| **Slots** | `actions` |

### `rf-filter-panel`

| | |
|--|--|
| **Props** | `categories`, `areas`, `value` (`RecipeFilterValue`), `showIngredient` |
| **Events** | `rfFilterChange` → `RecipeFilterValue` |

### `rf-recipe-card`

| | |
|--|--|
| **Props** | `recipe` (`RecipeSearchResult`), `favorited`, `hideFavorite` |
| **Events** | `rfRecipeSelect`, `rfFavoriteToggle` |
| **Slots** | `badge`, `actions` |

### `rf-recipe-grid`

| | |
|--|--|
| **Props** | `recipes`, `favoritedIds`, `label` |
| **Events** | `rfRecipeSelect`, `rfFavoriteToggle` (re-emitted from cards) |
| **Slots** | `empty` |

### `rf-favorite-button`

| | |
|--|--|
| **Props** | `active`, `disabled`, `labelInactive`, `labelActive` |
| **Events** | `rfToggle` → `{ active: boolean }` |

### `rf-recipe-form`

| | |
|--|--|
| **Props** | `value` (`UserRecipeDraft`), `errors`, `submitLabel`, `disabled` |
| **Events** | `rfChange`, `rfSubmit` |
| **Slots** | `footer` |

Draft fields: title, description, category, area, tags (comma-separated), image URL, prep/cook minutes, servings, ingredients, instructions.

Validation rules live in the host app; pass messages via `errors`.

### `rf-meal-plan-card`

| | |
|--|--|
| **Props** | `meal`, `day`, `mealSlot` (HTML attribute `meal-slot` — avoids clashing with the HTML `slot` attribute) |
| **Events** | `rfRemove`, `rfSelect` |

### `rf-meal-plan-week`

| | |
|--|--|
| **Props** | `weekStart`, `meals` |
| **Events** | `rfSlotClick`, `rfMealRemove`, `rfMealMove` |
| **Slots** | `header` |

Supports basic HTML5 drag-and-drop; emits `rfMealMove` with `{ mealId, toDay, toSlot }`.

### `rf-modal`

| | |
|--|--|
| **Props** | `open`, `heading`, `closeOnBackdrop` |
| **Events** | `rfClose` |
| **Slots** | default, `footer` |

Keyboard: **Escape** closes; **Tab** is trapped while open.

### `rf-empty-state`

| | |
|--|--|
| **Props** | `heading`, `message` |
| **Slots** | `action` |

### `rf-loading-state`

| | |
|--|--|
| **Props** | `label` |

## Development

From the monorepo root:

```bash
npm install
npm run build:ui
npm run test:ui
```

Or inside this package:

```bash
cd packages/recipe-ui
npm run build    # stencil build → dist/ + loader/
npm run test     # unit specs
npm start        # dev server
```

## Publish

```bash
cd packages/recipe-ui
npm run build
npm publish --access public
```

Published artifacts: `dist/`, `loader/`, `README.md`, `package.json` (see `.npmignore`).

## Accessibility notes

- Form controls use associated labels and `aria-invalid` / `role="alert"` for errors
- Favorite toggle uses `aria-pressed`
- Modal uses `role="dialog"`, `aria-modal`, Escape, and a basic focus trap
- Recipe cards and meal cells are keyboard-activatable (Enter / Space)
- Loading / empty states expose `role="status"`

## License

MIT
