import { browser } from '$app/environment';
import type { UserRecipe, UserRecipeDraft } from '$lib/types';
import { draftToUserRecipe } from '$lib/utils/user-recipe-draft';
import { loadJson, saveJson } from '$lib/utils/storage';

const KEY = 'rf:user-recipes';

export type PersistFailure = 'persist' | 'not_found';

export type PersistResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: PersistFailure };

/**
 * User-created recipes — CRUD + localStorage persistence.
 * Validation stays in `$lib/validation`; this store only persists domain entities.
 */
function createUserRecipesStore() {
  let items = $state<UserRecipe[]>([]);
  let ready = false;
  let lastPersistError = $state<string | null>(null);

  function ensureHydrated() {
    if (!browser || ready) return;
    const loaded = loadJson<UserRecipe[]>(KEY, []);
    items = Array.isArray(loaded) ? loaded : [];
    ready = true;
  }

  function persist(): boolean {
    if (!browser) return true;
    const ok = saveJson(KEY, items);
    if (!ok) {
      lastPersistError = 'Could not save locally. Storage may be full or blocked.';
      console.warn('[user-recipes] Could not save locally');
      return false;
    }
    lastPersistError = null;
    return true;
  }

  function upsert(recipe: UserRecipe): boolean {
    ensureHydrated();
    const idx = items.findIndex((r) => r.id === recipe.id);
    const previous = items;
    if (idx === -1) {
      items = [...items, recipe];
    } else {
      items = items.map((r, i) => (i === idx ? recipe : r));
    }
    if (!persist()) {
      items = previous;
      return false;
    }
    return true;
  }

  return {
    get items() {
      ensureHydrated();
      return items;
    },
    get lastPersistError() {
      return lastPersistError;
    },
    clearPersistError() {
      lastPersistError = null;
    },
    getById(id: string): UserRecipe | undefined {
      ensureHydrated();
      return items.find((r) => r.id === id);
    },
    upsert,
    createFromDraft(draft: UserRecipeDraft): PersistResult<UserRecipe> {
      ensureHydrated();
      const recipe = draftToUserRecipe(draft);
      if (!upsert(recipe)) {
        return { ok: false, error: 'persist' };
      }
      return { ok: true, data: recipe };
    },
    updateFromDraft(id: string, draft: UserRecipeDraft): PersistResult<UserRecipe> {
      ensureHydrated();
      const existing = items.find((r) => r.id === id);
      if (!existing) {
        return { ok: false, error: 'not_found' };
      }
      const recipe = draftToUserRecipe({ ...draft, id }, existing);
      if (!upsert(recipe)) {
        return { ok: false, error: 'persist' };
      }
      return { ok: true, data: recipe };
    },
    remove(id: string): PersistResult<void> {
      ensureHydrated();
      const previous = items;
      if (!items.some((r) => r.id === id)) {
        return { ok: false, error: 'not_found' };
      }
      items = items.filter((r) => r.id !== id);
      if (!persist()) {
        items = previous;
        return { ok: false, error: 'persist' };
      }
      return { ok: true, data: undefined };
    }
  };
}

export const userRecipes = createUserRecipesStore();
