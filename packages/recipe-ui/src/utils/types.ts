/**
 * Presentational domain shapes used by recipe-ui props.
 * Kept JSON-serializable and free of app/store logic.
 */

export type RecipeId = string;

export type MealDay = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export type MealSlot = 'breakfast' | 'lunch' | 'dinner';

export interface Ingredient {
  name: string;
  measure: string;
}

export interface RecipeSearchResult {
  id: RecipeId;
  title: string;
  thumbnailUrl?: string;
  category?: string;
  area?: string;
}

export interface Recipe {
  id: RecipeId;
  source: 'mealdb' | 'user';
  title: string;
  category?: string;
  area?: string;
  thumbnailUrl?: string;
  ingredients: Ingredient[];
  instructions: string;
  tags?: string[];
  youtubeUrl?: string;
  sourceUrl?: string;
}

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
  /** Preparation time in minutes */
  prepTimeMinutes?: number | null;
  /** Cooking time in minutes */
  cookTimeMinutes?: number | null;
  servings?: number | null;
}

export interface RecipeFilterValue {
  query?: string;
  category?: string;
  area?: string;
  ingredient?: string;
  letter?: string;
}

export interface SelectOption {
  label: string;
  value: string;
}

export interface PlannedMeal {
  id: string;
  day: MealDay;
  slot: MealSlot;
  recipeId: RecipeId;
  snapshot: RecipeSearchResult;
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

export const MEAL_DAYS: MealDay[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

export const MEAL_SLOTS: MealSlot[] = ['breakfast', 'lunch', 'dinner'];

export const DAY_LABELS: Record<MealDay, string> = {
  mon: 'Mon',
  tue: 'Tue',
  wed: 'Wed',
  thu: 'Thu',
  fri: 'Fri',
  sat: 'Sat',
  sun: 'Sun',
};

export const SLOT_LABELS: Record<MealSlot, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
};
