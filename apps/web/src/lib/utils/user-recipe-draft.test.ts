import { describe, expect, it } from 'vitest';
import { draftToUserRecipe, userRecipeToDraft } from '$lib/utils/user-recipe-draft';
import type { UserRecipe } from '$lib/types';

describe('user recipe draft mappers', () => {
  it('round-trips a user recipe through draft form', () => {
    const recipe: UserRecipe = {
      id: 'user:1',
      source: 'user',
      title: 'Curry',
      description: 'Spicy',
      category: 'Main',
      area: 'Indian',
      thumbnailUrl: 'https://example.com/c.jpg',
      ingredients: [{ name: 'Chickpeas', measure: '1 can' }],
      instructions: 'Simmer with spices until thick and fragrant.',
      tags: ['vegan'],
      prepTimeMinutes: 5,
      cookTimeMinutes: 30,
      servings: 4,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z'
    };

    const draft = userRecipeToDraft(recipe);
    expect(draft.title).toBe('Curry');
    expect(draft.prepTimeMinutes).toBe(5);

    const rebuilt = draftToUserRecipe(draft, recipe);
    expect(rebuilt.id).toBe('user:1');
    expect(rebuilt.createdAt).toBe(recipe.createdAt);
    expect(rebuilt.title).toBe('Curry');
    expect(rebuilt.servings).toBe(4);
    expect(rebuilt.source).toBe('user');
  });
});
