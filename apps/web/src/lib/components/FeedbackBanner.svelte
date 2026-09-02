<script lang="ts">
  interface Props {
    message: string;
    variant?: 'success' | 'error';
  }

  let { message, variant = 'success' }: Props = $props();
</script>

<div class="feedback-banner" class:error={variant === 'error'} role="status" aria-live="polite">
  <p>{message}</p>
</div>

<style>
  .feedback-banner {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.9rem 1rem;
    margin-bottom: 1.25rem;
    border-radius: var(--rf-radius-md);
    border: 1px solid color-mix(in srgb, var(--app-accent) 35%, transparent);
    background: var(--app-accent-soft);
    color: var(--app-ink);
  }

  .feedback-banner.error {
    border-color: color-mix(in srgb, var(--app-danger) 28%, transparent);
    background: var(--app-danger-bg);
    color: var(--app-danger);
  }

  .feedback-banner p {
    margin: 0;
  }
</style>
