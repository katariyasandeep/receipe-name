import { Component, Event, EventEmitter, h, Prop } from '@stencil/core';
import type { MealDay, MealSlot, PlannedMeal } from '../../utils/types';
import { SLOT_LABELS } from '../../utils/types';

/**
 * Single planned meal cell for the week planner.
 */
@Component({
  tag: 'rf-meal-plan-card',
  styleUrl: 'rf-meal-plan-card.css',
  shadow: true,
})
export class RfMealPlanCard {
  /** Planned meal (optional when empty slot) */
  @Prop() meal?: PlannedMeal | string;

  /** Day of week */
  @Prop() day!: MealDay;

  /**
   * Meal slot (breakfast / lunch / dinner).
   * Uses attribute `meal-slot` to avoid clashing with the HTML `slot` attribute.
   */
  @Prop({ attribute: 'meal-slot' }) mealSlot!: MealSlot;

  /** Emitted when remove is clicked */
  @Event({ eventName: 'rfRemove' }) rfRemove!: EventEmitter<{ meal: PlannedMeal }>;

  /** Emitted when the meal / empty slot is selected */
  @Event({ eventName: 'rfSelect' }) rfSelect!: EventEmitter<{
    day: MealDay;
    slot: MealSlot;
    meal?: PlannedMeal;
  }>;

  private parseMeal(): PlannedMeal | undefined {
    if (!this.meal) return undefined;
    if (typeof this.meal === 'string') {
      try {
        return JSON.parse(this.meal) as PlannedMeal;
      } catch {
        return undefined;
      }
    }
    return this.meal;
  }

  private onSelect = () => {
    const meal = this.parseMeal();
    this.rfSelect.emit({ day: this.day, slot: this.mealSlot, meal });
  };

  private onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.onSelect();
    }
  };

  private onRemove = (event: Event) => {
    event.stopPropagation();
    const meal = this.parseMeal();
    if (!meal) return;
    this.rfRemove.emit({ meal });
  };

  render() {
    const meal = this.parseMeal();
    const slotLabel = SLOT_LABELS[this.mealSlot] ?? this.mealSlot;

    if (!meal) {
      return (
        <button
          type="button"
          class="empty"
          aria-label={`Add ${slotLabel} meal`}
          onClick={this.onSelect}
        >
          <span class="plus" aria-hidden="true">
            +
          </span>
          <span>Add</span>
        </button>
      );
    }

    return (
      <div
        class="card"
        role="button"
        tabindex={0}
        aria-label={`${slotLabel}: ${meal.snapshot.title}`}
        onClick={this.onSelect}
        onKeyDown={this.onKeyDown}
      >
        {meal.snapshot.thumbnailUrl ? (
          <img class="thumb" src={meal.snapshot.thumbnailUrl} alt="" loading="lazy" />
        ) : null}
        <div class="body">
          <p class="title">{meal.snapshot.title}</p>
          <button type="button" class="remove" aria-label={`Remove ${meal.snapshot.title}`} onClick={this.onRemove}>
            Remove
          </button>
        </div>
      </div>
    );
  }
}
