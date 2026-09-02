import { Component, Event, EventEmitter, h, Prop } from '@stencil/core';
import type { RecipeId, RecipeSearchResult } from '../../utils/types';

/**
 * Responsive grid of recipe cards. Card events bubble as custom events from this host.
 * @slot empty - Content shown when there are no recipes
 */
@Component({
  tag: 'rf-recipe-grid',
  styleUrl: 'rf-recipe-grid.css',
  shadow: true,
})
export class RfRecipeGrid {
  /** Recipes to render */
  @Prop() recipes: RecipeSearchResult[] | string = [];

  /** Favorited recipe ids */
  @Prop() favoritedIds: RecipeId[] | string = [];

  /** Accessible label for the grid */
  @Prop() label = 'Recipes';

  /** Bubbled recipe select */
  @Event({ eventName: 'rfRecipeSelect' }) rfRecipeSelect!: EventEmitter<{ recipe: RecipeSearchResult }>;

  /** Bubbled favorite toggle */
  @Event({ eventName: 'rfFavoriteToggle' }) rfFavoriteToggle!: EventEmitter<{
    recipe: RecipeSearchResult;
    active: boolean;
  }>;

  private parseRecipes(): RecipeSearchResult[] {
    if (typeof this.recipes === 'string') {
      try {
        const parsed = JSON.parse(this.recipes);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return this.recipes ?? [];
  }

  private parseIds(): Set<string> {
    let list: RecipeId[] = [];
    if (typeof this.favoritedIds === 'string') {
      try {
        const parsed = JSON.parse(this.favoritedIds);
        list = Array.isArray(parsed) ? parsed : [];
      } catch {
        list = [];
      }
    } else {
      list = this.favoritedIds ?? [];
    }
    return new Set(list);
  }

  private onSelect = (event: CustomEvent<{ recipe: RecipeSearchResult }>) => {
    this.rfRecipeSelect.emit(event.detail);
  };

  private onFavorite = (event: CustomEvent<{ recipe: RecipeSearchResult; active: boolean }>) => {
    this.rfFavoriteToggle.emit(event.detail);
  };

  render() {
    const recipes = this.parseRecipes();
    const favorited = this.parseIds();

    if (recipes.length === 0) {
      return (
        <div class="empty-slot">
          <slot name="empty" />
        </div>
      );
    }

    return (
      <div class="grid" role="list" aria-label={this.label}>
        {recipes.map((recipe) => (
          <div class="item" role="listitem" key={recipe.id}>
            <rf-recipe-card
              recipe={recipe}
              favorited={favorited.has(recipe.id)}
              onRfRecipeSelect={this.onSelect}
              onRfFavoriteToggle={this.onFavorite}
            />
          </div>
        ))}
      </div>
    );
  }
}
