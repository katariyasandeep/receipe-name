export { toMealDbId, toUserId, parseRecipeId, isMealDbId, isUserId } from './ids';
export { loadJson, saveJson } from './storage';
export { appPath, recipePath, stripBasePath } from './routes';
export { userRecipeToDraft, draftToUserRecipe } from './user-recipe-draft';
export { emptyUserRecipeDraft } from '$lib/validation';

/** ISO date (YYYY-MM-DD) for the Monday of the week containing `date`. */
export function mondayOfWeek(date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay(); // 0 Sun … 6 Sat
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}
