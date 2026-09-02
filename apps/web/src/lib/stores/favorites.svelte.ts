import { browser } from '$app/environment';
import type { Favorite, RecipeId, RecipeSearchResult } from '$lib/types';
import { loadJson, saveJson } from '$lib/utils/storage';

const KEY = 'rf:favorites';

/**
 * Favorites store — shared across routes, persisted to `rf:favorites`.
 * Stencil components stay presentational; Svelte listens to `rfToggle` /
 * `rfFavoriteToggle` and calls these methods (no full-page reload).
 */
export function createFavoritesStore() {
  let items = $state<Favorite[]>([]);
  let ready = false;

  function ensureHydrated() {
    if (!browser || ready) return;
    const loaded = loadJson<Favorite[]>(KEY, []);
    items = Array.isArray(loaded) ? loaded : [];
    ready = true;
  }

  function persist() {
    if (!browser) return;
    if (!saveJson(KEY, items)) {
      console.warn('[favorites] Could not save locally');
    }
  }

  return {
    get items() {
      ensureHydrated();
      return items;
    },
    get ids(): RecipeId[] {
      ensureHydrated();
      return items.map((f) => f.recipeId);
    },
    /** True when there are no favorites (empty-state UI). */
    get isEmpty(): boolean {
      ensureHydrated();
      return items.length === 0;
    },
    isFavorite(id: RecipeId): boolean {
      ensureHydrated();
      return items.some((f) => f.recipeId === id);
    },
    /** Add a favorite; no-ops if the recipe id is already saved. */
    add(snapshot: RecipeSearchResult) {
      ensureHydrated();
      if (items.some((f) => f.recipeId === snapshot.id)) return;
      items = [
        ...items,
        { recipeId: snapshot.id, savedAt: new Date().toISOString(), snapshot }
      ];
      persist();
    },
    remove(id: RecipeId) {
      ensureHydrated();
      items = items.filter((f) => f.recipeId !== id);
      persist();
    },
    /**
     * Apply the intended favorite state from a Stencil event (`active`).
     * Prefer this over `toggle` when handling `rfToggle` / `rfFavoriteToggle`.
     */
    setFavorite(snapshot: RecipeSearchResult, active: boolean) {
      if (active) this.add(snapshot);
      else this.remove(snapshot.id);
    },
    toggle(snapshot: RecipeSearchResult) {
      ensureHydrated();
      if (items.some((f) => f.recipeId === snapshot.id)) {
        this.remove(snapshot.id);
        return false;
      }
      this.add(snapshot);
      return true;
    },
    /** Remove all favorites (also useful to reset state in tests). */
    clear() {
      ensureHydrated();
      items = [];
      persist();
    }
  };
}

export const favorites = createFavoritesStore();
