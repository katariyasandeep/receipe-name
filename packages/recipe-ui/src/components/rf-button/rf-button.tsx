import { Component, Event, EventEmitter, h, Prop } from '@stencil/core';

export type RfButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type RfButtonType = 'button' | 'submit' | 'reset';

/**
 * Shared accessible button primitive.
 * @slot - Button label / content
 */
@Component({
  tag: 'rf-button',
  styleUrl: 'rf-button.css',
  shadow: true,
})
export class RfButton {
  /** Visual style */
  @Prop() variant: RfButtonVariant = 'primary';

  /** Native button type */
  @Prop() type: RfButtonType = 'button';

  /** Disabled state */
  @Prop({ reflect: true }) disabled = false;

  /** Accessible name when content is icon-only */
  @Prop() ariaLabel?: string;

  /** Emitted on activation (no DOM event in detail — host owns intent) */
  @Event({ eventName: 'rfClick' }) rfClick!: EventEmitter<void>;

  private onClick = (event: MouseEvent) => {
    if (this.disabled) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    this.rfClick.emit();
  };

  render() {
    return (
      <button
        class={`btn btn--${this.variant}`}
        type={this.type}
        disabled={this.disabled}
        aria-label={this.ariaLabel}
        onClick={this.onClick}
      >
        <slot />
      </button>
    );
  }
}
