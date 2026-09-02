import { browser } from '$app/environment';

let registered = false;

/**
 * Register Stencil custom elements once on the client.
 * Imports the published package loader — never packages/recipe-ui/src.
 */
export async function registerRecipeUi(): Promise<void> {
  if (!browser || registered) return;
  const { defineCustomElements } = await import('@sandeep_saini/recipe-ui/loader');
  await defineCustomElements();
  registered = true;
}
