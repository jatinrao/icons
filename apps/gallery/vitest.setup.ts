import '@testing-library/jest-dom/vitest'

// jsdom has no IntersectionObserver — IconGrid's infinite-scroll sentinel
// needs at least a no-op stand-in so tests don't throw ReferenceError.
class MockIntersectionObserver implements IntersectionObserver {
  readonly root = null
  readonly rootMargin = ''
  readonly thresholds: ReadonlyArray<number> = []
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] {
    return []
  }
}

globalThis.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver
