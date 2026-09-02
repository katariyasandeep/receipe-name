import type { MealDay, MealSlot, PlannedMeal, RecipeId, RecipeSearchResult } from '$lib/types';

export const MEAL_DAYS: MealDay[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

export const MEAL_SLOTS: MealSlot[] = ['breakfast', 'lunch', 'dinner'];

export const DAY_LABELS: Record<MealDay, string> = {
  mon: 'Monday',
  tue: 'Tuesday',
  wed: 'Wednesday',
  thu: 'Thursday',
  fri: 'Friday',
  sat: 'Saturday',
  sun: 'Sunday'
};

export const SLOT_LABELS: Record<MealSlot, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner'
};

export function createMealId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `meal-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function mealAt(
  meals: PlannedMeal[],
  day: MealDay,
  slot: MealSlot
): PlannedMeal | undefined {
  return meals.find((m) => m.day === day && m.slot === slot);
}

export function mealsForDay(meals: PlannedMeal[], day: MealDay): PlannedMeal[] {
  return meals.filter((m) => m.day === day);
}

export interface AssignMealInput {
  day: MealDay;
  slot: MealSlot;
  recipeId: RecipeId;
  snapshot: RecipeSearchResult;
  /** When set, updates this meal instead of creating a new id. */
  existingId?: string;
}

/**
 * Assign or replace a recipe at a day/slot.
 * Ensures at most one meal per day+slot (breakfast / lunch / dinner).
 */
export function assignMeal(meals: PlannedMeal[], input: AssignMealInput): PlannedMeal[] {
  const next: PlannedMeal = {
    id: input.existingId ?? createMealId(),
    day: input.day,
    slot: input.slot,
    recipeId: input.recipeId,
    snapshot: input.snapshot
  };

  const filtered = meals.filter((m) => {
    if (input.existingId && m.id === input.existingId) return false;
    if (m.day === input.day && m.slot === input.slot) return false;
    return true;
  });

  return [...filtered, next];
}

export function updateMeal(
  meals: PlannedMeal[],
  id: string,
  patch: Partial<Pick<PlannedMeal, 'day' | 'slot' | 'recipeId' | 'snapshot'>>
): PlannedMeal[] {
  const current = meals.find((m) => m.id === id);
  if (!current) return meals;

  const day = patch.day ?? current.day;
  const slot = patch.slot ?? current.slot;

  return assignMeal(meals, {
    existingId: id,
    day,
    slot,
    recipeId: patch.recipeId ?? current.recipeId,
    snapshot: patch.snapshot ?? current.snapshot
  });
}

export function removeMeal(meals: PlannedMeal[], id: string): PlannedMeal[] {
  return meals.filter((m) => m.id !== id);
}

/**
 * Move a meal to another day/slot. Swaps with an occupant when present.
 */
export function moveMeal(
  meals: PlannedMeal[],
  mealId: string,
  toDay: MealDay,
  toSlot: MealSlot
): PlannedMeal[] {
  const moving = meals.find((m) => m.id === mealId);
  if (!moving) return meals;
  if (moving.day === toDay && moving.slot === toSlot) return meals;

  const occupant = meals.find(
    (m) => m.day === toDay && m.slot === toSlot && m.id !== mealId
  );

  return meals.map((m) => {
    if (m.id === mealId) return { ...m, day: toDay, slot: toSlot };
    if (occupant && m.id === occupant.id) {
      return { ...m, day: moving.day, slot: moving.slot };
    }
    return m;
  });
}

/** Shift an ISO Monday date by N weeks. */
export function shiftWeekStart(weekStart: string, deltaWeeks: number): string {
  const d = new Date(`${weekStart}T12:00:00`);
  d.setDate(d.getDate() + deltaWeeks * 7);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Persisted shape: current week view + meals keyed by weekStart. */
export interface MealPlanStorage {
  weekStart: string;
  byWeek: Record<string, PlannedMeal[]>;
}

/**
 * Normalize legacy `{ weekStart, meals }` or current `{ weekStart, byWeek }` payloads.
 */
export function normalizeMealPlanStorage(
  raw: unknown,
  fallbackWeekStart: string
): MealPlanStorage {
  if (!raw || typeof raw !== 'object') {
    return { weekStart: fallbackWeekStart, byWeek: {} };
  }

  const record = raw as Record<string, unknown>;
  const weekStart =
    typeof record.weekStart === 'string' && record.weekStart
      ? record.weekStart
      : fallbackWeekStart;

  if (record.byWeek && typeof record.byWeek === 'object' && !Array.isArray(record.byWeek)) {
    const byWeek: Record<string, PlannedMeal[]> = {};
    for (const [key, value] of Object.entries(record.byWeek as Record<string, unknown>)) {
      if (Array.isArray(value)) byWeek[key] = value as PlannedMeal[];
    }
    return { weekStart, byWeek };
  }

  // Legacy single-week format from earlier builds
  if (Array.isArray(record.meals)) {
    return {
      weekStart,
      byWeek: { [weekStart]: record.meals as PlannedMeal[] }
    };
  }

  return { weekStart, byWeek: {} };
}

/** Switch visible week while preserving each week's meals independently. */
export function switchWeek(
  storage: MealPlanStorage,
  nextWeekStart: string
): MealPlanStorage {
  return {
    weekStart: nextWeekStart,
    byWeek: {
      ...storage.byWeek,
      // Ensure current week snapshot stays in the map even if empty
      [storage.weekStart]: storage.byWeek[storage.weekStart] ?? []
    }
  };
}

export function mealsForWeek(storage: MealPlanStorage, weekStart = storage.weekStart): PlannedMeal[] {
  return storage.byWeek[weekStart] ?? [];
}

export function setMealsForWeek(
  storage: MealPlanStorage,
  meals: PlannedMeal[],
  weekStart = storage.weekStart
): MealPlanStorage {
  return {
    weekStart: storage.weekStart,
    byWeek: { ...storage.byWeek, [weekStart]: meals }
  };
}

export function formatWeekRange(weekStart: string): string {
  const start = new Date(`${weekStart}T12:00:00`);
  if (Number.isNaN(start.getTime())) return weekStart;
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const fmt = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' });
  return `${fmt.format(start)} – ${fmt.format(end)}`;
}
