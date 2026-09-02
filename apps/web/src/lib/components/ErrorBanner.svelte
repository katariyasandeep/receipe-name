<script lang="ts">
  interface Props {
    message: string;
    onRetry?: () => void;
  }

  let { message, onRetry }: Props = $props();
</script>

<div class="error-banner" role="alert">
  <p>{message}</p>
  {#if onRetry}
    <rf-button variant="secondary" type="button" onrfClick={onRetry}>Retry</rf-button>
  {/if}
</div>
