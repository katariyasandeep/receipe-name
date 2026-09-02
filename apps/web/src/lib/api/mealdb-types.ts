/**
 * Raw TheMealDB JSON shapes (internal — not exported to UI).
 * @see https://www.themealdb.com/api.php
 */

export interface MealDbMeal {
  idMeal: string;
  strMeal: string;
  strDrinkAlternate?: string | null;
  strCategory?: string | null;
  strArea?: string | null;
  strInstructions?: string | null;
  strMealThumb?: string | null;
  strTags?: string | null;
  strYoutube?: string | null;
  strSource?: string | null;
  strImageSource?: string | null;
  strCreativeCommonsConfirmed?: string | null;
  dateModified?: string | null;
  [key: string]: string | null | undefined;
}

export interface MealDbMealsResponse {
  meals: MealDbMeal[] | null;
}

/** Lightweight filter/list item (id, name, thumb only). */
export interface MealDbFilterItem {
  idMeal: string;
  strMeal: string;
  strMealThumb?: string | null;
}

export interface MealDbFilterResponse {
  meals: MealDbFilterItem[] | null;
}

export interface MealDbCategory {
  strCategory: string;
}

export interface MealDbArea {
  strArea: string;
}

export interface MealDbIngredientListItem {
  strIngredient: string;
}

export interface MealDbListResponse {
  meals: Array<MealDbCategory | MealDbArea | MealDbIngredientListItem> | null;
}
