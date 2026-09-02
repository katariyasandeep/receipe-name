<script lang="ts">
  import { afterNavigate, goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { recipesService } from '$lib/api';
  import { ceProps } from '$lib/actions/ce-props';
  import ErrorBanner from '$lib/components/ErrorBanner.svelte';
  import PageHeader from '$lib/components/PageHeader.svelte';
  import { favorites } from '$lib/stores';
  import type { RecipeFilter, RecipeSearchResult } from '$lib/types';
  import { appPath, recipePath, stripBasePath } from '$lib/utils';

  const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  let query = $state('');
  let category = $state('');
  let area = $state('');
  let ingredient = $state('');
  let letter = $state('');
  let categories = $state<string[]>([]);
  let areas = $state<string[]>([]);
  let results = $state<RecipeSearchResult[]>([]);
  let loading = $state(false);
  let error = $state<string | null>(null);
  let hasSearched = $state(false);
  let empty = $state(false);
  let discoveryGeneration = 0;

  function readParams(url: URL) {
    const params = url.searchParams;
    query = params.get('q') ?? '';
    category = params.get('category') ?? '';
    area = params.get('area') ?? '';
    ingredient = params.get('ingredient') ?? '';
    letter = params.get('letter') ?? '';
  }

  function currentFilter(): RecipeFilter {
    return {
      query: query || undefined,
      category: category || undefined,
      area: area || undefined,
      ingredient: ingredient || undefined,
      letter: letter || undefined
    };
  }

  function hasCriteria(filter: RecipeFilter): boolean {
    return Boolean(
      filter.query?.trim() ||
        filter.category?.trim() ||
        filter.area?.trim() ||
        filter.ingredient?.trim() ||
        filter.letter?.trim()
    );
  }

  async function syncUrl(filter: RecipeFilter) {
    const params = new URLSearchParams();
    if (filter.query) params.set('q', filter.query);
    if (filter.category) params.set('category', filter.category);
    if (filter.area) params.set('area', filter.area);
    if (filter.ingredient) params.set('ingredient', filter.ingredient);
    if (filter.letter) params.set('letter', filter.letter);
    const qs = params.toString();
    await goto(qs ? `/recipes?${qs}` : '/recipes', {
      replaceState: true,
      keepFocus: true,
      noScroll: true
    });
  }

  async function runDiscovery(filter: RecipeFilter = currentFilter()) {
    const generation = ++discoveryGeneration;
    if (!hasCriteria(filter)) {
      if (generation !== discoveryGeneration) return;
      results = [];
      empty = false;
      hasSearched = false;
      error = null;
      loading = false;
      return;
    }
    loading = true;
    error = null;
    hasSearched = true;
    const result = await recipesService.find(filter);
    if (generation !== discoveryGeneration) return;
    if (result.ok) {
      results = result.data;
      empty = result.empty || result.data.length === 0;
    } else {
      console.error(result.error);
      results = [];
      empty = false;
      error = result.error.message || 'Failed to load recipes.';
    }
    loading = false;
  }

  async function loadFacets() {
    const result = await recipesService.listFacets();
    if (result.ok) {
      categories = result.data.categories;
      areas = result.data.areas;
    }
  }

  function onSearch(event: CustomEvent<{ query: string }>) {
    query = event.detail?.query?.trim() ?? '';
    letter = '';
    const filter = currentFilter();
    void syncUrl(filter).then(() => runDiscovery(filter));
  }

  function onFilterChange(
    event: CustomEvent<{
      query?: string;
      category?: string;
      area?: string;
      ingredient?: string;
      letter?: string;
    }>
  ) {
    const next = event.detail ?? {};
    category = next.category?.trim() ?? '';
    area = next.area?.trim() ?? '';
    ingredient = next.ingredient?.trim() ?? '';
    if (typeof next.query === 'string') query = next.query;
    const filter = currentFilter();
    void syncUrl(filter).then(() => runDiscovery(filter));
  }

  function onLetter(next: string) {
    letter = letter === next ? '' : next;
    query = '';
    const filter = currentFilter();
    void syncUrl(filter).then(() => runDiscovery(filter));
  }

  function onRecipeSelect(event: CustomEvent<{ recipe: RecipeSearchResult }>) {
    const recipe = event.detail?.recipe;
    if (recipe) void goto(recipePath(recipe.id));
  }

  function onFavoriteToggle(event: CustomEvent<{ recipe: RecipeSearchResult; active: boolean }>) {
    const recipe = event.detail?.recipe;
    if (!recipe) return;
    favorites.setFavorite(recipe, Boolean(event.detail?.active));
  }

  onMount(() => {
    void loadFacets();
  });

  // afterNavigate also runs on the initial navigation — avoid duplicating discovery in onMount.
  afterNavigate(({ to }) => {
    if (!to || stripBasePath(to.url.pathname) !== '/recipes') return;
    readParams(to.url);
    void runDiscovery(currentFilter());
  });
</script>

<PageHeader
  title="Discover recipes"
  subtitle="Search by name, filter by category or cuisine, or browse A–Z."
/>

<div class="stack-gap">
  <div class="panel search-panel">
    <rf-search-bar
      value={query}
      placeholder="Search by recipe name…"
      loading={loading}
      label="Search recipes"
      submitLabel="Search"
      onrfSearch={onSearch}
    ></rf-search-bar>

    <div class="letter-row" role="group" aria-label="Browse by letter">
      {#each LETTERS as L}
        <button
          type="button"
          class="letter-btn"
          class:is-active={letter.toUpperCase() === L}
          aria-pressed={letter.toUpperCase() === L}
          onclick={() => onLetter(L)}
        >
          {L}
        </button>
      {/each}
    </div>

    <rf-filter-panel
      showIngredient={true}
      use:ceProps={{
        categories,
        areas,
        value: { category, area, ingredient, query, letter }
      }}
      onrfFilterChange={onFilterChange}
    ></rf-filter-panel>
  </div>

  {#if error}
    <ErrorBanner message={error} onRetry={() => runDiscovery()} />
  {/if}

  {#if loading}
    <rf-loading-state label="Searching recipes…"></rf-loading-state>
  {:else if !hasSearched}
    <rf-empty-state
      heading="Start exploring"
      message="Try a search, pick a category, or tap a letter to browse."
    >
      <div slot="action">
        <a class="chip" href={`${appPath('/recipes')}?category=Chicken`}>Try Chicken</a>
      </div>
    </rf-empty-state>
  {:else if empty}
    <rf-empty-state
      heading="No recipes found"
      message="Try another category, cuisine, or spelling."
    >
      <div slot="action">
        <a class="chip" href={appPath('/recipes')}>Clear filters</a>
      </div>
    </rf-empty-state>
  {:else}
    <p class="result-meta">{results.length} recipe{results.length === 1 ? '' : 's'}</p>
    <rf-recipe-grid
      label="Search results"
      use:ceProps={{ recipes: results, favoritedIds: favorites.ids }}
      onrfRecipeSelect={onRecipeSelect}
      onrfFavoriteToggle={onFavoriteToggle}
    ></rf-recipe-grid>
  {/if}
</div>

<style>
  .search-panel {
    display: grid;
    gap: 0.85rem;
  }
  .result-meta {
    margin: 0;
    color: var(--app-muted);
    font-weight: 600;
    font-size: 0.92rem;
  }
</style>
