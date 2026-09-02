import type { RecipeId, RecipeSearchResult } from './recipe';

export interface Favorite {
  recipeId: RecipeId;
  savedAt: string;
  /** Denormalized summary so UI works offline / if MealDB is unavailable. */
  snapshot: RecipeSearchResult;
}
