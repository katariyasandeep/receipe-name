import { toMealDbId } from '$lib/utils/ids';
import type { Ingredient, Recipe, RecipeSearchResult } from '$lib/types';
import type { MealDbFilterItem, MealDbMeal } from './mealdb-types';

const INGREDIENT_SLOTS = 20;

function optionalString(value: string | null | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function parseTags(raw: string | null | undefined): string[] | undefined {
  const value = optionalString(raw);
  if (!value) return undefined;
  const tags = value
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
  return tags.length > 0 ? tags : undefined;
}

/**
 * TheMealDB stores up to 20 ingredient/measure pairs as strIngredientN / strMeasureN.
 */
export function extractIngredients(meal: MealDbMeal): Ingredient[] {
  const ingredients: Ingredient[] = [];

  for (let i = 1; i <= INGREDIENT_SLOTS; i++) {
    const name = optionalString(meal[`strIngredient${i}`]);
    if (!name) continue;
    const measure = optionalString(meal[`strMeasure${i}`]) ?? '';
    ingredients.push({ name, measure });
  }

  return ingredients;
}

export function mapMealToRecipe(meal: MealDbMeal): Recipe {
  return {
    id: toMealDbId(meal.idMeal),
    source: 'mealdb',
    title: meal.strMeal?.trim() || 'Untitled recipe',
    category: optionalString(meal.strCategory),
    area: optionalString(meal.strArea),
    thumbnailUrl: optionalString(meal.strMealThumb),
    ingredients: extractIngredients(meal),
    instructions: meal.strInstructions?.trim() ?? '',
    tags: parseTags(meal.strTags),
    youtubeUrl: optionalString(meal.strYoutube),
    sourceUrl: optionalString(meal.strSource)
  };
}

export function mapMealToSearchResult(meal: MealDbMeal): RecipeSearchResult {
  return {
    id: toMealDbId(meal.idMeal),
    title: meal.strMeal?.trim() || 'Untitled recipe',
    thumbnailUrl: optionalString(meal.strMealThumb),
    category: optionalString(meal.strCategory),
    area: optionalString(meal.strArea)
  };
}

export function mapFilterItemToSearchResult(item: MealDbFilterItem): RecipeSearchResult {
  return {
    id: toMealDbId(item.idMeal),
    title: item.strMeal?.trim() || 'Untitled recipe',
    thumbnailUrl: optionalString(item.strMealThumb)
  };
}

export function recipeToSearchResult(recipe: Recipe): RecipeSearchResult {
  return {
    id: recipe.id,
    title: recipe.title,
    thumbnailUrl: recipe.thumbnailUrl,
    category: recipe.category,
    area: recipe.area
  };
}
