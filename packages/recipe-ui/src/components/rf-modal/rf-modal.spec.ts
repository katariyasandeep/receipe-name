import { newSpecPage } from '@stencil/core/testing';
import { RfModal } from './rf-modal';

describe('rf-modal', () => {
  it('renders nothing when closed', async () => {
    const page = await newSpecPage({
      components: [RfModal],
      html: `<rf-modal heading="Hello"><p>Body</p></rf-modal>`,
    });
    expect(page.root?.shadowRoot?.querySelector('.dialog')).toBeNull();
  });

  it('renders dialog when open and emits rfClose', async () => {
    const page = await newSpecPage({
      components: [RfModal],
      html: `<rf-modal open heading="Hello"><p>Body</p></rf-modal>`,
    });
    expect(page.root?.shadowRoot?.querySelector('[role="dialog"]')).toBeTruthy();
    const spy = jest.fn();
    page.root?.addEventListener('rfClose', spy);
    (page.root?.shadowRoot?.querySelector('.close') as HTMLButtonElement)?.click();
    await page.waitForChanges();
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
