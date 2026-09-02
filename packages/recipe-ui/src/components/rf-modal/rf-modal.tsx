import { Component, Element, Event, EventEmitter, h, Listen, Prop, Watch } from '@stencil/core';

/**
 * Accessible modal dialog with focus trap basics and Escape to close.
 * @slot - Main dialog body
 * @slot footer - Action buttons
 */
@Component({
  tag: 'rf-modal',
  styleUrl: 'rf-modal.css',
  shadow: true,
})
export class RfModal {
  @Element() el!: HTMLElement;

  /** Whether the dialog is open */
  @Prop({ reflect: true, mutable: true }) open = false;

  /** Dialog heading */
  @Prop() heading = '';

  /** Close when backdrop is clicked */
  @Prop() closeOnBackdrop = true;

  /** Emitted when the dialog requests close */
  @Event({ eventName: 'rfClose' }) rfClose!: EventEmitter<void>;

  private previouslyFocused: HTMLElement | null = null;
  private titleId = `rf-modal-title-${Math.random().toString(36).slice(2, 9)}`;

  @Watch('open')
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      this.previouslyFocused = document.activeElement as HTMLElement | null;
      requestAnimationFrame(() => this.focusFirst());
    } else if (this.previouslyFocused) {
      this.previouslyFocused.focus?.();
      this.previouslyFocused = null;
    }
  }

  @Listen('keydown', { target: 'window' })
  protected onKeyDown(event: KeyboardEvent) {
    if (!this.open) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      this.requestClose();
      return;
    }
    if (event.key === 'Tab') {
      this.trapFocus(event);
    }
  }

  private requestClose = () => {
    this.open = false;
    this.rfClose.emit();
  };

  private onBackdropClick = (event: MouseEvent) => {
    if (!this.closeOnBackdrop) return;
    if (event.target === event.currentTarget) {
      this.requestClose();
    }
  };

  private focusable(): HTMLElement[] {
    const root = this.el.shadowRoot;
    if (!root) return [];
    const nodes = root.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    return Array.from(nodes).filter((n) => !n.hasAttribute('disabled') && n.offsetParent !== null);
  }

  private focusFirst() {
    const items = this.focusable();
    (items[0] ?? this.el.shadowRoot?.querySelector<HTMLElement>('.dialog'))?.focus();
  }

  private trapFocus(event: KeyboardEvent) {
    const items = this.focusable();
    if (items.length === 0) {
      event.preventDefault();
      return;
    }
    const first = items[0];
    const last = items[items.length - 1];
    const active = this.el.shadowRoot?.activeElement as HTMLElement | null;

    if (event.shiftKey && (active === first || !active)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  render() {
    if (!this.open) {
      return null;
    }

    return (
      <div class="backdrop" part="backdrop" onClick={this.onBackdropClick}>
        <div
          class="dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby={this.heading ? this.titleId : undefined}
          tabindex={-1}
          part="dialog"
        >
          <header class="header">
            {this.heading ? (
              <h2 class="title" id={this.titleId}>
                {this.heading}
              </h2>
            ) : (
              <span />
            )}
            <button type="button" class="close" aria-label="Close dialog" onClick={this.requestClose}>
              ×
            </button>
          </header>
          <div class="body">
            <slot />
          </div>
          <footer class="footer">
            <slot name="footer" />
          </footer>
        </div>
      </div>
    );
  }
}
