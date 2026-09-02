import { Component, h, Prop } from '@stencil/core';

/**
 * Empty placeholder with optional CTA slot.
 * @slot action - Call-to-action control(s)
 */
@Component({
  tag: 'rf-empty-state',
  styleUrl: 'rf-empty-state.css',
  shadow: true,
})
export class RfEmptyState {
  /** Heading text */
  @Prop() heading = 'Nothing here yet';

  /** Supporting message */
  @Prop() message = '';

  render() {
    return (
      <div class="empty" role="status">
        <h2 class="heading">{this.heading}</h2>
        {this.message ? <p class="message">{this.message}</p> : null}
        <div class="action">
          <slot name="action" />
        </div>
      </div>
    );
  }
}
