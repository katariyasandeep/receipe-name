<script lang="ts">
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { recipeToSearchResult, recipesService } from '$lib/api';
  import { ceProps } from '$lib/actions/ce-props';
  import ErrorBanner from '$lib/components/ErrorBanner.svelte';
  import { favorites } from '$lib/stores';
  import type { RecipeSearchResult } from '$lib/types';
  import { recipePath } from '$lib/utils';

  const CATEGORIES = [
    'Beef',
    'Chicken',
    'Dessert',
    'Pasta',
    'Seafood',
    'Vegetarian',
    'Breakfast',
    'Vegan'
  ] as const;

  let searchValue = $state('');
  let searching = $state(false);
  let featured = $state<RecipeSearchResult[]>([]);
  let featuredLoading = $state(true);
  let featuredError = $state<string | null>(null);

  async function loadFeatured() {
    featuredLoading = true;
    featuredError = null;
    try {
      const results = await Promise.all(
        Array.from({ length: 4 }, () => recipesService.getRandom())
      );
      const picks: RecipeSearchResult[] = [];
      const seen = new Set<string>();
      for (const result of results) {
        if (!result.ok) continue;
        const summary = recipeToSearchResult(result.data);
        if (seen.has(summary.id)) continue;
        seen.add(summary.id);
        picks.push(summary);
      }
      featured = picks;
      if (featured.length === 0) featuredError = 'Could not load featured recipes right now.';
    } catch (error) {
      console.error(error);
      featuredError = 'Could not load featured recipes right now.';
    } finally {
      featuredLoading = false;
    }
  }

  function onSearch(event: CustomEvent<{ query: string }>) {
    const q = event.detail?.query?.trim() ?? '';
    if (!q) return;
    searching = true;
    void goto(`/recipes?q=${encodeURIComponent(q)}`).finally(() => {
      searching = false;
    });
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
    void loadFeatured();
  });
</script>

<section class="hero" aria-labelledby="hero-title">
  <p class="eyebrow">Cook with confidence</p>
  <h1 id="hero-title" class="brand-hero">Recipe Finder</h1>
  <p class="lede">
    Search thousands of meals, filter by cuisine, and plan your week — all in one calm kitchen
    companion.
  </p>
  <div class="hero-search">
    <rf-search-bar
      value={searchValue}
      placeholder="Search chicken curry, pasta, dessert…"
      loading={searching}
      label="Search recipes"
      submitLabel="Search"
      onrfSearch={onSearch}
    ></rf-search-bar>
  </div>
  <div class="hero-actions">
    <a class="chip" href="/recipes">Browse all recipes</a>
    <a class="chip" href="/meal-planner">Open meal planner</a>
  </div>
</section>

<section class="section" aria-labelledby="categories-title">
  <h2 id="categories-title" class="section-title">Popular categories</h2>
  <div class="chip-row">
    {#each CATEGORIES as category}
      <a class="chip" href={`/recipes?category=${encodeURIComponent(category)}`}>{category}</a>
    {/each}
  </div>
</section>

<section class="section" aria-labelledby="featured-title">
  <div class="section-head">
    <h2 id="featured-title" class="section-title">Something delicious</h2>
    <rf-button variant="ghost" type="button" onrfClick={loadFeatured}>Refresh</rf-button>
  </div>
  {#if featuredError}
    <ErrorBanner message={featuredError} onRetry={loadFeatured} />
  {/if}
  {#if featuredLoading}
    <rf-loading-state label="Finding inspiration…"></rf-loading-state>
  {:else if featured.length > 0}
    <rf-recipe-grid
      label="Featured recipes"
      use:ceProps={{ recipes: featured, favoritedIds: favorites.ids }}
      onrfRecipeSelect={onRecipeSelect}
      onrfFavoriteToggle={onFavoriteToggle}
    ></rf-recipe-grid>
  {/if}
</section>

<style>
  .hero {
    position: relative;
    margin: 0 0 2.5rem;
    padding: clamp(1.75rem, 4vw, 3rem) 0 clamp(1.5rem, 3vw, 2.25rem);
    animation: rise 0.7s ease both;
  }
  .hero::before {
    content: '';
    position: absolute;
    inset: -1rem -1.25rem auto;
    height: min(72vh, 28rem);
    border-radius: 1.5rem;
    background:
      linear-gradient(135deg, rgba(15, 118, 110, 0.16), rgba(19, 78, 74, 0.05) 45%, transparent 70%),
      url('https://www.themealdb.com/images/media/meals/llcbn01574260722.jpg') center / cover no-repeat;
    opacity: 0.22;
    mask-image: linear-gradient(180deg, #000 35%, transparent 95%);
    pointer-events: none;
    z-index: -1;
  }
  .eyebrow {
    margin: 0 0 0.5rem;
    font-weight: 650;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    font-size: 0.75rem;
    color: var(--app-accent);
  }
  .brand-hero {
    font-size: clamp(2.6rem, 7vw, 4.4rem);
    font-weight: 800;
    letter-spacing: -0.045em;
    margin-bottom: 0.75rem;
  }
  .lede {
    max-width: 34rem;
    font-size: 1.08rem;
    color: var(--app-muted);
    margin-bottom: 1.35rem;
  }
  .hero-search {
    max-width: 36rem;
    margin-bottom: 1rem;
  }
  .hero-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  .section {
    margin-bottom: 2.5rem;
  }
  .section-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 0.35rem;
  }
  .section-head .section-title {
    margin-bottom: 0;
  }
  @keyframes rise {
    from {
      opacity: 0;
      transform: translateY(0.7rem);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
