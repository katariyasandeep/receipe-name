import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { RecipeSearchResult } from '$lib/types';

const memory = new Map<string, string>();

vi.mock('$app/environment', () => ({
  browser: true
}));

vi.stubGlobal('localStorage', {
  getItem: (key: string) => memory.get(key) ?? null,
  setItem: (key: string, value: string) => {
    memory.set(key, String(value));
  },
  removeItem: (key: string) => {
    memory.delete(key);
  },
  clear: () => {
    memory.clear();
  }
});

const chicken: RecipeSearchResult = {
  id: 'mealdb:52772',
  title: 'Teriyaki Chicken Casserole',
  thumbnailUrl: 'https://example.com/chicken.jpg',
  category: 'Chicken',
  area: 'Japanese'
};

const pasta: RecipeSearchResult = {
  id: 'mealdb:52844',
  title: 'Lasagne',
  thumbnailUrl: 'https://example.com/pasta.jpg',
  category: 'Pasta',
  area: 'Italian'
};

describe('favorites store', () => {
  beforeEach(() => {
    memory.clear();
    vi.resetModules();
  });

  async function loadStore() {
    const mod = await import('./favorites.svelte');
    return mod.createFavoritesStore();
  }

  it('starts empty (empty state)', async () => {
    const store = await loadStore();
    expect(store.isEmpty).toBe(true);
    expect(store.items).toEqual([]);
    expect(store.ids).toEqual([]);
  });

  it('adds a favorite', async () => {
    const store = await loadStore();
    store.add(chicken);

    expect(store.isEmpty).toBe(false);
    expect(store.isFavorite(chicken.id)).toBe(true);
    expect(store.ids).toEqual([chicken.id]);
    expect(store.items).toHaveLength(1);
    expect(store.items[0]?.snapshot).toEqual(chicken);
    expect(store.items[0]?.savedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('removes a favorite', async () => {
    const store = await loadStore();
    store.add(chicken);
    store.add(pasta);
    store.remove(chicken.id);

    expect(store.isFavorite(chicken.id)).toBe(false);
    expect(store.isFavorite(pasta.id)).toBe(true);
    expect(store.ids).toEqual([pasta.id]);
    expect(store.items.map((f) => f.snapshot.title)).toEqual(['Lasagne']);
  });

  it('prevents duplicate favorites', async () => {
    const store = await loadStore();
    store.add(chicken);
    store.add({ ...chicken, title: 'Updated title should not replace' });
    store.add(chicken);

    expect(store.items).toHaveLength(1);
    expect(store.items[0]?.snapshot.title).toBe('Teriyaki Chicken Casserole');
  });

  it('lists all favorite recipes via items / ids', async () => {
    const store = await loadStore();
    store.add(pasta);
    store.add(chicken);

    expect(store.items.map((f) => f.recipeId)).toEqual([pasta.id, chicken.id]);
    expect(store.ids).toEqual([pasta.id, chicken.id]);
    expect(store.items.map((f) => f.snapshot)).toEqual([pasta, chicken]);
  });

  it('setFavorite mirrors Stencil rfToggle / rfFavoriteToggle active flag', async () => {
    const store = await loadStore();
    store.setFavorite(chicken, true);
    expect(store.isFavorite(chicken.id)).toBe(true);

    store.setFavorite(chicken, true);
    expect(store.items).toHaveLength(1);

    store.setFavorite(chicken, false);
    expect(store.isFavorite(chicken.id)).toBe(false);
    expect(store.isEmpty).toBe(true);
  });

  it('persists to localStorage and rehydrates', async () => {
    const first = await loadStore();
    first.add(chicken);
    first.add(pasta);

    const raw = memory.get('rf:favorites');
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw!) as unknown[];
    expect(parsed).toHaveLength(2);

    vi.resetModules();
    const second = await loadStore();
    expect(second.ids).toEqual([chicken.id, pasta.id]);
    expect(second.isFavorite(chicken.id)).toBe(true);
  });

  it('clear restores empty state and persistence', async () => {
    const store = await loadStore();
    store.add(chicken);
    store.clear();

    expect(store.isEmpty).toBe(true);
    expect(store.items).toEqual([]);
    expect(JSON.parse(memory.get('rf:favorites') ?? '[]')).toEqual([]);
  });
});
