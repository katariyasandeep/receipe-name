import { newSpecPage } from '@stencil/core/testing';
import { RfRecipeCard } from './rf-recipe-card';
import { RfFavoriteButton } from '../rf-favorite-button/rf-favorite-button';

const recipe = {
  id: 'mealdb:1',
  title: 'Test Pasta',
  category: 'Pasta',
  area: 'Italian',
  thumbnailUrl: 'https://example.com/pasta.jpg',
};

describe('rf-recipe-card', () => {
  it('renders recipe title and meta', async () => {
    const page = await newSpecPage({
      components: [RfRecipeCard, RfFavoriteButton],
      html: `<rf-recipe-card></rf-recipe-card>`,
    });
    page.root!.recipe = recipe;
    await page.waitForChanges();
    expect(page.root?.shadowRoot?.textContent).toContain('Test Pasta');
    expect(page.root?.shadowRoot?.textContent).toContain('Pasta · Italian');
  });

  it('emits rfRecipeSelect when body is activated', async () => {
    const page = await newSpecPage({
      components: [RfRecipeCard, RfFavoriteButton],
      html: `<rf-recipe-card></rf-recipe-card>`,
    });
    page.root!.recipe = recipe;
    await page.waitForChanges();
    const spy = jest.fn();
    page.root?.addEventListener('rfRecipeSelect', spy);
    (page.root?.shadowRoot?.querySelector('.body') as HTMLElement)?.click();
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0].detail.recipe.title).toBe('Test Pasta');
  });
});
