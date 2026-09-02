import { newSpecPage } from '@stencil/core/testing';
import { RfButton } from './rf-button';

describe('rf-button', () => {
  it('renders slot content', async () => {
    const page = await newSpecPage({
      components: [RfButton],
      html: `<rf-button>Save</rf-button>`,
    });
    expect(page.root?.textContent).toContain('Save');
    expect(page.root?.shadowRoot?.querySelector('slot')).toBeTruthy();
  });

  it('emits rfClick when clicked', async () => {
    const page = await newSpecPage({
      components: [RfButton],
      html: `<rf-button>Go</rf-button>`,
    });
    const spy = jest.fn();
    page.root?.addEventListener('rfClick', spy);
    page.root?.shadowRoot?.querySelector('button')?.click();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('does not emit when disabled', async () => {
    const page = await newSpecPage({
      components: [RfButton],
      html: `<rf-button disabled>Go</rf-button>`,
    });
    const spy = jest.fn();
    page.root?.addEventListener('rfClick', spy);
    page.root?.shadowRoot?.querySelector('button')?.click();
    expect(spy).not.toHaveBeenCalled();
  });
});
