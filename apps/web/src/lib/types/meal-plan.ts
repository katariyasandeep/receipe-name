import type { RecipeId, RecipeSearchResult } from './recipe';

export type MealDay = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export type MealSlot = 'breakfast' | 'lunch' | 'dinner';

export interface PlannedMeal {
  id: string;
  day: MealDay;
  slot: MealSlot;
  recipeId: RecipeId;
  /** Denormalized for offline display. */
  snapshot: RecipeSearchResult;
}

export interface MealPlan {
  /** ISO date of the Monday starting the week. */
  weekStart: string;
  meals: PlannedMeal[];
}
