/** Canonical domain recipe id: `mealdb:{id}` or `user:{uuid}`. */
export type RecipeId = string;

export type RecipeSource = 'mealdb' | 'user';

export interface Ingredient {
  name: string;
  measure: string;
}

export interface Recipe {
  id: RecipeId;
  source: RecipeSource;
  title: string;
  category?: string;
  area?: string;
  thumbnailUrl?: string;
  ingredients: Ingredient[];
  /** Plain text; split by newlines for display. */
  instructions: string;
  tags?: string[];
  youtubeUrl?: string;
  sourceUrl?: string;
}

export interface RecipeSearchResult {
  id: RecipeId;
  title: string;
  thumbnailUrl?: string;
  category?: string;
  area?: string;
}

export interface RecipeFilter {
  query?: string;
  category?: string;
  area?: string;
  ingredient?: string;
  letter?: string;
}

/**
 * Draft shape aligned with `@sandeep_saini/recipe-ui` `UserRecipeDraft`
 * (presentational form value; validation lives in `$lib/validation`).
 */
export interface UserRecipeDraft {
  id?: RecipeId;
  title: string;
  description?: string;
  category?: string;
  area?: string;
  thumbnailUrl?: string;
  ingredients: Ingredient[];
  instructions: string;
  tags?: string[];
  prepTimeMinutes?: number | null;
  cookTimeMinutes?: number | null;
  servings?: number | null;
}

export type RecipeFormErrors = Partial<
  Record<
    | 'title'
    | 'description'
    | 'instructions'
    | 'ingredients'
    | 'category'
    | 'area'
    | 'thumbnailUrl'
    | 'tags'
    | 'prepTimeMinutes'
    | 'cookTimeMinutes'
    | 'servings'
    | 'form',
    string
  >
>;

export interface UserRecipe extends Recipe {
  source: 'user';
  createdAt: string;
  updatedAt: string;
  description?: string;
  prepTimeMinutes?: number;
  cookTimeMinutes?: number;
  servings?: number;
}
