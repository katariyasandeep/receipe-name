import type { UserRecipe, UserRecipeDraft } from '$lib/types';
import { toUserId } from './ids';

/** Map a stored user recipe into form draft props for `rf-recipe-form`. */
export function userRecipeToDraft(recipe: UserRecipe): UserRecipeDraft {
  return {
    id: recipe.id,
    title: recipe.title,
    description: recipe.description ?? '',
    category: recipe.category ?? '',
    area: recipe.area ?? '',
    thumbnailUrl: recipe.thumbnailUrl ?? '',
    ingredients:
      recipe.ingredients.length > 0
        ? recipe.ingredients.map((i) => ({ ...i }))
        : [{ name: '', measure: '' }],
    instructions: recipe.instructions,
    tags: recipe.tags ? [...recipe.tags] : [],
    prepTimeMinutes: recipe.prepTimeMinutes ?? null,
    cookTimeMinutes: recipe.cookTimeMinutes ?? null,
    servings: recipe.servings ?? null
  };
}

/**
 * Build a `UserRecipe` from a validated draft.
 * Caller must validate first (`validateUserRecipeDraft`).
 */
export function draftToUserRecipe(
  draft: UserRecipeDraft,
  existing?: UserRecipe
): UserRecipe {
  const now = new Date().toISOString();
  const id =
    existing?.id ??
    draft.id ??
    toUserId(typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `tmp-${Date.now()}`);

  return {
    id,
    source: 'user',
    title: draft.title,
    description: draft.description || undefined,
    category: draft.category || undefined,
    area: draft.area || undefined,
    thumbnailUrl: draft.thumbnailUrl || undefined,
    ingredients: draft.ingredients.map((i) => ({ ...i })),
    instructions: draft.instructions,
    tags: draft.tags?.length ? [...draft.tags] : undefined,
    prepTimeMinutes:
      draft.prepTimeMinutes == null ? undefined : draft.prepTimeMinutes,
    cookTimeMinutes:
      draft.cookTimeMinutes == null ? undefined : draft.cookTimeMinutes,
    servings: draft.servings == null ? undefined : draft.servings,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now
  };
}
