<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import { ceProps } from '$lib/actions/ce-props';
  import FeedbackBanner from '$lib/components/FeedbackBanner.svelte';
  import PageHeader from '$lib/components/PageHeader.svelte';
  import { userRecipes } from '$lib/stores';
  import type { RecipeFormErrors, UserRecipeDraft } from '$lib/types';
  import { recipePath, userRecipeToDraft } from '$lib/utils';
  import { validateUserRecipeDraft } from '$lib/validation';

  const id = $derived(decodeURIComponent(page.params.id ?? ''));
  const recipe = $derived(id ? userRecipes.getById(id) : undefined);

  let draft = $state<UserRecipeDraft | null>(null);
  let errors = $state<RecipeFormErrors>({});
  let saving = $state(false);
  let feedback = $state<{ variant: 'success' | 'error'; message: string } | null>(null);
  let deleteOpen = $state(false);
  let deleting = $state(false);
  let loadedId = $state<string | null>(null);

  $effect(() => {
    if (recipe && recipe.id !== loadedId) {
      draft = userRecipeToDraft(recipe);
      loadedId = recipe.id;
      errors = {};
      feedback = null;
    }
  });

  function onChange(event: CustomEvent<UserRecipeDraft>) {
    draft = event.detail;
    if (Object.keys(errors).length) {
      errors = {};
    }
  }

  function onSubmit(event: CustomEvent<UserRecipeDraft>) {
    if (!recipe || !draft) return;
    const submitted = event.detail ?? draft;
    const result = validateUserRecipeDraft({ ...submitted, id: recipe.id });
    if (!result.valid || !result.draft) {
      errors = result.errors;
      feedback = {
        variant: 'error',
        message: 'Please fix the highlighted fields before saving.'
      };
      return;
    }

    saving = true;
    feedback = null;
    const updated = userRecipes.updateFromDraft(recipe.id, result.draft);
    saving = false;

    if (!updated.ok) {
      feedback = {
        variant: 'error',
        message:
          updated.error === 'not_found'
            ? 'This recipe is no longer available.'
            : (userRecipes.lastPersistError ??
              'Could not save your recipe locally. Try again.')
      };
      return;
    }

    draft = userRecipeToDraft(updated.data);
    feedback = { variant: 'success', message: 'Recipe updated.' };
  }

  function openDelete() {
    deleteOpen = true;
  }

  function closeDelete() {
    if (deleting) return;
    deleteOpen = false;
  }

  function confirmDelete() {
    if (!recipe) return;
    deleting = true;
    const result = userRecipes.remove(recipe.id);
    deleting = false;
    deleteOpen = false;

    if (!result.ok) {
      feedback = {
        variant: 'error',
        message:
          result.error === 'not_found'
            ? 'This recipe was already removed.'
            : (userRecipes.lastPersistError ??
              'Could not delete the recipe. Try again.')
      };
      return;
    }

    void goto('/my-recipes');
  }
</script>

<PageHeader
  title="Edit recipe"
  subtitle="Update your personal recipe or remove it from this device."
/>

{#if !recipe}
  <rf-empty-state
    heading="Recipe not found"
    message="This personal recipe is missing from local storage."
  >
    <div slot="action">
      <a class="chip" href="/my-recipes">Back to my recipes</a>
    </div>
  </rf-empty-state>
{:else if draft}
  {#if feedback}
    <FeedbackBanner message={feedback.message} variant={feedback.variant} />
  {/if}

  <div class="meta-row">
    <a class="chip" href={recipePath(recipe.id)}>View recipe</a>
    <rf-button type="button" variant="danger" onrfClick={openDelete}>Delete</rf-button>
  </div>

  <rf-recipe-form
    submitLabel="Save changes"
    disabled={saving}
    use:ceProps={{ value: draft, errors }}
    onrfChange={onChange}
    onrfSubmit={onSubmit}
  >
    <div slot="footer">
      <a class="chip" href="/my-recipes">Back to list</a>
    </div>
  </rf-recipe-form>

  <rf-modal
    heading="Delete this recipe?"
    open={deleteOpen}
    onrfClose={closeDelete}
  >
    <p>
      “{recipe.title}” will be removed from this browser. This cannot be undone.
    </p>
    <div slot="footer">
      <rf-button type="button" variant="secondary" disabled={deleting} onrfClick={closeDelete}
        >Cancel</rf-button
      >
      <rf-button type="button" variant="danger" disabled={deleting} onrfClick={confirmDelete}
        >Delete recipe</rf-button
      >
    </div>
  </rf-modal>
{/if}

<style>
  .meta-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.65rem;
    margin-bottom: 1.15rem;
  }

  p {
    margin: 0;
    color: var(--app-muted);
    line-height: 1.5;
  }
</style>
