import { Component, h, Prop } from '@stencil/core';

/**
 * Accessible loading indicator for content regions.
 */
@Component({
  tag: 'rf-loading-state',
  styleUrl: 'rf-loading-state.css',
  shadow: true,
})
export class RfLoadingState {
  /** Accessible / visible label */
  @Prop() label = 'Loading…';

  render() {
    return (
      <div class="loading" role="status" aria-live="polite" aria-busy="true">
        <span class="spinner" aria-hidden="true" />
        <span class="label">{this.label}</span>
      </div>
    );
  }
}
