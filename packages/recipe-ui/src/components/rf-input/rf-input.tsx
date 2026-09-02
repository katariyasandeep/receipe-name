import { Component, Event, EventEmitter, h, Prop } from '@stencil/core';

/**
 * Labeled text input with optional error and hint slot.
 * @slot hint - Optional helper text below the field
 */
@Component({
  tag: 'rf-input',
  styleUrl: 'rf-input.css',
  shadow: true,
})
export class RfInput {
  /** Visible label */
  @Prop() label = '';

  /** Controlled value */
  @Prop({ mutable: true }) value = '';

  /** Name attribute */
  @Prop() name?: string;

  /** Input type */
  @Prop() type: string = 'text';

  /** Placeholder */
  @Prop() placeholder = '';

  /** Error message (sets aria-invalid) */
  @Prop() error?: string;

  /** Disabled */
  @Prop({ reflect: true }) disabled = false;

  /** Required */
  @Prop() required = false;

  /** Autocomplete hint */
  @Prop() autocomplete?: string;

  /** Emitted on every input */
  @Event({ eventName: 'rfInput' }) rfInput!: EventEmitter<string>;

  /** Emitted on change / blur commit */
  @Event({ eventName: 'rfChange' }) rfChange!: EventEmitter<string>;

  private inputId = `rf-input-${Math.random().toString(36).slice(2, 9)}`;
  private errorId = `${this.inputId}-error`;
  private hintId = `${this.inputId}-hint`;

  private onInput = (event: Event) => {
    const next = (event.target as HTMLInputElement).value;
    this.value = next;
    this.rfInput.emit(next);
  };

  private onChange = (event: Event) => {
    const next = (event.target as HTMLInputElement).value;
    this.value = next;
    this.rfChange.emit(next);
  };

  render() {
    const describedBy = [this.error ? this.errorId : null, this.hintId].filter(Boolean).join(' ') || undefined;

    return (
      <div class="field">
        {this.label ? (
          <label class="label" htmlFor={this.inputId}>
            {this.label}
            {this.required ? <span class="req" aria-hidden="true"> *</span> : null}
          </label>
        ) : null}
        <input
          id={this.inputId}
          class={{ input: true, 'input--error': !!this.error }}
          type={this.type}
          name={this.name}
          value={this.value}
          placeholder={this.placeholder}
          disabled={this.disabled}
          required={this.required}
          autocomplete={this.autocomplete}
          aria-invalid={this.error ? 'true' : 'false'}
          aria-describedby={describedBy}
          onInput={this.onInput}
          onChange={this.onChange}
        />
        {this.error ? (
          <p class="error" id={this.errorId} role="alert">
            {this.error}
          </p>
        ) : null}
        <div class="hint" id={this.hintId}>
          <slot name="hint" />
        </div>
      </div>
    );
  }
}
