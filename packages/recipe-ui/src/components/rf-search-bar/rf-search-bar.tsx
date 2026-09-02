import { Component, Event, EventEmitter, h, Prop } from '@stencil/core';

/**
 * Search field with submit control.
 * @slot actions - Optional trailing actions (filters, clear, etc.)
 */
@Component({
  tag: 'rf-search-bar',
  styleUrl: 'rf-search-bar.css',
  shadow: true,
})
export class RfSearchBar {
  /** Current query */
  @Prop({ mutable: true }) value = '';

  /** Placeholder text */
  @Prop() placeholder = 'Search recipes…';

  /** Shows loading / disables submit */
  @Prop({ reflect: true }) loading = false;

  /** Disables the whole control */
  @Prop({ reflect: true }) disabled = false;

  /** Accessible label for the search field */
  @Prop() label = 'Search recipes';

  /** Submit button label */
  @Prop() submitLabel = 'Search';

  /** Emitted when the user submits a search */
  @Event({ eventName: 'rfSearch' }) rfSearch!: EventEmitter<{ query: string }>;

  private inputId = `rf-search-${Math.random().toString(36).slice(2, 9)}`;

  private onInput = (event: Event) => {
    this.value = (event.target as HTMLInputElement).value;
  };

  private submit = (event?: Event) => {
    event?.preventDefault();
    if (this.disabled || this.loading) return;
    this.rfSearch.emit({ query: this.value.trim() });
  };

  render() {
    return (
      <form class="search" role="search" onSubmit={this.submit}>
        <label class="sr-only" htmlFor={this.inputId}>
          {this.label}
        </label>
        <input
          id={this.inputId}
          class="input"
          type="search"
          value={this.value}
          placeholder={this.placeholder}
          disabled={this.disabled || this.loading}
          autocomplete="off"
          enterkeyhint="search"
          onInput={this.onInput}
        />
        <div class="actions">
          <slot name="actions" />
          <button class="submit" type="submit" disabled={this.disabled || this.loading} aria-busy={this.loading ? 'true' : 'false'}>
            {this.loading ? 'Searching…' : this.submitLabel}
          </button>
        </div>
      </form>
    );
  }
}
