<script lang="ts">
  import { page } from '$app/state';
  import PageHeader from '$lib/components/PageHeader.svelte';
  import { appPath } from '$lib/utils';

  const status = $derived(page.status);
  const message = $derived(
    page.error?.message?.trim() ||
      (status === 404 ? 'This page could not be found.' : 'Something went wrong.')
  );
</script>

<section class="error-page" aria-labelledby="error-heading">
  <div id="error-heading">
    <PageHeader
      title={status === 404 ? 'Not found' : 'Unexpected error'}
      subtitle={message}
    />
  </div>

  <p class="hint" role="status">
    {#if status === 404}
      The link may be outdated, or the recipe id is invalid.
    {:else}
      Try again from home. If the problem continues, refresh the page.
    {/if}
  </p>

  <div class="actions">
    <a class="link-btn" href={appPath('/')}>Back to home</a>
    <a class="link-btn secondary" href={appPath('/recipes')}>Browse recipes</a>
  </div>
</section>

<style>
  .error-page {
    display: grid;
    gap: 1.25rem;
    max-width: 36rem;
  }

  .hint {
    margin: 0;
    color: var(--app-muted);
    line-height: 1.5;
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .link-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.65rem 1.1rem;
    border-radius: var(--rf-radius-md, 0.625rem);
    background: var(--app-accent);
    color: #fff;
    font-weight: 600;
    text-decoration: none;
  }

  .link-btn.secondary {
    background: transparent;
    color: var(--app-ink);
    border: 1px solid var(--app-border);
  }

  .link-btn:hover {
    filter: brightness(1.05);
  }
</style>
