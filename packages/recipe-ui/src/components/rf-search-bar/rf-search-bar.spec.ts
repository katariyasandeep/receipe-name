import { newSpecPage } from '@stencil/core/testing';
import { RfSearchBar } from './rf-search-bar';

describe('rf-search-bar', () => {
  it('emits rfSearch with trimmed query on submit', async () => {
    const page = await newSpecPage({
      components: [RfSearchBar],
      html: `<rf-search-bar value="  pasta  "></rf-search-bar>`,
    });
    const spy = jest.fn();
    page.root?.addEventListener('rfSearch', spy);
    const form = page.root?.shadowRoot?.querySelector('form');
    form?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await page.waitForChanges();
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0].detail).toEqual({ query: 'pasta' });
  });

  it('does not search while loading', async () => {
    const page = await newSpecPage({
      components: [RfSearchBar],
      html: `<rf-search-bar value="soup" loading></rf-search-bar>`,
    });
    const spy = jest.fn();
    page.root?.addEventListener('rfSearch', spy);
    page.root?.shadowRoot?.querySelector('form')?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    expect(spy).not.toHaveBeenCalled();
  });
});
