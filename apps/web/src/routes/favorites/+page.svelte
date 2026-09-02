<script lang="ts">
  import { goto } from '$app/navigation';
  import { ceProps } from '$lib/actions/ce-props';
  import PageHeader from '$lib/components/PageHeader.svelte';
  import { favorites } from '$lib/stores';
  import type { RecipeSearchResult } from '$lib/types';
  import { appPath, recipePath } from '$lib/utils';

  const recipes = $derived(favorites.items.map((f) => f.snapshot));

  function onRecipeSelect(event: CustomEvent<{ recipe: RecipeSearchResult }>) {
    const recipe = event.detail?.recipe;
    if (recipe) void goto(recipePath(recipe.id));
  }

  function onFavoriteToggle(event: CustomEvent<{ recipe: RecipeSearchResult; active: boolean }>) {
    const recipe = event.detail?.recipe;
    if (!recipe) return;
    favorites.setFavorite(recipe, Boolean(event.detail?.active));
  }
</script>

<PageHeader
  title="Favorites"
  subtitle="Recipes you save appear here for quick access."
/>

{#if favorites.isEmpty}
  <rf-empty-state
    heading="No favorites yet"
    message="Tap the heart on any recipe card to save it for later."
  >
    <div slot="action">
      <a class="chip" href={appPath('/recipes')}>Discover recipes</a>
    </div>
  </rf-empty-state>
{:else}
  <p class="result-meta">{recipes.length} favorite{recipes.length === 1 ? '' : 's'}</p>
  <rf-recipe-grid
    label="Favorite recipes"
    use:ceProps={{ recipes, favoritedIds: favorites.ids }}
    onrfRecipeSelect={onRecipeSelect}
    onrfFavoriteToggle={onFavoriteToggle}
  ></rf-recipe-grid>
{/if}

<style>
  .result-meta {
    margin: 0 0 0.85rem;
    color: var(--app-muted);
    font-weight: 600;
    font-size: 0.92rem;
  }
</style>
