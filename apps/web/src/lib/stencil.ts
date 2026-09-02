import { browser } from '$app/environment';

let registered = false;

/**
 * Register Stencil custom elements once on the client.
 *
 * Uses dist-custom-elements (eager) so Vite bundles component code into the app.
 * Avoids the lazy `loader` + `resourcesUrl` path, which breaks under GitHub Pages
 * base paths like `/receipe-name/`.
 *
 * Imports the published package outputs — never packages/recipe-ui/src.
 */
export async function registerRecipeUi(): Promise<void> {
  if (!browser || registered) return;

  await Promise.all([
    import('@sandeep_saini/recipe-ui/components/rf-button.js'),
    import('@sandeep_saini/recipe-ui/components/rf-input.js'),
    import('@sandeep_saini/recipe-ui/components/rf-select.js'),
    import('@sandeep_saini/recipe-ui/components/rf-search-bar.js'),
    import('@sandeep_saini/recipe-ui/components/rf-filter-panel.js'),
    import('@sandeep_saini/recipe-ui/components/rf-recipe-card.js'),
    import('@sandeep_saini/recipe-ui/components/rf-recipe-grid.js'),
    import('@sandeep_saini/recipe-ui/components/rf-favorite-button.js'),
    import('@sandeep_saini/recipe-ui/components/rf-recipe-form.js'),
    import('@sandeep_saini/recipe-ui/components/rf-meal-plan-card.js'),
    import('@sandeep_saini/recipe-ui/components/rf-meal-plan-week.js'),
    import('@sandeep_saini/recipe-ui/components/rf-modal.js'),
    import('@sandeep_saini/recipe-ui/components/rf-empty-state.js'),
    import('@sandeep_saini/recipe-ui/components/rf-loading-state.js')
  ]);

  registered = true;
}
