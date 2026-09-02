import type { Recipe, RecipeFilter, RecipeSearchResult } from '$lib/types';
import { parseRecipeId } from '$lib/utils/ids';
import { TtlCache } from './cache';
import { ApiError, isApiError } from './errors';
import { MealDbClient, type MealDbClientOptions } from './mealdb-client';
import type { MealDbArea, MealDbCategory, MealDbFilterItem, MealDbMeal } from './mealdb-types';
import {
  mapFilterItemToSearchResult,
  mapMealToRecipe,
  mapMealToSearchResult
} from './mappers';
import { fail, ok, type ApiResult } from './result';

export interface RecipesServiceOptions extends MealDbClientOptions {
  /** Lookup cache TTL in ms (default 5 minutes). */
  cacheTtlMs?: number;
}

export interface RecipeFacetLists {
  categories: string[];
  areas: string[];
}

/**
 * UI-facing recipe API. Pages/stores call this — never TheMealDB client directly.
 *
 * Loading: wrap calls with `createRequestState` (or page `$state`) — this service
 * returns settled `ApiResult` values; it does not hold global loading flags.
 *
 * Empty results: `ok: true` with `data: []` and `empty: true`.
 */
export class RecipesService {
  private readonly client: MealDbClient;
  private readonly detailCache: TtlCache<Recipe>;

  constructor(options: RecipesServiceOptions = {}) {
    this.client = new MealDbClient(options);
    this.detailCache = new TtlCache(options.cacheTtlMs ?? 5 * 60 * 1000);
  }

  /** Search by name (`search.php?s=`). */
  async search(query: string): Promise<ApiResult<RecipeSearchResult[]>> {
    const q = query.trim();
    if (!q) return ok([], true);

    return this.run(async () => {
      const response = await this.client.searchByName(q);
      return mapMealsToSearchResults(response.meals);
    });
  }

  /** Browse by first letter (`search.php?f=`). */
  async browse(letter: string): Promise<ApiResult<RecipeSearchResult[]>> {
    const f = letter.trim().charAt(0);
    if (!f || !/[a-z]/i.test(f)) {
      return fail(new ApiError('Browse letter must be A–Z.', 'invalid_id'));
    }

    return this.run(async () => {
      const response = await this.client.browseByLetter(f);
      return mapMealsToSearchResults(response.meals);
    });
  }

  /**
   * Filter by category, area, and/or main ingredient.
   * When multiple filters are set, results are intersected by recipe id.
   * `query` / `letter` are ignored here — use `search` / `browse` or `find`.
   */
  async filter(filter: Pick<RecipeFilter, 'category' | 'area' | 'ingredient'>): Promise<
    ApiResult<RecipeSearchResult[]>
  > {
    const category = filter.category?.trim();
    const area = filter.area?.trim();
    const ingredient = filter.ingredient?.trim();

    if (!category && !area && !ingredient) {
      return ok([], true);
    }

    return this.run(async () => {
      const buckets: RecipeSearchResult[][] = [];

      if (category) {
        const res = await this.client.filterByCategory(category);
        buckets.push(mapFilterItems(res.meals));
      }
      if (area) {
        const res = await this.client.filterByArea(area);
        buckets.push(mapFilterItems(res.meals));
      }
      if (ingredient) {
        const res = await this.client.filterByIngredient(ingredient);
        buckets.push(mapFilterItems(res.meals));
      }

      return intersectById(buckets);
    });
  }

  /**
   * Combined discovery: applies query / letter / category / area / ingredient
   * according to RecipeFilter. Prefer the most specific remote call, then
   * intersect client-side when combining search text with facet filters.
   */
  async find(filter: RecipeFilter): Promise<ApiResult<RecipeSearchResult[]>> {
    const query = filter.query?.trim();
    const letter = filter.letter?.trim().charAt(0);
    const hasFacets = Boolean(
      filter.category?.trim() || filter.area?.trim() || filter.ingredient?.trim()
    );

    if (query) {
      const searchResult = await this.search(query);
      if (!searchResult.ok) return searchResult;
      if (!hasFacets) return searchResult;

      const facetResult = await this.filter(filter);
      if (!facetResult.ok) return facetResult;
      return ok(intersectById([searchResult.data, facetResult.data]));
    }

    if (letter) {
      const browseResult = await this.browse(letter);
      if (!browseResult.ok) return browseResult;
      if (!hasFacets) return browseResult;

      const facetResult = await this.filter(filter);
      if (!facetResult.ok) return facetResult;
      return ok(intersectById([browseResult.data, facetResult.data]));
    }

    if (hasFacets) return this.filter(filter);

    return ok([], true);
  }

  /** Full recipe detail (`lookup.php?i=`). Accepts `mealdb:{id}` or raw MealDB id. */
  async getById(id: string): Promise<ApiResult<Recipe>> {
    const parsed = parseRecipeId(id.startsWith('mealdb:') || id.startsWith('user:') ? id : `mealdb:${id}`);

    if (!parsed) {
      return fail(new ApiError(`Invalid recipe id: ${id}`, 'invalid_id'));
    }
    if (parsed.source !== 'mealdb') {
      return fail(
        new ApiError('User recipes are loaded from local storage, not TheMealDB.', 'invalid_id')
      );
    }

    const cacheKey = parsed.rawId;
    const cached = this.detailCache.get(cacheKey);
    if (cached) return ok(cached, false);

    return this.run(async () => {
      const response = await this.client.lookupById(parsed.rawId);
      const meal = response.meals?.[0];
      if (!meal) {
        throw new ApiError(`Recipe not found: ${id}`, 'not_found');
      }
      const recipe = mapMealToRecipe(meal);
      this.detailCache.set(cacheKey, recipe);
      return recipe;
    });
  }

  async getRandom(): Promise<ApiResult<Recipe>> {
    return this.run(async () => {
      const response = await this.client.random();
      const meal = response.meals?.[0];
      if (!meal) {
        throw new ApiError('No random recipe available.', 'not_found');
      }
      const recipe = mapMealToRecipe(meal);
      this.detailCache.set(parseRawId(recipe.id), recipe);
      return recipe;
    });
  }

  async listFacets(): Promise<ApiResult<RecipeFacetLists>> {
    return this.run(async () => {
      const [categoriesRes, areasRes] = await Promise.all([
        this.client.listCategories(),
        this.client.listAreas()
      ]);

      const categories = (categoriesRes.meals ?? [])
        .map((m) => (m as MealDbCategory).strCategory?.trim())
        .filter((v): v is string => Boolean(v))
        .sort((a, b) => a.localeCompare(b));

      const areas = (areasRes.meals ?? [])
        .map((m) => (m as MealDbArea).strArea?.trim())
        .filter((v): v is string => Boolean(v))
        .sort((a, b) => a.localeCompare(b));

      return { categories, areas };
    });
  }

  clearCache(): void {
    this.detailCache.clear();
  }

  private async run<T>(fn: () => Promise<T>): Promise<ApiResult<T>> {
    try {
      const data = await fn();
      return ok(data);
    } catch (error) {
      if (isApiError(error)) return fail(error);
      return fail(
        new ApiError('An unexpected error occurred while loading recipes.', 'unknown', {
          cause: error
        })
      );
    }
  }
}

function mapMealsToSearchResults(meals: MealDbMeal[] | null | undefined): RecipeSearchResult[] {
  if (!meals?.length) return [];
  return meals.map(mapMealToSearchResult);
}

function mapFilterItems(meals: MealDbFilterItem[] | null | undefined): RecipeSearchResult[] {
  if (!meals?.length) return [];
  return meals.map(mapFilterItemToSearchResult);
}

function intersectById(buckets: RecipeSearchResult[][]): RecipeSearchResult[] {
  if (buckets.length === 0) return [];
  if (buckets.length === 1) return buckets[0];

  let current = buckets[0];
  for (let i = 1; i < buckets.length; i++) {
    const ids = new Set(buckets[i].map((r) => r.id));
    current = current.filter((r) => ids.has(r.id));
  }
  return current;
}

function parseRawId(recipeId: string): string {
  return recipeId.startsWith('mealdb:') ? recipeId.slice('mealdb:'.length) : recipeId;
}

/** Default singleton for app use. Tests should construct `RecipesService` with a mock fetch. */
export const recipesService = new RecipesService();
