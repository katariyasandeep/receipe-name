import { browser } from '$app/environment';
import type { MealDay, MealPlan, MealSlot, PlannedMeal, RecipeSearchResult } from '$lib/types';
import { mondayOfWeek } from '$lib/utils';
import { loadJson, saveJson } from '$lib/utils/storage';
import {
  assignMeal,
  mealsForWeek,
  moveMeal,
  normalizeMealPlanStorage,
  removeMeal,
  setMealsForWeek,
  shiftWeekStart,
  switchWeek,
  updateMeal,
  type AssignMealInput,
  type MealPlanStorage
} from './meal-plan-ops';

const KEY = 'rf:meal-plan';

function emptyStorage(weekStart = mondayOfWeek()): MealPlanStorage {
  return { weekStart, byWeek: {} };
}

function toPlan(storage: MealPlanStorage): MealPlan {
  return {
    weekStart: storage.weekStart,
    meals: mealsForWeek(storage)
  };
}

function createMealPlanStore() {
  let storage = $state<MealPlanStorage>(emptyStorage());
  let ready = false;

  function ensureHydrated() {
    if (!browser || ready) return;
    const loaded = loadJson<unknown>(KEY, null);
    storage = normalizeMealPlanStorage(loaded, mondayOfWeek());
    ready = true;
  }

  function persist() {
    if (!browser) return;
    if (!saveJson(KEY, storage)) {
      console.warn('[meal-plan] Could not save locally');
    }
  }

  function commitMeals(meals: PlannedMeal[]) {
    storage = setMealsForWeek(storage, meals);
    persist();
  }

  return {
    get plan(): MealPlan {
      ensureHydrated();
      return toPlan(storage);
    },
    get meals(): PlannedMeal[] {
      ensureHydrated();
      return mealsForWeek(storage);
    },
    get weekStart(): string {
      ensureHydrated();
      return storage.weekStart;
    },
    setWeekStart(weekStart: string) {
      ensureHydrated();
      storage = switchWeek(storage, weekStart);
      persist();
    },
    shiftWeek(deltaWeeks: number) {
      ensureHydrated();
      const next = shiftWeekStart(storage.weekStart, deltaWeeks);
      storage = switchWeek(storage, next);
      persist();
    },
    setMeals(meals: PlannedMeal[]) {
      ensureHydrated();
      commitMeals(meals);
    },
    /** Add or replace a meal at a day/slot (assignment). */
    assign(input: AssignMealInput) {
      ensureHydrated();
      commitMeals(assignMeal(mealsForWeek(storage), input));
    },
    /** Update an existing planned meal (modification). */
    update(
      id: string,
      patch: Partial<Pick<PlannedMeal, 'day' | 'slot' | 'recipeId' | 'snapshot'>>
    ) {
      ensureHydrated();
      commitMeals(updateMeal(mealsForWeek(storage), id, patch));
    },
    /** Convenience: assign recipe to day/slot, optionally replacing existingId. */
    setRecipe(
      day: MealDay,
      slot: MealSlot,
      snapshot: RecipeSearchResult,
      existingId?: string
    ) {
      this.assign({
        day,
        slot,
        recipeId: snapshot.id,
        snapshot,
        existingId
      });
    },
    remove(id: string) {
      ensureHydrated();
      commitMeals(removeMeal(mealsForWeek(storage), id));
    },
    move(mealId: string, toDay: MealDay, toSlot: MealSlot) {
      ensureHydrated();
      commitMeals(moveMeal(mealsForWeek(storage), mealId, toDay, toSlot));
    },
    clear() {
      ensureHydrated();
      storage = setMealsForWeek(storage, []);
      persist();
    }
  };
}

export const mealPlan = createMealPlanStore();
