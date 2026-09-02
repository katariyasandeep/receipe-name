import { Component, Event, EventEmitter, h, Prop } from '@stencil/core';
import type { RecipeSearchResult } from '../../utils/types';

/**
 * Recipe summary card.
 * @slot badge - Optional badge overlay content
 * @slot actions - Optional extra action controls
 */
@Component({
  tag: 'rf-recipe-card',
  styleUrl: 'rf-recipe-card.css',
  shadow: true,
})
export class RfRecipeCard {
  /** Recipe summary (object or JSON string) */
  @Prop() recipe!: RecipeSearchResult | string;

  /** Whether this recipe is favorited */
  @Prop({ reflect: true }) favorited = false;

  /** Hide the built-in favorite control */
  @Prop() hideFavorite = false;

  /** Emitted when the card body is activated */
  @Event({ eventName: 'rfRecipeSelect' }) rfRecipeSelect!: EventEmitter<{ recipe: RecipeSearchResult }>;

  /** Emitted when favorite is toggled from the card */
  @Event({ eventName: 'rfFavoriteToggle' }) rfFavoriteToggle!: EventEmitter<{
    recipe: RecipeSearchResult;
    active: boolean;
  }>;

  private parseRecipe(): RecipeSearchResult | null {
    if (!this.recipe) return null;
    if (typeof this.recipe === 'string') {
      try {
        return JSON.parse(this.recipe) as RecipeSearchResult;
      } catch {
        return null;
      }
    }
    return this.recipe;
  }

  private onSelect = () => {
    const recipe = this.parseRecipe();
    if (!recipe) return;
    this.rfRecipeSelect.emit({ recipe });
  };

  private onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.onSelect();
    }
  };

  private onFavorite = (event: CustomEvent<{ active: boolean }>) => {
    event.stopPropagation();
    const recipe = this.parseRecipe();
    if (!recipe) return;
    this.rfFavoriteToggle.emit({ recipe, active: event.detail.active });
  };

  render() {
    const recipe = this.parseRecipe();
    if (!recipe) {
      return <div class="empty">No recipe data</div>;
    }

    const meta = [recipe.category, recipe.area].filter(Boolean).join(' · ');

    return (
      <article class="card">
        <div
          class="body"
          role="button"
          tabindex={0}
          aria-label={`View recipe ${recipe.title}`}
          onClick={this.onSelect}
          onKeyDown={this.onKeyDown}
        >
          <div class="media">
            {recipe.thumbnailUrl ? (
              <img class="thumb" src={recipe.thumbnailUrl} alt="" loading="lazy" />
            ) : (
              <div class="thumb thumb--placeholder" aria-hidden="true" />
            )}
            <div class="badge">
              <slot name="badge" />
            </div>
          </div>
          <div class="content">
            <h3 class="title">{recipe.title}</h3>
            {meta ? <p class="meta">{meta}</p> : null}
          </div>
        </div>
        <div class="footer">
          <div class="actions">
            <slot name="actions" />
          </div>
          {!this.hideFavorite ? (
            <rf-favorite-button active={this.favorited} onRfToggle={this.onFavorite} />
          ) : null}
        </div>
      </article>
    );
  }
}
