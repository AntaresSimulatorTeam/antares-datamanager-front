import { vi } from 'vitest';

export const mockNavigator = {
  createHref: vi.fn(),
  go: vi.fn(),
  push: vi.fn(),
  replace: vi.fn(),
};
