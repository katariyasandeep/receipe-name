import '@sveltejs/kit';

declare global {
  namespace App {
    // interface Error {}
    // interface Locals {}
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }

  /**
   * Minimal typings for Stencil custom elements used in Svelte templates.
   * Full prop contracts live in @sandeep_saini/recipe-ui.
   */
  namespace svelteHTML {
    interface IntrinsicElements {
      'rf-button': Record<string, unknown>;
      'rf-input': Record<string, unknown>;
      'rf-select': Record<string, unknown>;
      'rf-search-bar': Record<string, unknown>;
      'rf-filter-panel': Record<string, unknown>;
      'rf-recipe-card': Record<string, unknown>;
      'rf-recipe-grid': Record<string, unknown>;
      'rf-favorite-button': Record<string, unknown>;
      'rf-recipe-form': Record<string, unknown>;
      'rf-meal-plan-week': Record<string, unknown>;
      'rf-meal-plan-card': Record<string, unknown>;
      'rf-modal': Record<string, unknown>;
      'rf-empty-state': Record<string, unknown>;
      'rf-loading-state': Record<string, unknown>;
    }
  }
}

export {};
