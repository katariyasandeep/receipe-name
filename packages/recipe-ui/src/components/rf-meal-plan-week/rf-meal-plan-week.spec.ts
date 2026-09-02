import { newSpecPage } from '@stencil/core/testing';
import { RfMealPlanWeek } from './rf-meal-plan-week';
import { RfMealPlanCard } from '../rf-meal-plan-card/rf-meal-plan-card';

describe('rf-meal-plan-week', () => {
  it('renders weekday headers and slots', async () => {
    const page = await newSpecPage({
      components: [RfMealPlanWeek, RfMealPlanCard],
      html: `<rf-meal-plan-week week-start="2026-08-24"></rf-meal-plan-week>`,
    });
    const text = page.root?.shadowRoot?.textContent ?? '';
    expect(text).toContain('Mon');
    expect(text).toContain('Breakfast');
    expect(text).toContain('Week of 2026-08-24');
  });

  it('emits rfSlotClick from empty cell', async () => {
    const page = await newSpecPage({
      components: [RfMealPlanWeek, RfMealPlanCard],
      html: `<rf-meal-plan-week week-start="2026-08-24"></rf-meal-plan-week>`,
    });
    const spy = jest.fn();
    page.root?.addEventListener('rfSlotClick', spy);
    const empty = page.root?.shadowRoot?.querySelector('rf-meal-plan-card')?.shadowRoot?.querySelector('button.empty') as
      | HTMLButtonElement
      | null;
    empty?.click();
    await page.waitForChanges();
    expect(spy).toHaveBeenCalled();
    expect(spy.mock.calls[0][0].detail.day).toBe('mon');
    expect(spy.mock.calls[0][0].detail.slot).toBe('breakfast');
  });
});
