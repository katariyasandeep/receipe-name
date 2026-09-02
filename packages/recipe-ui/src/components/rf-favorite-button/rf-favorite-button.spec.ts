import { newSpecPage } from '@stencil/core/testing';
import { RfFavoriteButton } from './rf-favorite-button';

describe('rf-favorite-button', () => {
  it('exposes pressed state', async () => {
    const page = await newSpecPage({
      components: [RfFavoriteButton],
      html: `<rf-favorite-button active></rf-favorite-button>`,
    });
    const button = page.root?.shadowRoot?.querySelector('button');
    expect(button?.getAttribute('aria-pressed')).toBe('true');
  });

  it('emits rfToggle with inverted active flag', async () => {
    const page = await newSpecPage({
      components: [RfFavoriteButton],
      html: `<rf-favorite-button></rf-favorite-button>`,
    });
    const spy = jest.fn();
    page.root?.addEventListener('rfToggle', spy);
    page.root?.shadowRoot?.querySelector('button')?.click();
    await page.waitForChanges();
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0].detail).toEqual({ active: true });
  });
});
