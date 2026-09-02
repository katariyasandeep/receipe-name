/**
 * Svelte action: assign object/array props as element properties
 * (avoids stringifying complex values onto HTML attributes).
 */
export function ceProps(node: HTMLElement, props: Record<string, unknown>) {
  function apply(next: Record<string, unknown>) {
    for (const [key, value] of Object.entries(next)) {
      (node as unknown as Record<string, unknown>)[key] = value;
    }
  }

  apply(props);

  return {
    update(next: Record<string, unknown>) {
      apply(next);
    }
  };
}
