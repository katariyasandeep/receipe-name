import { describe, expect, it } from 'vitest';
import { emptyUserRecipeDraft, validateUserRecipeDraft } from '$lib/validation';
import type { UserRecipeDraft } from '$lib/types';

function validDraft(overrides: Partial<UserRecipeDraft> = {}): UserRecipeDraft {
  return {
    ...emptyUserRecipeDraft(),
    title: 'Tomato Soup',
    description: 'A simple weeknight soup',
    category: 'Soup',
    area: 'American',
    thumbnailUrl: 'https://example.com/soup.jpg',
    ingredients: [
      { name: 'Tomato', measure: '4' },
      { name: 'Stock', measure: '2 cups' }
    ],
    instructions: 'Simmer everything until soft, then blend until smooth.',
    tags: ['quick', 'vegetarian'],
    prepTimeMinutes: 10,
    cookTimeMinutes: 25,
    servings: 4,
    ...overrides
  };
}

describe('validateUserRecipeDraft', () => {
  it('accepts a complete valid draft and normalizes fields', () => {
    const result = validateUserRecipeDraft(
      validDraft({
        title: '  Tomato Soup  ',
        ingredients: [
          { name: ' Tomato ', measure: ' 4 ' },
          { name: '', measure: 'skip me' },
          { name: 'Stock', measure: '2 cups' }
        ],
        tags: [' Quick ', 'vegetarian', 'quick']
      })
    );

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual({});
    expect(result.draft).toMatchObject({
      title: 'Tomato Soup',
      ingredients: [
        { name: 'Tomato', measure: '4' },
        { name: 'Stock', measure: '2 cups' }
      ],
      tags: ['Quick', 'vegetarian'],
      prepTimeMinutes: 10,
      cookTimeMinutes: 25,
      servings: 4
    });
  });

  it('requires title, instructions, and at least one named ingredient', () => {
    const result = validateUserRecipeDraft({
      ...emptyUserRecipeDraft(),
      title: '',
      instructions: '',
      ingredients: [{ name: '', measure: '' }]
    });

    expect(result.valid).toBe(false);
    expect(result.errors.title).toBeTruthy();
    expect(result.errors.instructions).toBeTruthy();
    expect(result.errors.ingredients).toBeTruthy();
  });

  it('rejects short title and short instructions', () => {
    const result = validateUserRecipeDraft(
      validDraft({ title: 'A', instructions: 'Too short' })
    );
    expect(result.valid).toBe(false);
    expect(result.errors.title).toMatch(/at least/i);
    expect(result.errors.instructions).toMatch(/at least/i);
  });

  it('rejects invalid image URLs', () => {
    const result = validateUserRecipeDraft(validDraft({ thumbnailUrl: 'not-a-url' }));
    expect(result.valid).toBe(false);
    expect(result.errors.thumbnailUrl).toMatch(/http/i);
  });

  it('rejects negative prep time and non-integer servings', () => {
    const result = validateUserRecipeDraft(
      validDraft({ prepTimeMinutes: -5, servings: 2.5 })
    );
    expect(result.valid).toBe(false);
    expect(result.errors.prepTimeMinutes).toBeTruthy();
    expect(result.errors.servings).toBeTruthy();
  });

  it('allows optional timing and servings to be empty', () => {
    const result = validateUserRecipeDraft(
      validDraft({
        prepTimeMinutes: null,
        cookTimeMinutes: null,
        servings: null,
        thumbnailUrl: '',
        description: ''
      })
    );
    expect(result.valid).toBe(true);
    expect(result.draft?.prepTimeMinutes).toBeNull();
    expect(result.draft?.thumbnailUrl).toBeUndefined();
  });
});
