<script lang="ts">
  import { ceProps } from '$lib/actions/ce-props';
  import PageHeader from '$lib/components/PageHeader.svelte';
  import { favorites, mealPlan, userRecipes } from '$lib/stores';
  import {
    DAY_LABELS,
    formatWeekRange,
    SLOT_LABELS,
    type AssignMealInput
  } from '$lib/stores/meal-plan-ops';
  import type { MealDay, MealSlot, PlannedMeal, RecipeSearchResult } from '$lib/types';
  import { recipesService } from '$lib/api';

  type EditorState = {
    day: MealDay;
    slot: MealSlot;
    meal?: PlannedMeal;
  };

  let editor = $state<EditorState | null>(null);
  let selectedRecipeId = $state('');
  let searchQuery = $state('');
  let searchResults = $state<RecipeSearchResult[]>([]);
  let searchLoading = $state(false);
  let searchError = $state<string | null>(null);
  let formError = $state<string | null>(null);

  const isEmpty = $derived(mealPlan.meals.length === 0);

  const libraryRecipes = $derived.by((): RecipeSearchResult[] => {
    const fromFavorites = favorites.items.map((f) => f.snapshot);
    const fromUser = userRecipes.items.map(
      (r): RecipeSearchResult => ({
        id: r.id,
        title: r.title,
        thumbnailUrl: r.thumbnailUrl,
        category: r.category,
        area: r.area
      })
    );
    const seen = new Set<string>();
    const merged: RecipeSearchResult[] = [];
    for (const r of [...fromFavorites, ...fromUser, ...searchResults]) {
      if (seen.has(r.id)) continue;
      seen.add(r.id);
      merged.push(r);
    }
    return merged;
  });

  const recipeOptions = $derived(
    libraryRecipes.map((r) => ({
      label: r.category ? `${r.title} · ${r.category}` : r.title,
      value: r.id
    }))
  );

  const editorHeading = $derived(
    editor
      ? editor.meal
        ? `Change ${SLOT_LABELS[editor.slot]} · ${DAY_LABELS[editor.day]}`
        : `Plan ${SLOT_LABELS[editor.slot]} · ${DAY_LABELS[editor.day]}`
      : ''
  );

  function openEditor(detail: { day: MealDay; slot: MealSlot; meal?: PlannedMeal }) {
    editor = { day: detail.day, slot: detail.slot, meal: detail.meal };
    selectedRecipeId = detail.meal?.recipeId ?? '';
    formError = null;
    searchQuery = '';
    searchResults = [];
    searchError = null;
  }

  function closeEditor() {
    editor = null;
    formError = null;
  }

  function onSlotClick(event: CustomEvent<{ day: MealDay; slot: MealSlot; meal?: PlannedMeal }>) {
    if (!event.detail) return;
    openEditor(event.detail);
  }

  function onMealRemove(event: CustomEvent<{ meal: PlannedMeal }>) {
    const meal = event.detail?.meal;
    if (meal) mealPlan.remove(meal.id);
  }

  function onMealMove(event: CustomEvent<{ mealId: string; toDay: MealDay; toSlot: MealSlot }>) {
    const { mealId, toDay, toSlot } = event.detail ?? {};
    if (mealId && toDay && toSlot) mealPlan.move(mealId, toDay, toSlot);
  }

  function onRecipeChange(event: CustomEvent<string>) {
    selectedRecipeId = event.detail ?? '';
    formError = null;
  }

  let searchGeneration = 0;

  async function runSearch(query: string) {
    const q = query.trim();
    searchQuery = q;
    const generation = ++searchGeneration;
    if (!q) {
      searchResults = [];
      return;
    }
    searchLoading = true;
    searchError = null;
    const result = await recipesService.search(q);
    if (generation !== searchGeneration) return;
    searchLoading = false;
    if (!result.ok) {
      searchError = result.error.message;
      searchResults = [];
      return;
    }
    searchResults = result.data;
    if (result.data.length === 1) {
      selectedRecipeId = result.data[0].id;
    }
  }

  function onSearchSubmit(event: CustomEvent<{ query: string }>) {
    void runSearch(event.detail?.query ?? '');
  }

  function saveAssignment() {
    if (!editor) return;
    const snapshot = libraryRecipes.find((r) => r.id === selectedRecipeId);
    if (!snapshot) {
      formError = 'Choose a recipe from favorites, my recipes, or search.';
      return;
    }

    const input: AssignMealInput = {
      day: editor.day,
      slot: editor.slot,
      recipeId: snapshot.id,
      snapshot,
      existingId: editor.meal?.id
    };
    mealPlan.assign(input);
    closeEditor();
  }

  function removeFromEditor() {
    if (!editor?.meal) return;
    mealPlan.remove(editor.meal.id);
    closeEditor();
  }
</script>

<PageHeader
  title="Meal planner"
  subtitle="Map breakfast, lunch, and dinner across the week. Drag meals between slots or tap a cell to assign a recipe."
/>

<div class="toolbar">
  <div class="week-nav" role="group" aria-label="Week navigation">
    <rf-button variant="ghost" type="button" onrfClick={() => mealPlan.shiftWeek(-1)}>
      Previous week
    </rf-button>
    <p class="week-range">{formatWeekRange(mealPlan.weekStart)}</p>
    <rf-button variant="ghost" type="button" onrfClick={() => mealPlan.shiftWeek(1)}>
      Next week
    </rf-button>
  </div>
  <div class="toolbar-actions">
    {#if !isEmpty}
      <rf-button variant="ghost" type="button" onrfClick={() => mealPlan.clear()}>
        Clear week
      </rf-button>
    {/if}
    <a class="chip" href="/recipes">Browse recipes</a>
    <a class="chip" href="/favorites">Favorites</a>
  </div>
</div>

{#if isEmpty}
  <div class="empty-hint panel">
    <rf-empty-state
      heading="Your week is open"
      message="Tap any empty slot to assign a recipe. Save favorites or create recipes first for the quickest picks — or search TheMealDB from the planner."
    >
      <div slot="action" class="hint-actions">
        <a class="chip" href="/favorites">Open favorites</a>
        <a class="chip" href="/my-recipes">My recipes</a>
      </div>
    </rf-empty-state>
  </div>
{/if}

<section class="planner" aria-label="Weekly meal plan">
  <rf-meal-plan-week
    use:ceProps={{ weekStart: mealPlan.weekStart, meals: mealPlan.meals }}
    onrfSlotClick={onSlotClick}
    onrfMealRemove={onMealRemove}
    onrfMealMove={onMealMove}
  >
    <div slot="header" class="plan-header">
      <p class="plan-meta">
        {mealPlan.meals.length}
        {mealPlan.meals.length === 1 ? 'meal' : 'meals'} planned · empty slots show Add · drag to
        move
      </p>
    </div>
  </rf-meal-plan-week>
</section>

<rf-modal open={!!editor} heading={editorHeading} onrfClose={closeEditor}>
  {#if editor}
    <div class="editor-body">
      <p class="editor-lead">
        {#if editor.meal}
          Replace <strong>{editor.meal.snapshot.title}</strong> or pick another recipe for this
          slot.
        {:else}
          Choose a recipe for <strong>{DAY_LABELS[editor.day]}</strong>
          {SLOT_LABELS[editor.slot].toLowerCase()}.
        {/if}
      </p>

      <rf-search-bar
        value={searchQuery}
        placeholder="Search TheMealDB…"
        loading={searchLoading}
        onrfSearch={onSearchSubmit}
      ></rf-search-bar>

      {#if searchError}
        <p class="field-error" role="alert">{searchError}</p>
      {/if}

      {#if recipeOptions.length === 0}
        <p class="muted">
          No recipes available yet. Search above, or add favorites / personal recipes first.
        </p>
      {:else}
        <rf-select
          label="Recipe"
          placeholder="Select a recipe…"
          required
          value={selectedRecipeId}
          use:ceProps={{ options: recipeOptions }}
          error={formError ?? undefined}
          onrfChange={onRecipeChange}
        ></rf-select>
      {/if}
    </div>

    <div slot="footer" class="editor-footer">
      {#if editor.meal}
        <rf-button variant="danger" type="button" onrfClick={removeFromEditor}>Remove</rf-button>
      {/if}
      <rf-button variant="ghost" type="button" onrfClick={closeEditor}>Cancel</rf-button>
      <rf-button variant="primary" type="button" onrfClick={saveAssignment}>
        {editor.meal ? 'Update meal' : 'Add meal'}
      </rf-button>
    </div>
  {/if}
</rf-modal>

<style>
  .toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1.25rem;
  }

  .week-nav {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.65rem;
  }

  .week-range {
    margin: 0;
    min-width: 9.5rem;
    text-align: center;
    font-weight: 700;
    font-family: var(--rf-font-display);
    letter-spacing: -0.02em;
  }

  .toolbar-actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
  }

  .empty-hint {
    margin-bottom: 1.25rem;
  }

  .hint-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .planner {
    margin-top: 0.25rem;
  }

  .plan-header {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }

  .plan-meta {
    margin: 0;
    color: var(--app-muted);
    font-size: 0.9rem;
  }

  .editor-body {
    display: grid;
    gap: 1rem;
  }

  .editor-lead {
    margin: 0;
    color: var(--app-muted);
  }

  .muted {
    margin: 0;
    color: var(--app-muted);
  }

  .field-error {
    margin: 0;
    color: var(--app-danger);
    font-size: 0.9rem;
  }

  .editor-footer {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 0.5rem;
    width: 100%;
  }

  @media (max-width: 640px) {
    .week-range {
      width: 100%;
      order: -1;
    }

    .toolbar {
      align-items: stretch;
    }
  }
</style>
