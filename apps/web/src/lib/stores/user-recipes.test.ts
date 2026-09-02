import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('$app/environment', () => ({
  browser: true
}));

function installMemoryStorage() {
  const map = new Map<string, string>();
  const storage: Storage = {
    get length() {
      return map.size;
    },
    clear() {
      map.clear();
    },
    getItem(key: string) {
      return map.has(key) ? map.get(key)! : null;
    },
    key(index: number) {
      return [...map.keys()][index] ?? null;
    },
    removeItem(key: string) {
      map.delete(key);
    },
    setItem(key: string, value: string) {
      map.set(key, value);
    }
  };
  vi.stubGlobal('localStorage', storage);
  return storage;
}

describe('userRecipes store CRUD', () => {
  beforeEach(() => {
    installMemoryStorage();
    vi.resetModules();
  });

  async function loadStore() {
    const mod = await import('$lib/stores/user-recipes.svelte');
    return mod.userRecipes;
  }

  const draft = {
    title: 'Pasta Primavera',
    description: 'Veggies and pasta',
    category: 'Pasta',
    area: 'Italian',
    thumbnailUrl: 'https://example.com/pasta.jpg',
    ingredients: [{ name: 'Pasta', measure: '200g' }],
    instructions: 'Boil pasta, toss with sauteed vegetables, serve warm.',
    tags: ['weeknight'],
    prepTimeMinutes: 15,
    cookTimeMinutes: 20,
    servings: 2
  };

  it('creates, reads, updates, and deletes a user recipe', async () => {
    const store = await loadStore();

    const created = store.createFromDraft(draft);
    expect(created.ok).toBe(true);
    if (!created.ok) return;

    expect(created.data.id.startsWith('user:')).toBe(true);
    expect(store.items).toHaveLength(1);
    expect(store.getById(created.data.id)?.title).toBe('Pasta Primavera');

    const updated = store.updateFromDraft(created.data.id, {
      ...draft,
      title: 'Spring Pasta',
      servings: 3
    });
    expect(updated.ok).toBe(true);
    if (!updated.ok) return;
    expect(updated.data.title).toBe('Spring Pasta');
    expect(updated.data.servings).toBe(3);
    expect(updated.data.createdAt).toBe(created.data.createdAt);
    expect(updated.data.updatedAt >= created.data.updatedAt).toBe(true);

    const removed = store.remove(created.data.id);
    expect(removed.ok).toBe(true);
    expect(store.items).toHaveLength(0);
    expect(store.getById(created.data.id)).toBeUndefined();
  });

  it('returns not_found when updating or deleting a missing id', async () => {
    const store = await loadStore();
    expect(store.updateFromDraft('user:missing', draft)).toEqual({
      ok: false,
      error: 'not_found'
    });
    expect(store.remove('user:missing')).toEqual({
      ok: false,
      error: 'not_found'
    });
  });

  it('rolls back and reports persist failure when localStorage throws', async () => {
    const storage = installMemoryStorage();
    storage.setItem = () => {
      throw new Error('QuotaExceededError');
    };

    const store = await loadStore();
    const created = store.createFromDraft(draft);
    expect(created.ok).toBe(false);
    if (created.ok) return;
    expect(created.error).toBe('persist');
    expect(store.items).toHaveLength(0);
    expect(store.lastPersistError).toMatch(/Could not save/i);
  });

  it('hydrates from existing localStorage data', async () => {
    localStorage.setItem(
      'rf:user-recipes',
      JSON.stringify([
        {
          id: 'user:abc',
          source: 'user',
          title: 'Stored Soup',
          ingredients: [{ name: 'Water', measure: '1 cup' }],
          instructions: 'Heat and serve with bread on the side.',
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z'
        }
      ])
    );

    const store = await loadStore();
    expect(store.items).toHaveLength(1);
    expect(store.getById('user:abc')?.title).toBe('Stored Soup');
  });
});
