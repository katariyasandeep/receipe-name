import { base } from '$app/paths';
import type { RecipeId } from '$lib/types';

/**
 * Prefix an app-absolute path with SvelteKit `paths.base`
 * (needed for GitHub Pages project sites, e.g. `/recipe-finder`).
 */
export function appPath(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  if (normalized === '/') return base || '/';
  return `${base}${normalized}`;
}

/** Encode RecipeId for use in `/recipes/[id]` path segments. */
export function recipePath(id: RecipeId): string {
  return appPath(`/recipes/${encodeURIComponent(id)}`);
}

/** Pathname without `paths.base`, for active-nav comparisons. */
export function stripBasePath(pathname: string): string {
  if (!base) return pathname;
  if (pathname === base || pathname === `${base}/`) return '/';
  return pathname.startsWith(base) ? pathname.slice(base.length) || '/' : pathname;
}
