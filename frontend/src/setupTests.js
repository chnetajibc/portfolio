import "@testing-library/jest-dom";

// Minimal browser API mocks isolated to test setup
// Keep mocks minimal — don't mock application behavior

if (!window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}

if (!window.ResizeObserver) {
  window.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

if (!window.IntersectionObserver) {
  window.IntersectionObserver = class IntersectionObserver {
    constructor() {}
    observe() { return this; }
    unobserve() {}
    disconnect() {}
    takeRecords() { return []; }
  };
}

// scrollTo is not implemented in jsdom
if (!window.scrollTo) {
  window.scrollTo = () => {};
}
if (!Element.prototype.scrollTo) {
  Element.prototype.scrollTo = () => {};
}
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}

// requestAnimationFrame for Framer Motion
if (!window.requestAnimationFrame) {
  window.requestAnimationFrame = (cb) => setTimeout(cb, 0);
}
if (!window.cancelAnimationFrame) {
  window.cancelAnimationFrame = (id) => clearTimeout(id);
}

// Mock PointerEvent for Framer Motion (jsdom lacks it)
if (typeof window.PointerEvent === "undefined") {
  window.PointerEvent = window.MouseEvent;
  globalThis.PointerEvent = window.MouseEvent;
}

// Mock getComputedStyle for Radix (avoids JSDOM warnings)
const originalGetComputedStyle = window.getComputedStyle;
window.getComputedStyle = (elt) => originalGetComputedStyle(elt);

// Mock localStorage for ThemeContext (expects global localStorage)
const mockStore = {};
const mockLocalStorage = {
  getItem: (k) => mockStore[k] || null,
  setItem: (k, v) => { mockStore[k] = v; },
  removeItem: (k) => { delete mockStore[k]; },
  clear: () => { Object.keys(mockStore).forEach(k => delete mockStore[k]); },
};
if (typeof global !== "undefined") global.localStorage = mockLocalStorage;
if (typeof globalThis !== "undefined") globalThis.localStorage = mockLocalStorage;
if (typeof window !== "undefined") {
  Object.defineProperty(window, "localStorage", { value: mockLocalStorage, writable: true, configurable: true });
}
if (typeof window !== "undefined" && !window.localStorage) {
  window.localStorage = mockLocalStorage;
}

// Ensure scroll behavior tests don't rely on real layout
Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: 1024 });
Object.defineProperty(window, "innerHeight", { writable: true, configurable: true, value: 768 });
