import { newSpecPage } from '@stencil/core/testing';
import { RfSelect } from './rf-select';

describe('rf-select', () => {
  it('renders options from property', async () => {
    const page = await newSpecPage({
      components: [RfSelect],
      html: `<rf-select label="Recipe"></rf-select>`,
    });
    const el = page.root as HTMLRfSelectElement & {
      options: { label: string; value: string }[];
    };
    el.options = [
      { label: 'Pasta', value: 'mealdb:1' },
      { label: 'Soup', value: 'user:2' },
    ];
    await page.waitForChanges();
    const options = page.root?.shadowRoot?.querySelectorAll('option');
    expect(options?.length).toBe(3); // placeholder + 2
    expect(page.root?.shadowRoot?.textContent).toContain('Pasta');
  });

  it('emits rfChange when selection changes', async () => {
    const page = await newSpecPage({
      components: [RfSelect],
      html: `<rf-select label="Recipe"></rf-select>`,
    });
    const el = page.root as HTMLRfSelectElement & {
      options: { label: string; value: string }[];
    };
    el.options = [{ label: 'Pasta', value: 'mealdb:1' }];
    await page.waitForChanges();

    const spy = jest.fn();
    page.root?.addEventListener('rfChange', spy);
    const select = page.root?.shadowRoot?.querySelector('select');
    expect(select).toBeTruthy();
    select!.value = 'mealdb:1';
    select!.dispatchEvent(new Event('change'));
    await page.waitForChanges();
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0].detail).toBe('mealdb:1');
  });
});
