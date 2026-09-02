/**
 * @recipe-finder/recipe-ui
 * Public entry — types for consumers. Components load via defineCustomElements().
 */
export type {
  RecipeId,
  MealDay,
  MealSlot,
  Ingredient,
  RecipeSearchResult,
  Recipe,
  UserRecipeDraft,
  RecipeFilterValue,
  SelectOption,
  PlannedMeal,
  RecipeFormErrors,
} from './utils/types';

export {
  MEAL_DAYS,
  MEAL_SLOTS,
  DAY_LABELS,
  SLOT_LABELS,
} from './utils/types';
