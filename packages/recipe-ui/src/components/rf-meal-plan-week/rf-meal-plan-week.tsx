import { Component, Event, EventEmitter, h, Prop } from '@stencil/core';
import type { MealDay, MealSlot, PlannedMeal } from '../../utils/types';
import { DAY_LABELS, MEAL_DAYS, MEAL_SLOTS, SLOT_LABELS } from '../../utils/types';

/**
 * Seven-day meal planner grid.
 * @slot header - Optional header content (week navigation, etc.)
 */
@Component({
  tag: 'rf-meal-plan-week',
  styleUrl: 'rf-meal-plan-week.css',
  shadow: true,
})
export class RfMealPlanWeek {
  /** ISO date for week start (Monday) */
  @Prop() weekStart = '';

  /** Planned meals for the week */
  @Prop() meals: PlannedMeal[] | string = [];

  /** Emitted when an empty or filled slot is clicked */
  @Event({ eventName: 'rfSlotClick' }) rfSlotClick!: EventEmitter<{
    day: MealDay;
    slot: MealSlot;
    meal?: PlannedMeal;
  }>;

  /** Emitted when a meal is removed */
  @Event({ eventName: 'rfMealRemove' }) rfMealRemove!: EventEmitter<{ meal: PlannedMeal }>;

  /** Emitted when a meal should move (drag/drop or host-driven); detail includes source + target */
  @Event({ eventName: 'rfMealMove' }) rfMealMove!: EventEmitter<{
    mealId: string;
    toDay: MealDay;
    toSlot: MealSlot;
  }>;

  private parseMeals(): PlannedMeal[] {
    if (typeof this.meals === 'string') {
      try {
        const parsed = JSON.parse(this.meals);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return this.meals ?? [];
  }

  private findMeal(day: MealDay, slot: MealSlot, list: PlannedMeal[]): PlannedMeal | undefined {
    return list.find((m) => m.day === day && m.slot === slot);
  }

  private onSelect = (event: CustomEvent<{ day: MealDay; slot: MealSlot; meal?: PlannedMeal }>) => {
    this.rfSlotClick.emit(event.detail);
  };

  private onRemove = (event: CustomEvent<{ meal: PlannedMeal }>) => {
    this.rfMealRemove.emit(event.detail);
  };

  private onDragStart = (event: DragEvent, meal: PlannedMeal) => {
    event.dataTransfer?.setData('text/plain', meal.id);
    event.dataTransfer!.effectAllowed = 'move';
  };

  private onDragOver = (event: DragEvent) => {
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
  };

  private onDrop = (event: DragEvent, day: MealDay, slot: MealSlot) => {
    event.preventDefault();
    const mealId = event.dataTransfer?.getData('text/plain');
    if (!mealId) return;
    this.rfMealMove.emit({ mealId, toDay: day, toSlot: slot });
  };

  render() {
    const meals = this.parseMeals();
    const weekLabel = this.weekStart ? `Week of ${this.weekStart}` : 'Meal plan week';

    return (
      <section class="week" aria-label={weekLabel}>
        <div class="header">
          <slot name="header" />
          {!this.weekStart ? null : <p class="week-label">{weekLabel}</p>}
        </div>

        <div class="table" role="grid" aria-label={weekLabel}>
          <div class="row row--head" role="row">
            <div class="corner" role="columnheader" />
            {MEAL_DAYS.map((day) => (
              <div class="day-head" role="columnheader" key={day}>
                {DAY_LABELS[day]}
              </div>
            ))}
          </div>

          {MEAL_SLOTS.map((slot) => (
            <div class="row" role="row" key={slot}>
              <div class="slot-label" role="rowheader">
                {SLOT_LABELS[slot]}
              </div>
              {MEAL_DAYS.map((day) => {
                const meal = this.findMeal(day, slot, meals);
                return (
                  <div
                    class="cell"
                    role="gridcell"
                    key={`${day}-${slot}`}
                    onDragOver={this.onDragOver}
                    onDrop={(e) => this.onDrop(e, day, slot)}
                  >
                    <div
                      class="cell-inner"
                      draggable={!!meal}
                      onDragStart={(e) => meal && this.onDragStart(e, meal)}
                    >
                      <rf-meal-plan-card
                        day={day}
                        mealSlot={slot}
                        meal={meal}
                        onRfSelect={this.onSelect}
                        onRfRemove={this.onRemove}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </section>
    );
  }
}
