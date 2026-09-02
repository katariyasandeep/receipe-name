<script lang="ts">
  import { page } from '$app/state';

  type NavItem = { href: string; label: string; match?: 'exact' | 'prefix' };

  const links: NavItem[] = [
    { href: '/', label: 'Home', match: 'exact' },
    { href: '/recipes', label: 'Discover', match: 'prefix' },
    { href: '/favorites', label: 'Favorites', match: 'exact' },
    { href: '/meal-planner', label: 'Meal plan', match: 'exact' },
    { href: '/my-recipes', label: 'My recipes', match: 'prefix' }
  ];

  let menuOpen = $state(false);

  function isActive(item: NavItem, pathname: string): boolean {
    if (item.match === 'exact') return pathname === item.href;
    if (item.href === '/') return pathname === '/';
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  }

  function closeMenu() {
    menuOpen = false;
  }
</script>

<header class="header">
  <div class="container header-inner">
    <a class="brand" href="/" onclick={closeMenu}>
      <span class="brand-mark" aria-hidden="true"></span>
      <span class="brand-text">Recipe Finder</span>
    </a>

    <button
      class="menu-toggle"
      type="button"
      aria-expanded={menuOpen}
      aria-controls="site-nav"
      onclick={() => (menuOpen = !menuOpen)}
    >
      <span class="visually-hidden">{menuOpen ? 'Close menu' : 'Open menu'}</span>
      <span class="burger" aria-hidden="true" class:open={menuOpen}></span>
    </button>

    <nav id="site-nav" class="nav" class:open={menuOpen} aria-label="Primary">
      <ul>
        {#each links as item}
          {@const active = isActive(item, page.url.pathname)}
          <li>
            <a
              href={item.href}
              aria-current={active ? 'page' : undefined}
              onclick={closeMenu}
            >
              {item.label}
            </a>
          </li>
        {/each}
      </ul>
    </nav>
  </div>
</header>

<style>
  .header {
    position: sticky;
    top: 0;
    z-index: 40;
    backdrop-filter: blur(14px);
    background: color-mix(in srgb, #f3f7f6 78%, transparent);
    border-bottom: 1px solid color-mix(in srgb, var(--app-border) 75%, transparent);
  }

  .header-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    min-height: 4rem;
    padding-block: 0.65rem;
  }

  .brand {
    display: inline-flex;
    align-items: center;
    gap: 0.65rem;
    text-decoration: none;
    color: var(--app-ink);
  }

  .brand-mark {
    width: 1.85rem;
    height: 1.85rem;
    border-radius: 0.55rem;
    background:
      radial-gradient(circle at 30% 30%, #99f6e4, transparent 55%),
      linear-gradient(145deg, #0f766e, #134e4a);
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.15);
  }

  .brand-text {
    font-family: var(--rf-font-display);
    font-weight: 800;
    font-size: 1.2rem;
    letter-spacing: -0.03em;
  }

  .nav ul {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .nav a {
    display: inline-flex;
    align-items: center;
    padding: 0.45rem 0.75rem;
    border-radius: 999px;
    color: var(--app-muted);
    text-decoration: none;
    font-weight: 600;
    font-size: 0.92rem;
    transition:
      color var(--rf-transition),
      background var(--rf-transition);
  }

  .nav a:hover {
    color: var(--app-ink);
    background: color-mix(in srgb, var(--app-accent-soft) 70%, transparent);
  }

  .nav a[aria-current='page'] {
    color: var(--app-accent);
    background: var(--app-accent-soft);
  }

  .menu-toggle {
    display: none;
    appearance: none;
    border: 1px solid var(--app-border);
    background: var(--app-surface);
    width: 2.5rem;
    height: 2.5rem;
    border-radius: var(--rf-radius-md);
    cursor: pointer;
    align-items: center;
    justify-content: center;
  }

  .burger,
  .burger::before,
  .burger::after {
    display: block;
    width: 1.1rem;
    height: 2px;
    background: var(--app-ink);
    border-radius: 2px;
    position: relative;
    transition: transform var(--rf-transition);
  }

  .burger::before,
  .burger::after {
    content: '';
    position: absolute;
    left: 0;
  }

  .burger::before {
    top: -5px;
  }

  .burger::after {
    top: 5px;
  }

  .burger.open {
    background: transparent;
  }

  .burger.open::before {
    top: 0;
    transform: rotate(45deg);
  }

  .burger.open::after {
    top: 0;
    transform: rotate(-45deg);
  }

  @media (max-width: 760px) {
    .menu-toggle {
      display: inline-flex;
    }

    .nav {
      position: absolute;
      left: 0;
      right: 0;
      top: 100%;
      display: none;
      padding: 0.75rem 1rem 1rem;
      background: color-mix(in srgb, #f8fbfa 94%, transparent);
      border-bottom: 1px solid var(--app-border);
      box-shadow: var(--rf-shadow-md);
    }

    .nav.open {
      display: block;
    }

    .nav ul {
      flex-direction: column;
      gap: 0.35rem;
    }

    .nav a {
      width: 100%;
    }
  }
</style>
