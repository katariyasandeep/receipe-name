import { Component, Event, EventEmitter, h, Prop } from '@stencil/core';

/**
 * Accessible favorite (heart) toggle button.
 */
@Component({
  tag: 'rf-favorite-button',
  styleUrl: 'rf-favorite-button.css',
  shadow: true,
})
export class RfFavoriteButton {
  /** Whether the item is favorited */
  @Prop({ reflect: true }) active = false;

  /** Disabled state */
  @Prop({ reflect: true }) disabled = false;

  /** Accessible label when inactive */
  @Prop() labelInactive = 'Add to favorites';

  /** Accessible label when active */
  @Prop() labelActive = 'Remove from favorites';

  /** Emitted when the user toggles favorite */
  @Event({ eventName: 'rfToggle' }) rfToggle!: EventEmitter<{ active: boolean }>;

  private onClick = () => {
    if (this.disabled) return;
    this.rfToggle.emit({ active: !this.active });
  };

  render() {
    const label = this.active ? this.labelActive : this.labelInactive;
    return (
      <button
        type="button"
        class={{ fav: true, 'fav--active': this.active }}
        disabled={this.disabled}
        aria-pressed={this.active ? 'true' : 'false'}
        aria-label={label}
        title={label}
        onClick={this.onClick}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" class="icon">
          {this.active ? (
            <path
              fill="currentColor"
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
            />
          ) : (
            <path
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              d="M12.1 18.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z"
            />
          )}
        </svg>
      </button>
    );
  }
}
