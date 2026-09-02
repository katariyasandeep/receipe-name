import type { RecipeId } from '$lib/types';

/** Encode RecipeId for use in `/recipes/[id]` path segments. */
export function recipePath(id: RecipeId): string {
  return `/recipes/${encodeURIComponent(id)}`;
}
