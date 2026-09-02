<script lang="ts">
  import { goto } from '$app/navigation';
  import { ceProps } from '$lib/actions/ce-props';
  import FeedbackBanner from '$lib/components/FeedbackBanner.svelte';
  import PageHeader from '$lib/components/PageHeader.svelte';
  import { userRecipes } from '$lib/stores';
  import type { RecipeFormErrors, UserRecipeDraft } from '$lib/types';
  import { emptyUserRecipeDraft, appPath, recipePath } from '$lib/utils';
  import { validateUserRecipeDraft } from '$lib/validation';

  let draft = $state<UserRecipeDraft>(emptyUserRecipeDraft());
  let errors = $state<RecipeFormErrors>({});
  let saving = $state(false);
  let feedback = $state<{ variant: 'success' | 'error'; message: string } | null>(null);

  function onChange(event: CustomEvent<UserRecipeDraft>) {
    draft = event.detail;
    if (Object.keys(errors).length) {
      errors = {};
    }
    feedback = null;
  }

  function onSubmit(event: CustomEvent<UserRecipeDraft>) {
    const submitted = event.detail ?? draft;
    const result = validateUserRecipeDraft(submitted);
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
    const created = userRecipes.createFromDraft(result.draft);
    saving = false;

    if (!created.ok) {
      feedback = {
        variant: 'error',
        message:
          userRecipes.lastPersistError ??
          'Could not save your recipe locally. Try again.'
      };
      return;
    }

    feedback = { variant: 'success', message: 'Recipe created.' };
    void goto(recipePath(created.data.id));
  }
</script>

<PageHeader
  title="New recipe"
  subtitle="Saved on this device only — fill in the details and save when ready."
/>

{#if feedback}
  <FeedbackBanner message={feedback.message} variant={feedback.variant} />
{/if}

<rf-recipe-form
  submitLabel="Create recipe"
  disabled={saving}
  use:ceProps={{ value: draft, errors }}
  onrfChange={onChange}
  onrfSubmit={onSubmit}
>
  <div slot="footer">
    <a class="chip" href={appPath('/my-recipes')}>Cancel</a>
  </div>
</rf-recipe-form>
