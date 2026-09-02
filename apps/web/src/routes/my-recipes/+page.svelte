<script lang="ts">
  import { goto } from '$app/navigation';
  import { ceProps } from '$lib/actions/ce-props';
  import FeedbackBanner from '$lib/components/FeedbackBanner.svelte';
  import PageHeader from '$lib/components/PageHeader.svelte';
  import { userRecipes } from '$lib/stores';
  import type { RecipeSearchResult, UserRecipe } from '$lib/types';
  import { appPath, recipePath } from '$lib/utils';

  let deleteTarget = $state<UserRecipe | null>(null);
  let deleting = $state(false);
  let feedback = $state<{ variant: 'success' | 'error'; message: string } | null>(null);

  const recipes = $derived(userRecipes.items);

  function toSummary(r: UserRecipe): RecipeSearchResult {
    return {
      id: r.id,
      title: r.title,
      thumbnailUrl: r.thumbnailUrl,
      category: r.category,
      area: r.area
    };
  }

  function onRecipeSelect(event: CustomEvent<{ recipe: RecipeSearchResult }>) {
    const recipe = event.detail?.recipe;
    if (recipe) void goto(recipePath(recipe.id));
  }

  function askDelete(recipe: UserRecipe) {
    deleteTarget = recipe;
    feedback = null;
  }

  function closeDelete() {
    if (deleting) return;
    deleteTarget = null;
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    deleting = true;
    const result = userRecipes.remove(deleteTarget.id);
    deleting = false;

    if (!result.ok) {
      feedback = {
        variant: 'error',
        message:
          userRecipes.lastPersistError ??
          'Could not delete the recipe. Try again.'
      };
      deleteTarget = null;
      return;
    }

    feedback = {
      variant: 'success',
      message: `“${deleteTarget.title}” was deleted.`
    };
    deleteTarget = null;
  }
</script>

<PageHeader
  title="My recipes"
  subtitle="Create and manage recipes stored on this device."
/>

{#if feedback}
  <FeedbackBanner message={feedback.message} variant={feedback.variant} />
{/if}

<div class="toolbar">
  <a class="chip" href={appPath('/my-recipes/new')}>New recipe</a>
  {#if recipes.length > 0}
    <p class="count">{recipes.length} recipe{recipes.length === 1 ? '' : 's'}</p>
  {/if}
</div>

{#if recipes.length === 0}
  <rf-empty-state
    heading="No personal recipes yet"
    message="Write your own recipes — they stay in local storage on this browser."
  >
    <div slot="action">
      <a class="chip" href={appPath('/my-recipes/new')}>Create a recipe</a>
    </div>
  </rf-empty-state>
{:else}
  <div class="manage-grid" role="list" aria-label="My recipes">
    {#each recipes as recipe (recipe.id)}
      {@const summary = toSummary(recipe)}
      <div class="manage-item" role="listitem">
        <rf-recipe-card
          hideFavorite={true}
          use:ceProps={{ recipe: summary }}
          onrfRecipeSelect={onRecipeSelect}
        >
          <span slot="badge" class="owned-badge">Yours</span>
          <div slot="actions" class="card-actions">
            <a class="chip" href={appPath(`/my-recipes/${encodeURIComponent(recipe.id)}/edit`)}>Edit</a>
            <rf-button type="button" variant="danger" onrfClick={() => askDelete(recipe)}
              >Delete</rf-button
            >
          </div>
        </rf-recipe-card>
        {#if recipe.description}
          <p class="blurb">{recipe.description}</p>
        {/if}
        <p class="timing">
          {#if recipe.prepTimeMinutes != null}
            <span>Prep {recipe.prepTimeMinutes}m</span>
          {/if}
          {#if recipe.cookTimeMinutes != null}
            <span>Cook {recipe.cookTimeMinutes}m</span>
          {/if}
          {#if recipe.servings != null}
            <span>Serves {recipe.servings}</span>
          {/if}
        </p>
      </div>
    {/each}
  </div>
{/if}

<rf-modal
  heading="Delete this recipe?"
  open={!!deleteTarget}
  onrfClose={closeDelete}
>
  {#if deleteTarget}
    <p class="modal-copy">
      “{deleteTarget.title}” will be removed from this browser. This cannot be undone.
    </p>
  {/if}
  <div slot="footer">
    <rf-button type="button" variant="secondary" disabled={deleting} onrfClick={closeDelete}
      >Cancel</rf-button
    >
    <rf-button type="button" variant="danger" disabled={deleting} onrfClick={confirmDelete}
      >Delete recipe</rf-button
    >
  </div>
</rf-modal>

<style>
  .toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1rem;
  }
  .count {
    margin: 0;
    color: var(--app-muted);
    font-weight: 600;
  }
  .manage-grid {
    display: grid;
    gap: 1.25rem;
    grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr));
  }
  .manage-item {
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
  }
  .owned-badge {
    display: inline-flex;
    padding: 0.2rem 0.55rem;
    border-radius: 999px;
    background: rgba(15, 118, 110, 0.92);
    color: #fff;
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.02em;
  }
  .card-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
  }
  .blurb {
    margin: 0;
    color: var(--app-muted);
    font-size: 0.9rem;
    line-height: 1.4;
  }
  .timing {
    display: flex;
    flex-wrap: wrap;
    gap: 0.65rem;
    margin: 0;
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--app-muted);
  }
  .modal-copy {
    margin: 0;
    color: var(--app-muted);
    line-height: 1.5;
  }
</style>
