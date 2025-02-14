import { expect, beforeEach, vi } from 'vitest'

// Add custom matchers
expect.extend({
  // Add any custom matchers here if needed
})

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
  removeItem: vi.fn(),
  length: 0,
  key: vi.fn(),
}

global.localStorage = localStorageMock

// Reset mocks before each test
beforeEach(() => {
  localStorageMock.getItem.mockClear()
  localStorageMock.setItem.mockClear()
  localStorageMock.clear.mockClear()
  localStorageMock.removeItem.mockClear()
})

// Add any global test setup here if needed 