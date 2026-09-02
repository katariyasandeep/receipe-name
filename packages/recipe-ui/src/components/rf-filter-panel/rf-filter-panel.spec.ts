import { newSpecPage } from '@stencil/core/testing';
import { RfFilterPanel } from './rf-filter-panel';

describe('rf-filter-panel', () => {
  it('renders category and area selects', async () => {
    const page = await newSpecPage({
      components: [RfFilterPanel],
      html: `<rf-filter-panel
        categories='${JSON.stringify(['Beef', 'Chicken'])}'
        areas='${JSON.stringify(['Italian', 'Japanese'])}'
      ></rf-filter-panel>`,
    });
    await page.waitForChanges();

    const text = page.root?.shadowRoot?.textContent ?? '';
    expect(text).toContain('Category');
    expect(text).toContain('Cuisine');
    expect(text).toContain('Beef');
    expect(text).toContain('Italian');
  });

  it('emits rfFilterChange when category changes', async () => {
    const page = await newSpecPage({
      components: [RfFilterPanel],
      html: `<rf-filter-panel categories='${JSON.stringify(['Chicken'])}'></rf-filter-panel>`,
    });
    await page.waitForChanges();

    const spy = jest.fn();
    page.root?.addEventListener('rfFilterChange', spy);

    const select = page.root?.shadowRoot?.querySelector('select') as HTMLSelectElement;
    select.value = 'Chicken';
    select.dispatchEvent(new Event('change'));
    await page.waitForChanges();

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0].detail.category).toBe('Chicken');
  });

  it('clears filters and emits empty value', async () => {
    const page = await newSpecPage({
      components: [RfFilterPanel],
      html: `<rf-filter-panel value='${JSON.stringify({ category: 'Beef', area: 'American' })}'></rf-filter-panel>`,
    });
    await page.waitForChanges();

    const spy = jest.fn();
    page.root?.addEventListener('rfFilterChange', spy);
    const clear = page.root?.shadowRoot?.querySelector('button.clear') as HTMLButtonElement;
    clear.click();
    await page.waitForChanges();

    expect(spy).toHaveBeenCalled();
    expect(spy.mock.calls.at(-1)[0].detail).toEqual({});
  });
});
