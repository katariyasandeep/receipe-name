import type { MealDbFilterItem, MealDbMeal } from '$lib/api/mealdb-types';

/** Full TheMealDB meal fixture (Teriyaki Chicken Casserole style). */
export const sampleMeal: MealDbMeal = {
  idMeal: '52772',
  strMeal: 'Teriyaki Chicken Casserole',
  strDrinkAlternate: null,
  strCategory: 'Chicken',
  strArea: 'Japanese',
  strInstructions:
    'Preheat oven to 350° F. Spray a 9x13-inch baking pan with non-stick spray.\r\nCombine soy sauce, ½ cup water, brown sugar, ginger and garlic in a small saucepan and cover.',
  strMealThumb: 'https://www.themealdb.com/images/media/meals/wvpsxx1468257224.jpg',
  strTags: 'Meat,Casserole',
  strYoutube: 'https://www.youtube.com/watch?v=4aZr5hZXP_s',
  strIngredient1: 'soy sauce',
  strIngredient2: 'water',
  strIngredient3: 'brown sugar',
  strIngredient4: 'ground ginger',
  strIngredient5: 'minced garlic',
  strIngredient6: 'cornstarch',
  strIngredient7: 'chicken breasts',
  strIngredient8: 'stir-fry vegetables',
  strIngredient9: 'brown rice',
  strIngredient10: '',
  strIngredient11: null,
  strMeasure1: '3/4 cup',
  strMeasure2: '1/2 cup',
  strMeasure3: '1/4 cup',
  strMeasure4: '1/2 teaspoon',
  strMeasure5: '1/2 teaspoon',
  strMeasure6: '4 Tablespoons',
  strMeasure7: '2',
  strMeasure8: '1 (12 oz.)',
  strMeasure9: '3 cups',
  strMeasure10: ' ',
  strMeasure11: null,
  strSource: 'http://example.com/teriyaki',
  strImageSource: null,
  strCreativeCommonsConfirmed: null,
  dateModified: null
};

export const sampleFilterItem: MealDbFilterItem = {
  idMeal: '52772',
  strMeal: 'Teriyaki Chicken Casserole',
  strMealThumb: 'https://www.themealdb.com/images/media/meals/wvpsxx1468257224.jpg'
};

export const sampleFilterItemB: MealDbFilterItem = {
  idMeal: '52804',
  strMeal: 'Poutine',
  strMealThumb: 'https://www.themealdb.com/images/media/meals/uuyrrx1487327597.jpg'
};
