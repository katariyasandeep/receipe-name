import { Component, Event, EventEmitter, h, Prop } from '@stencil/core';
import type { SelectOption } from '../../utils/types';

/**
 * Labeled select control.
 */
@Component({
  tag: 'rf-select',
  styleUrl: 'rf-select.css',
  shadow: true,
})
export class RfSelect {
  /** Visible label */
  @Prop() label = '';

  /** Selected value */
  @Prop({ mutable: true }) value = '';

  /** Name attribute */
  @Prop() name?: string;

  /** Options list (object or JSON string for attribute usage) */
  @Prop() options: SelectOption[] | string = [];

  /** Error message */
  @Prop() error?: string;

  /** Disabled */
  @Prop({ reflect: true }) disabled = false;

  /** Placeholder option label */
  @Prop() placeholder = 'Select…';

  /** Required */
  @Prop() required = false;

  /** Emitted when selection changes */
  @Event({ eventName: 'rfChange' }) rfChange!: EventEmitter<string>;

  private selectId = `rf-select-${Math.random().toString(36).slice(2, 9)}`;
  private errorId = `${this.selectId}-error`;

  private get parsedOptions(): SelectOption[] {
    if (typeof this.options === 'string') {
      try {
        const parsed = JSON.parse(this.options);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return this.options ?? [];
  }

  private onChange = (event: Event) => {
    const next = (event.target as HTMLSelectElement).value;
    this.value = next;
    this.rfChange.emit(next);
  };

  render() {
    return (
      <div class="field">
        {this.label ? (
          <label class="label" htmlFor={this.selectId}>
            {this.label}
            {this.required ? <span class="req" aria-hidden="true"> *</span> : null}
          </label>
        ) : null}
        <select
          id={this.selectId}
          class={{ select: true, 'select--error': !!this.error }}
          name={this.name}
          disabled={this.disabled}
          required={this.required}
          aria-invalid={this.error ? 'true' : 'false'}
          aria-describedby={this.error ? this.errorId : undefined}
          onChange={this.onChange}
        >
          <option value="">{this.placeholder}</option>
          {this.parsedOptions.map((opt) => (
            <option value={opt.value} selected={opt.value === this.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {this.error ? (
          <p class="error" id={this.errorId} role="alert">
            {this.error}
          </p>
        ) : null}
      </div>
    );
  }
}
