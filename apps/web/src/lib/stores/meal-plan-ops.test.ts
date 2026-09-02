import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PlannedMeal, RecipeSearchResult } from '$lib/types';
import { loadJson, saveJson } from '$lib/utils/storage';
import {
  assignMeal,
  createMealId,
  mealAt,
  mealsForDay,
  mealsForWeek,
  moveMeal,
  normalizeMealPlanStorage,
  removeMeal,
  setMealsForWeek,
  shiftWeekStart,
  switchWeek,
  updateMeal
} from './meal-plan-ops';

const pasta: RecipeSearchResult = {
  id: 'mealdb:52771',
  title: 'Spicy Arrabiata Penne',
  thumbnailUrl: 'https://example.com/pasta.jpg',
  category: 'Vegetarian'
};

const salad: RecipeSearchResult = {
  id: 'mealdb:52960',
  title: 'Salmon Avocado Salad',
  thumbnailUrl: 'https://example.com/salad.jpg',
  category: 'Seafood'
};

const soup: RecipeSearchResult = {
  id: 'user:abc',
  title: 'Tomato Soup',
  category: 'Starter'
};

function meal(
  partial: Partial<PlannedMeal> & Pick<PlannedMeal, 'day' | 'slot' | 'recipeId' | 'snapshot'>
): PlannedMeal {
  return {
    id: partial.id ?? createMealId(),
    day: partial.day,
    slot: partial.slot,
    recipeId: partial.recipeId,
    snapshot: partial.snapshot
  };
}

describe('meal-plan-ops', () => {
  describe('assignMeal (add)', () => {
    it('adds a meal to the correct day and slot', () => {
      const next = assignMeal([], {
        day: 'wed',
        slot: 'lunch',
        recipeId: pasta.id,
        snapshot: pasta
      });

      expect(next).toHaveLength(1);
      expect(next[0].day).toBe('wed');
      expect(next[0].slot).toBe('lunch');
      expect(next[0].recipeId).toBe(pasta.id);
      expect(next[0].snapshot.title).toBe(pasta.title);
      expect(mealAt(next, 'wed', 'lunch')?.recipeId).toBe(pasta.id);
      expect(mealAt(next, 'mon', 'lunch')).toBeUndefined();
    });

    it('supports multiple meals on the same day via different slots', () => {
      let meals = assignMeal([], {
        day: 'mon',
        slot: 'breakfast',
        recipeId: soup.id,
        snapshot: soup
      });
      meals = assignMeal(meals, {
        day: 'mon',
        slot: 'dinner',
        recipeId: pasta.id,
        snapshot: pasta
      });

      const monday = mealsForDay(meals, 'mon');
      expect(monday).toHaveLength(2);
      expect(mealAt(meals, 'mon', 'breakfast')?.snapshot.title).toBe('Tomato Soup');
      expect(mealAt(meals, 'mon', 'dinner')?.snapshot.title).toBe('Spicy Arrabiata Penne');
    });

    it('replaces an existing meal in the same day/slot when adding', () => {
      const first = assignMeal([], {
        day: 'fri',
        slot: 'dinner',
        recipeId: pasta.id,
        snapshot: pasta
      });
      const second = assignMeal(first, {
        day: 'fri',
        slot: 'dinner',
        recipeId: salad.id,
        snapshot: salad
      });

      expect(second).toHaveLength(1);
      expect(second[0].recipeId).toBe(salad.id);
    });
  });

  describe('updateMeal', () => {
    it('updates recipe snapshot for an existing meal', () => {
      const existing = meal({
        id: 'm1',
        day: 'tue',
        slot: 'lunch',
        recipeId: pasta.id,
        snapshot: pasta
      });
      const next = updateMeal([existing], 'm1', {
        recipeId: salad.id,
        snapshot: salad
      });

      expect(next).toHaveLength(1);
      expect(next[0].id).toBe('m1');
      expect(next[0].day).toBe('tue');
      expect(next[0].slot).toBe('lunch');
      expect(next[0].recipeId).toBe(salad.id);
      expect(next[0].snapshot.title).toBe(salad.title);
    });

    it('moves a meal to another day while keeping the id', () => {
      const existing = meal({
        id: 'm2',
        day: 'mon',
        slot: 'breakfast',
        recipeId: soup.id,
        snapshot: soup
      });
      const next = updateMeal([existing], 'm2', { day: 'sun', slot: 'dinner' });

      expect(next).toHaveLength(1);
      expect(next[0].id).toBe('m2');
      expect(next[0].day).toBe('sun');
      expect(next[0].slot).toBe('dinner');
      expect(mealAt(next, 'mon', 'breakfast')).toBeUndefined();
      expect(mealAt(next, 'sun', 'dinner')?.id).toBe('m2');
    });
  });

  describe('removeMeal', () => {
    it('removes only the targeted meal', () => {
      const a = meal({
        id: 'a',
        day: 'mon',
        slot: 'lunch',
        recipeId: pasta.id,
        snapshot: pasta
      });
      const b = meal({
        id: 'b',
        day: 'tue',
        slot: 'lunch',
        recipeId: salad.id,
        snapshot: salad
      });
      const next = removeMeal([a, b], 'a');
      expect(next).toEqual([b]);
    });
  });

  describe('assigning correct day', () => {
    it('keeps each assignment on its declared weekday', () => {
      let meals: PlannedMeal[] = [];
      const days = ['mon', 'wed', 'fri', 'sun'] as const;
      for (const day of days) {
        meals = assignMeal(meals, {
          day,
          slot: 'dinner',
          recipeId: pasta.id,
          snapshot: pasta
        });
      }

      for (const day of days) {
        expect(mealAt(meals, day, 'dinner')?.day).toBe(day);
      }
      expect(mealAt(meals, 'tue', 'dinner')).toBeUndefined();
      expect(meals.every((m) => m.slot === 'dinner')).toBe(true);
    });
  });

  describe('moveMeal', () => {
    it('moves to an empty slot', () => {
      const existing = meal({
        id: 'm3',
        day: 'thu',
        slot: 'lunch',
        recipeId: pasta.id,
        snapshot: pasta
      });
      const next = moveMeal([existing], 'm3', 'sat', 'breakfast');
      expect(next[0]).toMatchObject({ id: 'm3', day: 'sat', slot: 'breakfast' });
    });

    it('swaps with an occupied slot', () => {
      const a = meal({
        id: 'a',
        day: 'mon',
        slot: 'lunch',
        recipeId: pasta.id,
        snapshot: pasta
      });
      const b = meal({
        id: 'b',
        day: 'tue',
        slot: 'dinner',
        recipeId: salad.id,
        snapshot: salad
      });
      const next = moveMeal([a, b], 'a', 'tue', 'dinner');
      expect(mealAt(next, 'tue', 'dinner')?.id).toBe('a');
      expect(mealAt(next, 'mon', 'lunch')?.id).toBe('b');
    });
  });

  describe('shiftWeekStart', () => {
    it('shifts ISO Mondays by weeks', () => {
      expect(shiftWeekStart('2026-08-24', 1)).toBe('2026-08-31');
      expect(shiftWeekStart('2026-08-24', -1)).toBe('2026-08-17');
    });
  });
});

describe('meal plan persistence (localStorage)', () => {
  const KEY = 'rf:meal-plan';
  let store: Map<string, string>;

  beforeEach(() => {
    store = new Map();
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
      setItem: (key: string, value: string) => {
        store.set(key, value);
      },
      removeItem: (key: string) => {
        store.delete(key);
      },
      clear: () => store.clear()
    });
  });

  it('persists assigned meals and reloads them', () => {
    const meals = assignMeal([], {
      day: 'thu',
      slot: 'breakfast',
      recipeId: soup.id,
      snapshot: soup,
      existingId: 'persist-1'
    });
    const plan = { weekStart: '2026-08-24', meals };

    expect(saveJson(KEY, plan)).toBe(true);
    const loaded = loadJson<typeof plan | null>(KEY, null);
    expect(loaded).not.toBeNull();
    expect(loaded!.weekStart).toBe('2026-08-24');
    expect(loaded!.meals).toHaveLength(1);
    expect(loaded!.meals[0].day).toBe('thu');
    expect(loaded!.meals[0].slot).toBe('breakfast');
    expect(loaded!.meals[0].recipeId).toBe(soup.id);
    expect(loaded!.meals[0].snapshot.title).toBe('Tomato Soup');
  });

  it('persists updates and removals', () => {
    let meals = assignMeal([], {
      day: 'mon',
      slot: 'lunch',
      recipeId: pasta.id,
      snapshot: pasta,
      existingId: 'x1'
    });
    meals = updateMeal(meals, 'x1', { recipeId: salad.id, snapshot: salad });
    saveJson(KEY, { weekStart: '2026-08-24', meals });

    let loaded = loadJson<{ weekStart: string; meals: PlannedMeal[] }>(KEY, {
      weekStart: '',
      meals: []
    });
    expect(loaded.meals[0].snapshot.title).toBe(salad.title);

    meals = removeMeal(loaded.meals, 'x1');
    saveJson(KEY, { weekStart: '2026-08-24', meals });
    loaded = loadJson(KEY, { weekStart: '', meals: [] });
    expect(loaded.meals).toHaveLength(0);
  });
});

describe('per-week meal plan storage', () => {
  it('migrates legacy { weekStart, meals } into byWeek', () => {
    const legacy = {
      weekStart: '2026-08-24',
      meals: [
        meal({
          id: 'm1',
          day: 'mon',
          slot: 'breakfast',
          recipeId: pasta.id,
          snapshot: pasta
        })
      ]
    };
    const normalized = normalizeMealPlanStorage(legacy, '2026-08-17');
    expect(normalized.weekStart).toBe('2026-08-24');
    expect(mealsForWeek(normalized)).toHaveLength(1);
    expect(mealsForWeek(normalized)[0].recipeId).toBe(pasta.id);
  });

  it('keeps meals isolated when switching weeks', () => {
    let storage = normalizeMealPlanStorage(
      {
        weekStart: '2026-08-24',
        byWeek: {
          '2026-08-24': [
            meal({
              id: 'm1',
              day: 'tue',
              slot: 'dinner',
              recipeId: salad.id,
              snapshot: salad
            })
          ]
        }
      },
      '2026-08-24'
    );

    storage = switchWeek(storage, '2026-08-31');
    expect(storage.weekStart).toBe('2026-08-31');
    expect(mealsForWeek(storage)).toEqual([]);

    storage = setMealsForWeek(storage, [
      meal({
        id: 'm2',
        day: 'wed',
        slot: 'lunch',
        recipeId: soup.id,
        snapshot: soup
      })
    ]);
    expect(mealsForWeek(storage)).toHaveLength(1);

    storage = switchWeek(storage, '2026-08-24');
    expect(mealsForWeek(storage)[0].recipeId).toBe(salad.id);
  });

  it('shifts weekStart by seven days', () => {
    expect(shiftWeekStart('2026-08-24', 1)).toBe('2026-08-31');
    expect(shiftWeekStart('2026-08-24', -1)).toBe('2026-08-17');
  });
});
