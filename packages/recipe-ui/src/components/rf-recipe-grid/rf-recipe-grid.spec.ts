import { newSpecPage } from '@stencil/core/testing';
import { RfFavoriteButton } from '../rf-favorite-button/rf-favorite-button';
import { RfRecipeCard } from '../rf-recipe-card/rf-recipe-card';
import { RfRecipeGrid } from './rf-recipe-grid';

const recipes = [
  {
    id: 'mealdb:1',
    title: 'Soup',
    category: 'Starter',
    area: 'British',
    thumbnailUrl: 'https://example.com/soup.jpg',
  },
  {
    id: 'mealdb:2',
    title: 'Pasta',
    category: 'Pasta',
    area: 'Italian',
    thumbnailUrl: 'https://example.com/pasta.jpg',
  },
];

describe('rf-recipe-grid', () => {
  it('renders empty slot when there are no recipes', async () => {
    const page = await newSpecPage({
      components: [RfRecipeGrid, RfRecipeCard, RfFavoriteButton],
      html: `<rf-recipe-grid><span slot="empty">Nothing here</span></rf-recipe-grid>`,
    });
    expect(page.root?.querySelector('[slot="empty"]')?.textContent).toContain('Nothing here');
  });

  it('renders recipe cards and bubbles select events', async () => {
    const page = await newSpecPage({
      components: [RfRecipeGrid, RfRecipeCard, RfFavoriteButton],
      html: `<rf-recipe-grid></rf-recipe-grid>`,
    });
    page.root!.recipes = recipes;
    page.root!.favoritedIds = ['mealdb:1'];
    await page.waitForChanges();

    const cards = page.root?.shadowRoot?.querySelectorAll('rf-recipe-card');
    expect(cards?.length).toBe(2);
    expect(cards?.[0].shadowRoot?.textContent).toContain('Soup');
    expect(cards?.[1].shadowRoot?.textContent).toContain('Pasta');

    const spy = jest.fn();
    page.root?.addEventListener('rfRecipeSelect', spy);
    (cards?.[0].shadowRoot?.querySelector('.body') as HTMLElement | null)?.click();
    expect(spy).toHaveBeenCalled();
    expect(spy.mock.calls[0][0].detail.recipe.id).toBe('mealdb:1');
  });
});
