import '@testing-library/jest-dom/vitest'

// jsdom doesn't implement scrollIntoView — IconGrid calls it when the user
// changes pages, so tests need at least a no-op stand-in.
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {}
}

// jsdom doesn't implement matchMedia — DarkModeToggle reads it on mount to
// resolve the initial theme, so tests need at least a no-op stand-in.
if (!window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList
}
