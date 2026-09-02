import { newSpecPage } from '@stencil/core/testing';
import { RfLoadingState } from './rf-loading-state';

describe('rf-loading-state', () => {
  it('exposes polite busy status with label', async () => {
    const page = await newSpecPage({
      components: [RfLoadingState],
      html: `<rf-loading-state label="Loading recipes…"></rf-loading-state>`,
    });

    const status = page.root?.shadowRoot?.querySelector('[role="status"]');
    expect(status?.getAttribute('aria-live')).toBe('polite');
    expect(status?.getAttribute('aria-busy')).toBe('true');
    expect(status?.textContent).toContain('Loading recipes…');
  });
});
