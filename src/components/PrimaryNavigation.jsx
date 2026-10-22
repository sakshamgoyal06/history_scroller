function NavIcon({ name }) {
  if (name === 'feed') {
    return (
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
        <path d="M4 6h16M4 12h16M4 18h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
      </svg>
    )
  }
  if (name === 'zones') {
    return (
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
        <path d="M4 4h7v7H4V4zm9 0h7v7h-7V4zM4 13h7v7H4v-7zm9 3h7v4h-7v-4z" fill="currentColor" />
      </svg>
    )
  }
  if (name === 'learn') {
    return (
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
        <path d="M12 3l9 5-9 5-9-5 9-5zm0 8l9 5-9 5-9-5 9-5z" fill="currentColor" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <path d="M6 4h12v16l-6-4-6 4V4z" stroke="currentColor" strokeWidth="1.8" fill="none" />
    </svg>
  )
}

const TABS = [
  { id: 'feed', label: 'Feed' },
  { id: 'zones', label: 'Zones' },
  { id: 'learn', label: 'Learn' },
  { id: 'library', label: 'Library' },
]

export function PrimaryNavigation({ active, onChange, variant = 'bottom' }) {
  return (
    <nav
      className={`primary-nav primary-nav--${variant}`}
      aria-label="Primary"
    >
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={`primary-nav-btn${active === tab.id ? ' primary-nav-btn--active' : ''}`}
          aria-current={active === tab.id ? 'page' : undefined}
          onClick={() => onChange(tab.id)}
        >
          <NavIcon name={tab.id} />
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  )
}
