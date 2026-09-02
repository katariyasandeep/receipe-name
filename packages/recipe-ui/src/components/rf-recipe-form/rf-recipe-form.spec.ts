import { newSpecPage } from '@stencil/core/testing';
import { RfRecipeForm } from './rf-recipe-form';
import { RfInput } from '../rf-input/rf-input';
import { RfButton } from '../rf-button/rf-button';

describe('rf-recipe-form', () => {
  it('emits rfSubmit with draft on submit', async () => {
    const page = await newSpecPage({
      components: [RfRecipeForm, RfInput, RfButton],
      html: `<rf-recipe-form></rf-recipe-form>`,
    });
    page.root!.value = {
      title: 'Soup',
      ingredients: [{ name: 'Water', measure: '1 cup' }],
      instructions: 'Boil',
    };
    await page.waitForChanges();

    const spy = jest.fn();
    page.root?.addEventListener('rfSubmit', spy);
    page.root?.shadowRoot?.querySelector('form')?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await page.waitForChanges();

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0].detail.title).toBe('Soup');
  });
});
