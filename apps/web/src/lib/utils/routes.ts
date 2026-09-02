import { base } from '$app/paths';
import type { RecipeId } from '$lib/types';

/**
 * Prefix an app-absolute path with `paths.base` for `<a href>` and `goto()`.
 * Required on GitHub Pages (`/receipe-name/...`).
 */
export function appPath(path: string): string {
  const qIndex = path.indexOf('?');
  const pathname = qIndex >= 0 ? path.slice(0, qIndex) : path;
  const query = qIndex >= 0 ? path.slice(qIndex) : '';
  const normalized = pathname.startsWith('/') ? pathname : `/${pathname}`;
  const withBase = normalized === '/' ? base || '/' : `${base}${normalized}`;
  return `${withBase}${query}`;
}

/** Logical recipe detail route (no base) — pass through `appPath` for href/goto. */
export function recipePath(id: RecipeId): string {
  return `/recipes/${encodeURIComponent(id)}`;
}

/** Pathname without `paths.base`, for active-nav comparisons. */
export function stripBasePath(pathname: string): string {
  if (!base) return pathname;
  if (pathname === base || pathname === `${base}/`) return '/';
  return pathname.startsWith(`${base}/`) || pathname === base
    ? pathname.slice(base.length) || '/'
    : pathname;
}
