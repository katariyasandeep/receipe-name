import { describe, expect, it, vi } from 'vitest';
import { ApiError } from '$lib/api/errors';
import { RecipesService } from '$lib/api/recipes-service';
import {
  sampleFilterItem,
  sampleFilterItemB,
  sampleMeal
} from '$lib/api/__fixtures__/meals';

function jsonResponse(body: unknown, init?: { status?: number }): Response {
  return new Response(JSON.stringify(body), {
    status: init?.status ?? 200,
    headers: { 'Content-Type': 'application/json' }
  });
}

function createFetch(handler: (url: URL) => Response | Promise<Response>) {
  return vi.fn(async (input: RequestInfo | URL) => {
    const url = new URL(typeof input === 'string' ? input : input.toString());
    return handler(url);
  });
}

describe('RecipesService', () => {
  it('searches by name and maps results', async () => {
    const fetchFn = createFetch((url) => {
      expect(url.pathname.endsWith('/search.php')).toBe(true);
      expect(url.searchParams.get('s')).toBe('chicken');
      return jsonResponse({ meals: [sampleMeal] });
    });

    const service = new RecipesService({ fetchFn });
    const result = await service.search('  chicken  ');

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.empty).toBe(false);
    expect(result.data).toEqual([
      {
        id: 'mealdb:52772',
        title: 'Teriyaki Chicken Casserole',
        thumbnailUrl: sampleMeal.strMealThumb,
        category: 'Chicken',
        area: 'Japanese'
      }
    ]);
  });

  it('returns empty success when search finds nothing', async () => {
    const fetchFn = createFetch(() => jsonResponse({ meals: null }));
    const service = new RecipesService({ fetchFn });
    const result = await service.search('zzzz');

    expect(result).toEqual({ ok: true, data: [], empty: true });
  });

  it('returns empty success for blank search without calling the API', async () => {
    const fetchFn = createFetch(() => jsonResponse({ meals: [] }));
    const service = new RecipesService({ fetchFn });
    const result = await service.search('   ');
    expect(result).toEqual({ ok: true, data: [], empty: true });
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it('browses by letter', async () => {
    const fetchFn = createFetch((url) => {
      expect(url.searchParams.get('f')).toBe('a');
      return jsonResponse({ meals: [sampleMeal] });
    });
    const service = new RecipesService({ fetchFn });
    const result = await service.browse('A');
    expect(result.ok && result.data).toHaveLength(1);
  });

  it('rejects invalid browse letters', async () => {
    const service = new RecipesService({ fetchFn: createFetch(() => jsonResponse({})) });
    const result = await service.browse('1');
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.code).toBe('invalid_id');
  });

  it('filters by category using lightweight items', async () => {
    const fetchFn = createFetch((url) => {
      expect(url.pathname.endsWith('/filter.php')).toBe(true);
      expect(url.searchParams.get('c')).toBe('Chicken');
      return jsonResponse({ meals: [sampleFilterItem] });
    });
    const service = new RecipesService({ fetchFn });
    const result = await service.filter({ category: 'Chicken' });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data[0]).toMatchObject({
      id: 'mealdb:52772',
      title: 'Teriyaki Chicken Casserole'
    });
    expect(result.data[0].category).toBeUndefined();
  });

  it('intersects multiple filter facets by id', async () => {
    const fetchFn = createFetch((url) => {
      if (url.searchParams.get('c')) {
        return jsonResponse({ meals: [sampleFilterItem, sampleFilterItemB] });
      }
      if (url.searchParams.get('a')) {
        return jsonResponse({ meals: [sampleFilterItem] });
      }
      return jsonResponse({ meals: null });
    });

    const service = new RecipesService({ fetchFn });
    const result = await service.filter({ category: 'Chicken', area: 'Japanese' });

    expect(result.ok && result.data.map((r) => r.id)).toEqual(['mealdb:52772']);
  });

  it('loads recipe detail and caches subsequent lookups', async () => {
    const fetchFn = createFetch((url) => {
      expect(url.pathname.endsWith('/lookup.php')).toBe(true);
      expect(url.searchParams.get('i')).toBe('52772');
      return jsonResponse({ meals: [sampleMeal] });
    });

    const service = new RecipesService({ fetchFn });
    const first = await service.getById('mealdb:52772');
    const second = await service.getById('52772');

    expect(first.ok).toBe(true);
    if (!first.ok) return;
    expect(first.data.title).toBe('Teriyaki Chicken Casserole');
    expect(first.data.ingredients.length).toBe(9);
    expect(second.ok).toBe(true);
    expect(fetchFn).toHaveBeenCalledTimes(1);
  });

  it('returns not_found when lookup has no meal', async () => {
    const fetchFn = createFetch(() => jsonResponse({ meals: null }));
    const service = new RecipesService({ fetchFn });
    const result = await service.getById('mealdb:999');

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toBeInstanceOf(ApiError);
    expect(result.error.code).toBe('not_found');
  });

  it('rejects user recipe ids on the MealDB service', async () => {
    const service = new RecipesService({ fetchFn: createFetch(() => jsonResponse({})) });
    const result = await service.getById('user:abc');
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.code).toBe('invalid_id');
  });

  it('maps network failures to ApiError', async () => {
    const fetchFn = vi.fn(async () => {
      throw new TypeError('Failed to fetch');
    });
    const service = new RecipesService({ fetchFn });
    const result = await service.search('pasta');

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.code).toBe('network');
  });

  it('maps HTTP errors to ApiError', async () => {
    const fetchFn = createFetch(() => jsonResponse({ message: 'nope' }, { status: 500 }));
    const service = new RecipesService({ fetchFn });
    const result = await service.search('pasta');

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.code).toBe('http');
    expect(result.error.status).toBe(500);
  });

  it('lists category and area facets', async () => {
    const fetchFn = createFetch((url) => {
      if (url.searchParams.get('c') === 'list') {
        return jsonResponse({ meals: [{ strCategory: 'Beef' }, { strCategory: 'Chicken' }] });
      }
      if (url.searchParams.get('a') === 'list') {
        return jsonResponse({ meals: [{ strArea: 'Italian' }, { strArea: 'Canadian' }] });
      }
      return jsonResponse({ meals: null });
    });

    const service = new RecipesService({ fetchFn });
    const result = await service.listFacets();

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.categories).toEqual(['Beef', 'Chicken']);
    expect(result.data.areas).toEqual(['Canadian', 'Italian']);
  });

  it('find() intersects query search with facet filters', async () => {
    const fetchFn = createFetch((url) => {
      if (url.searchParams.has('s')) {
        return jsonResponse({
          meals: [sampleMeal, { ...sampleMeal, idMeal: '52804', strMeal: 'Poutine' }]
        });
      }
      if (url.searchParams.get('c')) {
        return jsonResponse({ meals: [sampleFilterItem] });
      }
      return jsonResponse({ meals: null });
    });

    const service = new RecipesService({ fetchFn });
    const result = await service.find({ query: 'chicken', category: 'Chicken' });

    expect(result.ok && result.data.map((r) => r.id)).toEqual(['mealdb:52772']);
  });
});
