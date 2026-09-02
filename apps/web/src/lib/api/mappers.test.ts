import { describe, expect, it } from 'vitest';
import {
  extractIngredients,
  mapFilterItemToSearchResult,
  mapMealToRecipe,
  mapMealToSearchResult,
  recipeToSearchResult
} from '$lib/api/mappers';
import { sampleFilterItem, sampleMeal } from '$lib/api/__fixtures__/meals';

describe('extractIngredients', () => {
  it('collects non-empty ingredient/measure pairs and skips blanks', () => {
    const ingredients = extractIngredients(sampleMeal);
    expect(ingredients).toHaveLength(9);
    expect(ingredients[0]).toEqual({ name: 'soy sauce', measure: '3/4 cup' });
    expect(ingredients.at(-1)).toEqual({ name: 'brown rice', measure: '3 cups' });
  });

  it('allows empty measure when ingredient is present', () => {
    const ingredients = extractIngredients({
      idMeal: '1',
      strMeal: 'Salt only',
      strIngredient1: 'salt',
      strMeasure1: '',
      strIngredient2: '',
      strMeasure2: ''
    });
    expect(ingredients).toEqual([{ name: 'salt', measure: '' }]);
  });
});

describe('mapMealToRecipe', () => {
  it('normalizes a full MealDB meal into Recipe', () => {
    const recipe = mapMealToRecipe(sampleMeal);

    expect(recipe).toMatchObject({
      id: 'mealdb:52772',
      source: 'mealdb',
      title: 'Teriyaki Chicken Casserole',
      category: 'Chicken',
      area: 'Japanese',
      thumbnailUrl: sampleMeal.strMealThumb,
      youtubeUrl: sampleMeal.strYoutube,
      sourceUrl: sampleMeal.strSource,
      tags: ['Meat', 'Casserole']
    });
    expect(recipe.ingredients).toHaveLength(9);
    expect(recipe.instructions).toContain('Preheat oven');
  });

  it('falls back for missing title and omits empty optionals', () => {
    const recipe = mapMealToRecipe({
      idMeal: '1',
      strMeal: '  ',
      strCategory: null,
      strArea: '',
      strInstructions: null,
      strTags: null,
      strYoutube: '  ',
      strSource: null,
      strMealThumb: null
    });

    expect(recipe.title).toBe('Untitled recipe');
    expect(recipe.category).toBeUndefined();
    expect(recipe.area).toBeUndefined();
    expect(recipe.tags).toBeUndefined();
    expect(recipe.youtubeUrl).toBeUndefined();
    expect(recipe.instructions).toBe('');
  });
});

describe('mapMealToSearchResult / mapFilterItemToSearchResult', () => {
  it('maps full meals to search summaries', () => {
    expect(mapMealToSearchResult(sampleMeal)).toEqual({
      id: 'mealdb:52772',
      title: 'Teriyaki Chicken Casserole',
      thumbnailUrl: sampleMeal.strMealThumb,
      category: 'Chicken',
      area: 'Japanese'
    });
  });

  it('maps lightweight filter items without category/area', () => {
    expect(mapFilterItemToSearchResult(sampleFilterItem)).toEqual({
      id: 'mealdb:52772',
      title: 'Teriyaki Chicken Casserole',
      thumbnailUrl: sampleFilterItem.strMealThumb
    });
  });
});

describe('recipeToSearchResult', () => {
  it('projects Recipe fields into a search snapshot', () => {
    const recipe = mapMealToRecipe(sampleMeal);
    expect(recipeToSearchResult(recipe)).toEqual(mapMealToSearchResult(sampleMeal));
  });
});
