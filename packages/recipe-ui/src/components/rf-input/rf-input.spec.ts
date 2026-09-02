import { newSpecPage } from '@stencil/core/testing';
import { RfInput } from './rf-input';

describe('rf-input', () => {
  it('renders label and value', async () => {
    const page = await newSpecPage({
      components: [RfInput],
      html: `<rf-input label="Title" value="Soup"></rf-input>`,
    });
    expect(page.root?.shadowRoot?.textContent).toContain('Title');
    const input = page.root?.shadowRoot?.querySelector('input');
    expect(input?.value).toBe('Soup');
  });

  it('emits rfInput when typing', async () => {
    const page = await newSpecPage({
      components: [RfInput],
      html: `<rf-input label="Title"></rf-input>`,
    });
    const spy = jest.fn();
    page.root?.addEventListener('rfInput', spy);
    const input = page.root?.shadowRoot?.querySelector('input');
    expect(input).toBeTruthy();
    input!.value = 'Pasta';
    input!.dispatchEvent(new Event('input'));
    await page.waitForChanges();
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0].detail).toBe('Pasta');
  });

  it('marks invalid when error is set', async () => {
    const page = await newSpecPage({
      components: [RfInput],
      html: `<rf-input label="Title" error="Required"></rf-input>`,
    });
    const input = page.root?.shadowRoot?.querySelector('input');
    expect(input?.getAttribute('aria-invalid')).toBe('true');
    expect(page.root?.shadowRoot?.textContent).toContain('Required');
  });
});
