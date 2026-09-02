import type { Ingredient, RecipeFormErrors, UserRecipeDraft } from '$lib/types';

const TITLE_MIN = 2;
const TITLE_MAX = 120;
const DESCRIPTION_MAX = 1000;
const INSTRUCTIONS_MIN = 10;
const INSTRUCTIONS_MAX = 10000;
const CATEGORY_MAX = 60;
const AREA_MAX = 60;
const TAG_MAX = 40;
const TAGS_MAX = 12;
const MAX_INGREDIENTS = 40;
const MAX_MINUTES = 24 * 60;
const MAX_SERVINGS = 100;

export interface UserRecipeValidationResult {
  valid: boolean;
  errors: RecipeFormErrors;
  /** Normalized draft when valid (trimmed fields, cleaned ingredients/tags). */
  draft?: UserRecipeDraft;
}

function trim(value: string | undefined | null): string {
  return (value ?? '').trim();
}

function isOptionalUrl(value: string): boolean {
  if (!value) return true;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function normalizeIngredients(ingredients: Ingredient[] | undefined): Ingredient[] {
  if (!Array.isArray(ingredients)) return [];
  return ingredients
    .map((item) => ({
      name: trim(item?.name),
      measure: trim(item?.measure)
    }))
    .filter((item) => item.name.length > 0);
}

function normalizeTags(tags: string[] | undefined): string[] {
  if (!Array.isArray(tags)) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of tags) {
    const tag = trim(raw);
    if (!tag) continue;
    const key = tag.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(tag);
  }
  return out;
}

function validateOptionalMinutes(
  value: number | null | undefined,
  field: 'prepTimeMinutes' | 'cookTimeMinutes',
  errors: RecipeFormErrors
): number | undefined {
  if (value == null || (typeof value === 'number' && Number.isNaN(value))) {
    return undefined;
  }
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    errors[field] = 'Enter a valid number of minutes.';
    return undefined;
  }
  if (!Number.isInteger(value) || value < 0) {
    errors[field] = 'Use a whole number of minutes (0 or more).';
    return undefined;
  }
  if (value > MAX_MINUTES) {
    errors[field] = `Keep under ${MAX_MINUTES} minutes.`;
    return undefined;
  }
  return value;
}

function validateOptionalServings(
  value: number | null | undefined,
  errors: RecipeFormErrors
): number | undefined {
  if (value == null || (typeof value === 'number' && Number.isNaN(value))) {
    return undefined;
  }
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    errors.servings = 'Enter a valid number of servings.';
    return undefined;
  }
  if (!Number.isInteger(value) || value < 1) {
    errors.servings = 'Servings must be a whole number of at least 1.';
    return undefined;
  }
  if (value > MAX_SERVINGS) {
    errors.servings = `Keep servings at ${MAX_SERVINGS} or fewer.`;
    return undefined;
  }
  return value;
}

/**
 * Validate a user recipe draft. Owns all field rules; Stencil only displays `errors`.
 */
export function validateUserRecipeDraft(input: UserRecipeDraft): UserRecipeValidationResult {
  const errors: RecipeFormErrors = {};

  const title = trim(input.title);
  if (!title) {
    errors.title = 'Title is required.';
  } else if (title.length < TITLE_MIN) {
    errors.title = `Title must be at least ${TITLE_MIN} characters.`;
  } else if (title.length > TITLE_MAX) {
    errors.title = `Title must be ${TITLE_MAX} characters or fewer.`;
  }

  const description = trim(input.description);
  if (description.length > DESCRIPTION_MAX) {
    errors.description = `Description must be ${DESCRIPTION_MAX} characters or fewer.`;
  }

  const instructions = trim(input.instructions);
  if (!instructions) {
    errors.instructions = 'Instructions are required.';
  } else if (instructions.length < INSTRUCTIONS_MIN) {
    errors.instructions = `Add a bit more detail (at least ${INSTRUCTIONS_MIN} characters).`;
  } else if (instructions.length > INSTRUCTIONS_MAX) {
    errors.instructions = `Instructions must be ${INSTRUCTIONS_MAX} characters or fewer.`;
  }

  const category = trim(input.category);
  if (category.length > CATEGORY_MAX) {
    errors.category = `Category must be ${CATEGORY_MAX} characters or fewer.`;
  }

  const area = trim(input.area);
  if (area.length > AREA_MAX) {
    errors.area = `Cuisine / area must be ${AREA_MAX} characters or fewer.`;
  }

  const thumbnailUrl = trim(input.thumbnailUrl);
  if (!isOptionalUrl(thumbnailUrl)) {
    errors.thumbnailUrl = 'Enter a valid http(s) image URL, or leave blank.';
  }

  const rawIngredients = Array.isArray(input.ingredients) ? input.ingredients : [];
  if (rawIngredients.length > MAX_INGREDIENTS) {
    errors.ingredients = `Use at most ${MAX_INGREDIENTS} ingredients.`;
  }
  const ingredients = normalizeIngredients(rawIngredients);
  if (ingredients.length === 0) {
    errors.ingredients = 'Add at least one ingredient with a name.';
  }

  const tags = normalizeTags(input.tags);
  if (tags.length > TAGS_MAX) {
    errors.tags = `Use at most ${TAGS_MAX} tags.`;
  } else if (tags.some((t) => t.length > TAG_MAX)) {
    errors.tags = `Each tag must be ${TAG_MAX} characters or fewer.`;
  }

  const prepTimeMinutes = validateOptionalMinutes(input.prepTimeMinutes, 'prepTimeMinutes', errors);
  const cookTimeMinutes = validateOptionalMinutes(input.cookTimeMinutes, 'cookTimeMinutes', errors);
  const servings = validateOptionalServings(input.servings, errors);

  const valid = Object.keys(errors).length === 0;
  if (!valid) {
    return { valid: false, errors };
  }

  const draft: UserRecipeDraft = {
    id: input.id,
    title,
    description: description || undefined,
    category: category || undefined,
    area: area || undefined,
    thumbnailUrl: thumbnailUrl || undefined,
    ingredients,
    instructions,
    tags: tags.length ? tags : undefined,
    prepTimeMinutes: prepTimeMinutes ?? null,
    cookTimeMinutes: cookTimeMinutes ?? null,
    servings: servings ?? null
  };

  return { valid: true, errors: {}, draft };
}

export function emptyUserRecipeDraft(): UserRecipeDraft {
  return {
    title: '',
    description: '',
    category: '',
    area: '',
    thumbnailUrl: '',
    ingredients: [{ name: '', measure: '' }],
    instructions: '',
    tags: [],
    prepTimeMinutes: null,
    cookTimeMinutes: null,
    servings: null
  };
}
