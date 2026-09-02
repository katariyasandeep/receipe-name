import { Component, Event, EventEmitter, h, Listen, Prop, Watch } from '@stencil/core';
import type { Ingredient, RecipeFormErrors, UserRecipeDraft } from '../../utils/types';

const emptyDraft = (): UserRecipeDraft => ({
  title: '',
  description: '',
  category: '',
  area: '',
  thumbnailUrl: '',
  ingredients: [{ name: '', measure: '' }],
  instructions: '',
  tags: [],
  prepTimeMinutes: null,
  cookTimeMinutes: null,
  servings: null,
});

/**
 * Presentational create/edit recipe form. Validation messages come from the host via `errors`.
 * @slot footer - Extra actions (cancel, secondary buttons)
 */
@Component({
  tag: 'rf-recipe-form',
  styleUrl: 'rf-recipe-form.css',
  shadow: true,
})
export class RfRecipeForm {
  /** Form draft value */
  @Prop({ mutable: true }) value: UserRecipeDraft | string = emptyDraft();

  /** Field-level errors from the app */
  @Prop() errors: RecipeFormErrors | string = {};

  /** Submit button label */
  @Prop() submitLabel = 'Save recipe';

  /** Disable submit */
  @Prop({ reflect: true }) disabled = false;

  /** Emitted on any field change with the full draft */
  @Event({ eventName: 'rfChange' }) rfChange!: EventEmitter<UserRecipeDraft>;

  /** Emitted on submit */
  @Event({ eventName: 'rfSubmit' }) rfSubmit!: EventEmitter<UserRecipeDraft>;

  private draft: UserRecipeDraft = emptyDraft();

  @Watch('value')
  onValueChange(next: UserRecipeDraft | string) {
    this.draft = this.parseDraft(next);
  }

  componentWillLoad() {
    this.draft = this.parseDraft(this.value);
  }

  @Listen('submit')
  protected onNativeSubmit(event: Event) {
    event.preventDefault();
  }

  private parseDraft(raw: UserRecipeDraft | string): UserRecipeDraft {
    if (typeof raw === 'string') {
      try {
        return { ...emptyDraft(), ...(JSON.parse(raw) as UserRecipeDraft) };
      } catch {
        return emptyDraft();
      }
    }
    return {
      ...emptyDraft(),
      ...(raw ?? {}),
      ingredients:
        raw?.ingredients?.length > 0 ? raw.ingredients.map((i) => ({ ...i })) : [{ name: '', measure: '' }],
      tags: Array.isArray(raw?.tags) ? [...raw.tags] : [],
    };
  }

  private parseErrors(): RecipeFormErrors {
    if (typeof this.errors === 'string') {
      try {
        return JSON.parse(this.errors) as RecipeFormErrors;
      } catch {
        return {};
      }
    }
    return this.errors ?? {};
  }

  private emitChange(next: UserRecipeDraft) {
    this.draft = next;
    this.value = next;
    this.rfChange.emit({
      ...next,
      ingredients: next.ingredients.map((i) => ({ ...i })),
      tags: next.tags ? [...next.tags] : [],
    });
  }

  private updateField<K extends keyof UserRecipeDraft>(key: K, val: UserRecipeDraft[K]) {
    this.emitChange({ ...this.draft, [key]: val });
  }

  private updateIngredient(index: number, patch: Partial<Ingredient>) {
    const ingredients = this.draft.ingredients.map((item, i) => (i === index ? { ...item, ...patch } : item));
    this.emitChange({ ...this.draft, ingredients });
  }

  private addIngredient = () => {
    this.emitChange({
      ...this.draft,
      ingredients: [...this.draft.ingredients, { name: '', measure: '' }],
    });
  };

  private removeIngredient = (index: number) => {
    const ingredients = this.draft.ingredients.filter((_, i) => i !== index);
    this.emitChange({
      ...this.draft,
      ingredients: ingredients.length ? ingredients : [{ name: '', measure: '' }],
    });
  };

  private parseOptionalNumber(raw: string): number | null {
    const trimmed = raw.trim();
    if (!trimmed) return null;
    const n = Number(trimmed);
    return Number.isFinite(n) ? n : null;
  }

  private onTagsInput = (raw: string) => {
    const tags = raw
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    this.updateField('tags', tags);
  };

  private onSubmit = (event: Event) => {
    event.preventDefault();
    if (this.disabled) return;
    this.rfSubmit.emit({
      ...this.draft,
      ingredients: this.draft.ingredients.map((i) => ({ ...i })),
      tags: this.draft.tags ? [...this.draft.tags] : [],
    });
  };

  render() {
    const errors = this.parseErrors();
    const d = this.draft;
    const tagsValue = (d.tags ?? []).join(', ');

    return (
      <form class="form" onSubmit={this.onSubmit} noValidate>
        <rf-input
          label="Title"
          name="title"
          required
          value={d.title}
          error={errors.title}
          onRfInput={(e: CustomEvent<string>) => this.updateField('title', e.detail)}
        />

        <label class="block">
          <span class="label">Description</span>
          <textarea
            class={{ control: true, 'control--error': !!errors.description }}
            name="description"
            rows={3}
            value={d.description ?? ''}
            aria-invalid={errors.description ? 'true' : 'false'}
            onInput={(e) => this.updateField('description', (e.target as HTMLTextAreaElement).value)}
          />
          {errors.description ? (
            <p class="error" role="alert">
              {errors.description}
            </p>
          ) : null}
        </label>

        <div class="row">
          <rf-input
            label="Category"
            name="category"
            value={d.category ?? ''}
            error={errors.category}
            onRfInput={(e: CustomEvent<string>) => this.updateField('category', e.detail)}
          />
          <rf-input
            label="Cuisine / area"
            name="area"
            value={d.area ?? ''}
            error={errors.area}
            onRfInput={(e: CustomEvent<string>) => this.updateField('area', e.detail)}
          />
        </div>

        <rf-input
          label="Tags"
          name="tags"
          value={tagsValue}
          error={errors.tags}
          placeholder="Comma-separated, e.g. quick, vegetarian"
          onRfInput={(e: CustomEvent<string>) => this.onTagsInput(e.detail)}
        />

        <rf-input
          label="Image URL"
          name="thumbnailUrl"
          type="url"
          value={d.thumbnailUrl ?? ''}
          error={errors.thumbnailUrl}
          onRfInput={(e: CustomEvent<string>) => this.updateField('thumbnailUrl', e.detail)}
        />

        <div class="row">
          <rf-input
            label="Prep time (minutes)"
            name="prepTimeMinutes"
            type="number"
            value={d.prepTimeMinutes == null ? '' : String(d.prepTimeMinutes)}
            error={errors.prepTimeMinutes}
            onRfInput={(e: CustomEvent<string>) =>
              this.updateField('prepTimeMinutes', this.parseOptionalNumber(e.detail))
            }
          />
          <rf-input
            label="Cook time (minutes)"
            name="cookTimeMinutes"
            type="number"
            value={d.cookTimeMinutes == null ? '' : String(d.cookTimeMinutes)}
            error={errors.cookTimeMinutes}
            onRfInput={(e: CustomEvent<string>) =>
              this.updateField('cookTimeMinutes', this.parseOptionalNumber(e.detail))
            }
          />
          <rf-input
            label="Servings"
            name="servings"
            type="number"
            value={d.servings == null ? '' : String(d.servings)}
            error={errors.servings}
            onRfInput={(e: CustomEvent<string>) =>
              this.updateField('servings', this.parseOptionalNumber(e.detail))
            }
          />
        </div>

        <fieldset class="ingredients">
          <legend>Ingredients</legend>
          {errors.ingredients ? (
            <p class="error" role="alert">
              {errors.ingredients}
            </p>
          ) : null}
          {d.ingredients.map((ing, index) => (
            <div class="ingredient-row" key={`ing-${index}`}>
              <label class="sr-only" htmlFor={`ing-name-${index}`}>
                Ingredient name {index + 1}
              </label>
              <input
                id={`ing-name-${index}`}
                class="control"
                type="text"
                placeholder="Name"
                value={ing.name}
                onInput={(e) => this.updateIngredient(index, { name: (e.target as HTMLInputElement).value })}
              />
              <label class="sr-only" htmlFor={`ing-measure-${index}`}>
                Measure {index + 1}
              </label>
              <input
                id={`ing-measure-${index}`}
                class="control"
                type="text"
                placeholder="Measure"
                value={ing.measure}
                onInput={(e) => this.updateIngredient(index, { measure: (e.target as HTMLInputElement).value })}
              />
              <button
                type="button"
                class="icon-btn"
                aria-label={`Remove ingredient ${index + 1}`}
                onClick={() => this.removeIngredient(index)}
                disabled={d.ingredients.length <= 1}
              >
                Remove
              </button>
            </div>
          ))}
          <button type="button" class="linkish" onClick={this.addIngredient}>
            Add ingredient
          </button>
        </fieldset>

        <label class="block">
          <span class="label">
            Instructions<span class="req" aria-hidden="true">
              {' '}
              *
            </span>
          </span>
          <textarea
            class={{ control: true, 'control--error': !!errors.instructions }}
            name="instructions"
            rows={8}
            required
            value={d.instructions}
            aria-invalid={errors.instructions ? 'true' : 'false'}
            onInput={(e) => this.updateField('instructions', (e.target as HTMLTextAreaElement).value)}
          />
          {errors.instructions ? (
            <p class="error" role="alert">
              {errors.instructions}
            </p>
          ) : null}
        </label>

        {errors.form ? (
          <p class="error" role="alert">
            {errors.form}
          </p>
        ) : null}

        <div class="footer">
          <slot name="footer" />
          <rf-button type="submit" variant="primary" disabled={this.disabled}>
            {this.submitLabel}
          </rf-button>
        </div>
      </form>
    );
  }
}
