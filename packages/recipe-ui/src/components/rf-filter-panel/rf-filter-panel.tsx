import { Component, Event, EventEmitter, h, Prop, Watch } from '@stencil/core';
import type { RecipeFilterValue, SelectOption } from '../../utils/types';

/**
 * Category / area / ingredient filter panel.
 */
@Component({
  tag: 'rf-filter-panel',
  styleUrl: 'rf-filter-panel.css',
  shadow: true,
})
export class RfFilterPanel {
  /** Category options (strings or SelectOption / JSON) */
  @Prop() categories: string[] | SelectOption[] | string = [];

  /** Area / cuisine options */
  @Prop() areas: string[] | SelectOption[] | string = [];

  /** Current filter value */
  @Prop({ mutable: true }) value: RecipeFilterValue | string = {};

  /** Show ingredient text field */
  @Prop() showIngredient = true;

  /** Emitted when any filter field changes */
  @Event({ eventName: 'rfFilterChange' }) rfFilterChange!: EventEmitter<RecipeFilterValue>;

  private local: RecipeFilterValue = {};

  @Watch('value')
  onValueChange(next: RecipeFilterValue | string) {
    this.local = this.parseValue(next);
  }

  componentWillLoad() {
    this.local = this.parseValue(this.value);
  }

  private parseValue(raw: RecipeFilterValue | string): RecipeFilterValue {
    if (typeof raw === 'string') {
      try {
        return JSON.parse(raw) as RecipeFilterValue;
      } catch {
        return {};
      }
    }
    return { ...(raw ?? {}) };
  }

  private toOptions(raw: string[] | SelectOption[] | string): SelectOption[] {
    let list: unknown = raw;
    if (typeof raw === 'string') {
      try {
        list = JSON.parse(raw);
      } catch {
        return [];
      }
    }
    if (!Array.isArray(list)) return [];
    return list.map((item) => {
      if (typeof item === 'string') return { label: item, value: item };
      const opt = item as SelectOption;
      return { label: opt.label, value: opt.value };
    });
  }

  private emitChange(patch: Partial<RecipeFilterValue>) {
    this.local = { ...this.local, ...patch };
    this.value = this.local;
    this.rfFilterChange.emit({ ...this.local });
  }

  private clear = () => {
    this.local = {};
    this.value = {};
    this.rfFilterChange.emit({});
  };

  render() {
    const categories = this.toOptions(this.categories);
    const areas = this.toOptions(this.areas);

    return (
      <div class="panel" role="group" aria-label="Recipe filters">
        <div class="fields">
          <label class="field">
            <span class="label">Category</span>
            <select
              class="control"
              onChange={(e) => this.emitChange({ category: (e.target as HTMLSelectElement).value || undefined })}
            >
              <option value="" selected={!this.local.category}>
                Any category
              </option>
              {categories.map((opt) => (
                <option value={opt.value} selected={opt.value === (this.local.category ?? '')}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>

          <label class="field">
            <span class="label">Cuisine</span>
            <select
              class="control"
              onChange={(e) => this.emitChange({ area: (e.target as HTMLSelectElement).value || undefined })}
            >
              <option value="" selected={!this.local.area}>
                Any cuisine
              </option>
              {areas.map((opt) => (
                <option value={opt.value} selected={opt.value === (this.local.area ?? '')}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>

          {this.showIngredient ? (
            <label class="field">
              <span class="label">Ingredient</span>
              <input
                class="control"
                type="text"
                value={this.local.ingredient ?? ''}
                placeholder="e.g. chicken"
                onInput={(e) =>
                  this.emitChange({ ingredient: (e.target as HTMLInputElement).value.trim() || undefined })
                }
              />
            </label>
          ) : null}
        </div>

        <button type="button" class="clear" onClick={this.clear}>
          Clear filters
        </button>
      </div>
    );
  }
}
