<script lang="ts">
  import { page } from '$app/state';
  import { untrack } from 'svelte';
  import { recipeToSearchResult, recipesService } from '$lib/api';
  import ErrorBanner from '$lib/components/ErrorBanner.svelte';
  import { favorites, userRecipes } from '$lib/stores';
  import type { Recipe, UserRecipe } from '$lib/types';
  import { appPath, isUserId, parseRecipeId } from '$lib/utils';

  let recipe = $state<Recipe | null>(null);
  let loading = $state(true);
  let error = $state<string | null>(null);
  let notFound = $state(false);
  let loadGeneration = 0;

  const favorited = $derived(recipe ? favorites.isFavorite(recipe.id) : false);
  const userRecipe = $derived(
    recipe?.source === 'user' ? (recipe as UserRecipe) : null
  );
  const steps = $derived(
    recipe?.instructions
      ? recipe.instructions
          .split(/\n+/)
          .map((s) => s.trim())
          .filter(Boolean)
      : []
  );

  async function load(idParam: string) {
    const generation = ++loadGeneration;
    loading = true;
    error = null;
    notFound = false;
    recipe = null;

    try {
      const decoded = decodeURIComponent(idParam);
      if (!decoded || !parseRecipeId(decoded)) {
        notFound = true;
        return;
      }

      if (isUserId(decoded)) {
        const local = userRecipes.getById(decoded);
        if (!local) {
          notFound = true;
          return;
        }
        recipe = local;
        return;
      }

      const result = await recipesService.getById(decoded);
      if (generation !== loadGeneration) return;
      if (result.ok) {
        recipe = result.data;
      } else if (result.error.code === 'not_found') {
        notFound = true;
      } else {
        console.error(result.error);
        error = result.error.message || 'Failed to load recipe.';
      }
    } catch (err) {
      if (generation !== loadGeneration) return;
      console.error(err);
      error = 'Failed to load recipe.';
    } finally {
      if (generation === loadGeneration) {
        loading = false;
      }
    }
  }

  function onFavoriteToggle(event: CustomEvent<{ active: boolean }>) {
    if (!recipe) return;
    favorites.setFavorite(recipeToSearchResult(recipe), Boolean(event.detail?.active));
  }

  // Track only the route id — untrack load() so state writes don't re-trigger forever.
  $effect(() => {
    const id = page.params.id;
    if (!id) return;
    untrack(() => {
      void load(id);
    });
  });
</script>

{#if loading}
  <rf-loading-state label="Loading recipe…"></rf-loading-state>
{:else if error}
  <ErrorBanner message={error} onRetry={() => load(page.params.id ?? '')} />
{:else if notFound || !recipe}
  <rf-empty-state
    heading="Recipe not found"
    message="This recipe may have been removed, or the link is invalid."
  >
    <div slot="action">
      <a class="chip" href={appPath('/recipes')}>Back to discover</a>
    </div>
  </rf-empty-state>
{:else}
  <article class="detail">
    <div class="detail-hero">
      {#if recipe.thumbnailUrl}
        <img class="detail-image" src={recipe.thumbnailUrl} alt={recipe.title} />
      {:else}
        <div class="detail-image placeholder" aria-hidden="true"></div>
      {/if}
      <div class="detail-overlay">
        <p class="meta">
          {#if recipe.category}<span>{recipe.category}</span>{/if}
          {#if recipe.area}<span>{recipe.area}</span>{/if}
          <span class="source">{recipe.source === 'user' ? 'Your recipe' : 'TheMealDB'}</span>
        </p>
        <div class="title-row">
          <h1>{recipe.title}</h1>
          <rf-favorite-button active={favorited} onrfToggle={onFavoriteToggle}
          ></rf-favorite-button>
        </div>
        {#if userRecipe?.description}
          <p class="user-desc">{userRecipe.description}</p>
        {/if}
        {#if userRecipe && (userRecipe.prepTimeMinutes != null || userRecipe.cookTimeMinutes != null || userRecipe.servings != null)}
          <div class="timing-row">
            {#if userRecipe.prepTimeMinutes != null}
              <span>Prep {userRecipe.prepTimeMinutes}m</span>
            {/if}
            {#if userRecipe.cookTimeMinutes != null}
              <span>Cook {userRecipe.cookTimeMinutes}m</span>
            {/if}
            {#if userRecipe.servings != null}
              <span>Serves {userRecipe.servings}</span>
            {/if}
          </div>
        {/if}
        {#if recipe.tags?.length}
          <div class="chip-row tags">
            {#each recipe.tags as tag}
              <span class="tag">{tag}</span>
            {/each}
          </div>
        {/if}
      </div>
    </div>

    <div class="detail-grid">
      <section class="panel" aria-labelledby="ingredients-title">
        <h2 id="ingredients-title" class="section-title">Ingredients</h2>
        {#if recipe.ingredients.length === 0}
          <p class="muted">No ingredients listed.</p>
        {:else}
          <ul class="ingredients">
            {#each recipe.ingredients as item}
              <li>
                <span class="measure">{item.measure}</span>
                <span class="name">{item.name}</span>
              </li>
            {/each}
          </ul>
        {/if}
      </section>

      <section class="panel" aria-labelledby="instructions-title">
        <h2 id="instructions-title" class="section-title">Instructions</h2>
        {#if steps.length === 0}
          <p class="muted">No instructions provided.</p>
        {:else}
          <ol class="steps">
            {#each steps as step, i}
              <li>
                <span class="step-num">{i + 1}</span>
                <p>{step}</p>
              </li>
            {/each}
          </ol>
        {/if}
      </section>
    </div>

    <div class="detail-links">
      {#if recipe.youtubeUrl}
        <a class="chip" href={recipe.youtubeUrl} target="_blank" rel="noopener noreferrer"
          >Watch on YouTube</a
        >
      {/if}
      {#if recipe.sourceUrl}
        <a class="chip" href={recipe.sourceUrl} target="_blank" rel="noopener noreferrer"
          >Original source</a
        >
      {/if}
      <a class="chip" href={appPath('/recipes')}>Find more recipes</a>
      {#if recipe.source === 'user'}
        <a class="chip" href={appPath(`/my-recipes/${encodeURIComponent(recipe.id)}/edit`)}>Edit recipe</a>
      {/if}
    </div>
  </article>
{/if}

<style>
  .detail { animation: rise 0.55s ease both; }
  .detail-hero {
    position: relative;
    border-radius: 1.25rem;
    overflow: hidden;
    margin-bottom: 1.5rem;
    min-height: clamp(16rem, 42vw, 24rem);
    background: #134e4a;
    box-shadow: var(--rf-shadow-md);
  }
  .detail-image {
    width: 100%;
    height: clamp(16rem, 42vw, 24rem);
    object-fit: cover;
  }
  .detail-image.placeholder {
    background: linear-gradient(145deg, #0f766e, #134e4a);
  }
  .detail-overlay {
    position: absolute;
    inset: auto 0 0;
    padding: 1.5rem 1.25rem 1.25rem;
    background: linear-gradient(180deg, transparent, rgba(10, 24, 22, 0.88));
    color: #f8faf9;
  }
  .meta {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 0.85rem;
    margin: 0 0 0.45rem;
    font-size: 0.85rem;
    font-weight: 600;
    opacity: 0.9;
  }
  .meta .source { opacity: 0.75; }
  .title-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
  }
  .title-row h1 {
    font-size: clamp(1.6rem, 3.5vw, 2.4rem);
    margin: 0;
    color: #fff;
  }
  .tags { margin-top: 0.75rem; }
  .user-desc {
    margin: 0.65rem 0 0;
    max-width: 40rem;
    font-size: 0.95rem;
    line-height: 1.45;
    opacity: 0.92;
  }
  .timing-row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.65rem 1rem;
    margin-top: 0.65rem;
    font-size: 0.85rem;
    font-weight: 650;
    opacity: 0.9;
  }
  .tag {
    display: inline-flex;
    padding: 0.25rem 0.65rem;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.14);
    font-size: 0.8rem;
    font-weight: 600;
  }
  .detail-grid {
    display: grid;
    gap: 1.15rem;
    grid-template-columns: 1fr;
    margin-bottom: 1.25rem;
  }
  @media (min-width: 880px) {
    .detail-grid {
      grid-template-columns: minmax(16rem, 0.9fr) minmax(0, 1.4fr);
      align-items: start;
    }
  }
  .ingredients {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 0.55rem;
  }
  .ingredients li {
    display: grid;
    grid-template-columns: minmax(4.5rem, 30%) 1fr;
    gap: 0.65rem;
    padding-bottom: 0.55rem;
    border-bottom: 1px dashed var(--app-border);
  }
  .measure {
    color: var(--app-accent);
    font-weight: 700;
    font-size: 0.9rem;
  }
  .name { font-weight: 550; }
  .steps {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 1rem;
  }
  .steps li {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 0.85rem;
    align-items: start;
  }
  .steps p { margin: 0.15rem 0 0; }
  .step-num {
    display: inline-grid;
    place-items: center;
    width: 1.85rem;
    height: 1.85rem;
    border-radius: 999px;
    background: var(--app-accent-soft);
    color: var(--app-accent);
    font-weight: 760;
    font-size: 0.85rem;
  }
  .muted {
    color: var(--app-muted);
    margin: 0;
  }
  .detail-links {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  @keyframes rise {
    from { opacity: 0; transform: translateY(0.5rem); }
    to { opacity: 1; transform: translateY(0); }
  }
</style>
