<script lang="ts">
  import { onMount } from 'svelte';
  import '../app.css';
  import AppHeader from '$lib/components/AppHeader.svelte';
  import { registerRecipeUi } from '$lib/stencil';

  let { children } = $props();
  let stencilReady = $state(false);

  onMount(() => {
    void registerRecipeUi()
      .catch((error) => {
        console.error('Failed to register recipe-ui web components', error);
      })
      .finally(() => {
        stencilReady = true;
      });
  });
</script>

<a class="skip-link" href="#main-content">Skip to content</a>

<div id="app-root">
  <AppHeader />

  <main id="main-content" class="page">
    <div class="container">
      {#if !stencilReady}
        <div class="boot" role="status" aria-live="polite">
          <div class="boot-spinner" aria-hidden="true"></div>
          <p>Loading interface…</p>
        </div>
      {:else}
        {@render children()}
      {/if}
    </div>
  </main>

  <footer class="site-footer">
    <div class="container">
      <span>Recipe Finder — discover, save, and plan meals</span>
      <span>Data from TheMealDB</span>
    </div>
  </footer>
</div>

<style>
  .boot {
    display: grid;
    place-items: center;
    gap: 0.85rem;
    min-height: 40vh;
    color: var(--app-muted);
  }

  .boot p {
    margin: 0;
    font-weight: 600;
  }

  .boot-spinner {
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    border: 3px solid var(--app-border);
    border-top-color: var(--app-accent);
    animation: spin 0.7s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
