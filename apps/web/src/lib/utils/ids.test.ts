import { describe, expect, it } from 'vitest';
import { isMealDbId, isUserId, parseRecipeId, toMealDbId, toUserId } from '$lib/utils/ids';

describe('recipe id helpers', () => {
  it('prefixes mealdb and user ids idempotently', () => {
    expect(toMealDbId('52772')).toBe('mealdb:52772');
    expect(toMealDbId('mealdb:52772')).toBe('mealdb:52772');
    expect(toUserId('abc')).toBe('user:abc');
    expect(toUserId('user:abc')).toBe('user:abc');
  });

  it('parses source and raw id', () => {
    expect(parseRecipeId('mealdb:52772')).toEqual({ source: 'mealdb', rawId: '52772' });
    expect(parseRecipeId('user:uuid-1')).toEqual({ source: 'user', rawId: 'uuid-1' });
    expect(parseRecipeId('mealdb:')).toBeNull();
    expect(parseRecipeId('plain')).toBeNull();
  });

  it('detects id kinds', () => {
    expect(isMealDbId('mealdb:1')).toBe(true);
    expect(isUserId('user:1')).toBe(true);
    expect(isMealDbId('user:1')).toBe(false);
  });
});
