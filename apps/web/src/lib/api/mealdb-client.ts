import { ApiError } from './errors';
import type {
  MealDbFilterResponse,
  MealDbListResponse,
  MealDbMealsResponse
} from './mealdb-types';

/**
 * TheMealDB raw HTTP client.
 *
 * Assumptions / limitations (free tier, no API key):
 * - Base: https://www.themealdb.com/api/json/v1/1/
 * - Filter endpoints (`filter.php`) return lightweight meals (id, name, thumb only).
 * - Search by name is prefix/substring style, not full-text multi-field.
 * - `meals: null` means no results (not an error).
 * - Rate limits are soft; prefer light in-memory caching at the service layer.
 * - CORS is allowed from browsers for this public API.
 */
export const MEALDB_BASE_URL = 'https://www.themealdb.com/api/json/v1/1/';

export type FetchLike = typeof fetch;

export interface MealDbClientOptions {
  baseUrl?: string;
  fetchFn?: FetchLike;
}

export class MealDbClient {
  private readonly baseUrl: string;
  private readonly fetchFn: FetchLike;

  constructor(options: MealDbClientOptions = {}) {
    this.baseUrl = (options.baseUrl ?? MEALDB_BASE_URL).replace(/\/?$/, '/');
    this.fetchFn = options.fetchFn ?? fetch;
  }

  searchByName(query: string): Promise<MealDbMealsResponse> {
    return this.getJson<MealDbMealsResponse>('search.php', { s: query });
  }

  browseByLetter(letter: string): Promise<MealDbMealsResponse> {
    const f = letter.trim().charAt(0).toLowerCase();
    return this.getJson<MealDbMealsResponse>('search.php', { f });
  }

  filterByCategory(category: string): Promise<MealDbFilterResponse> {
    return this.getJson<MealDbFilterResponse>('filter.php', { c: category });
  }

  filterByArea(area: string): Promise<MealDbFilterResponse> {
    return this.getJson<MealDbFilterResponse>('filter.php', { a: area });
  }

  filterByIngredient(ingredient: string): Promise<MealDbFilterResponse> {
    return this.getJson<MealDbFilterResponse>('filter.php', { i: ingredient });
  }

  listCategories(): Promise<MealDbListResponse> {
    return this.getJson<MealDbListResponse>('list.php', { c: 'list' });
  }

  listAreas(): Promise<MealDbListResponse> {
    return this.getJson<MealDbListResponse>('list.php', { a: 'list' });
  }

  lookupById(id: string): Promise<MealDbMealsResponse> {
    return this.getJson<MealDbMealsResponse>('lookup.php', { i: id });
  }

  random(): Promise<MealDbMealsResponse> {
    return this.getJson<MealDbMealsResponse>('random.php', {});
  }

  private async getJson<T>(path: string, params: Record<string, string> = {}): Promise<T> {
    const url = new URL(path, this.baseUrl);
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }

    let response: Response;
    try {
      response = await this.fetchFn(url.toString(), {
        method: 'GET',
        headers: { Accept: 'application/json' }
      });
    } catch (cause) {
      throw new ApiError('Unable to reach TheMealDB. Check your network connection.', 'network', {
        cause
      });
    }

    if (!response.ok) {
      throw new ApiError(`TheMealDB request failed with status ${response.status}.`, 'http', {
        status: response.status
      });
    }

    try {
      return (await response.json()) as T;
    } catch (cause) {
      throw new ApiError('TheMealDB returned an invalid JSON response.', 'parse', {
        status: response.status,
        cause
      });
    }
  }
}
