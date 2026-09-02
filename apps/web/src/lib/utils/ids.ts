import type { RecipeId, RecipeSource } from '$lib/types';

const MEALDB_PREFIX = 'mealdb:';
const USER_PREFIX = 'user:';

export function toMealDbId(rawId: string): RecipeId {
  const trimmed = rawId.trim();
  if (trimmed.startsWith(MEALDB_PREFIX)) return trimmed;
  return `${MEALDB_PREFIX}${trimmed}`;
}

export function toUserId(uuid: string): RecipeId {
  const trimmed = uuid.trim();
  if (trimmed.startsWith(USER_PREFIX)) return trimmed;
  return `${USER_PREFIX}${trimmed}`;
}

export function parseRecipeId(id: RecipeId): { source: RecipeSource; rawId: string } | null {
  if (id.startsWith(MEALDB_PREFIX)) {
    const rawId = id.slice(MEALDB_PREFIX.length);
    return rawId ? { source: 'mealdb', rawId } : null;
  }
  if (id.startsWith(USER_PREFIX)) {
    const rawId = id.slice(USER_PREFIX.length);
    return rawId ? { source: 'user', rawId } : null;
  }
  return null;
}

export function isMealDbId(id: RecipeId): boolean {
  return parseRecipeId(id)?.source === 'mealdb';
}

export function isUserId(id: RecipeId): boolean {
  return parseRecipeId(id)?.source === 'user';
}
