import { newSpecPage } from '@stencil/core/testing';
import { RfEmptyState } from './rf-empty-state';

describe('rf-empty-state', () => {
  it('renders heading and message', async () => {
    const page = await newSpecPage({
      components: [RfEmptyState],
      html: `<rf-empty-state heading="No recipes" message="Try another search"></rf-empty-state>`,
    });
    expect(page.root?.shadowRoot?.textContent).toContain('No recipes');
    expect(page.root?.shadowRoot?.textContent).toContain('Try another search');
  });
});
