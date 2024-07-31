/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { render } from '@testing-library/react';
import { describe, it, expect, vi, Mock } from 'vitest';
import { UserContext } from '@/contexts/UserContext';
import usePrevious from '@/hooks/common/usePrevious';
import { THEME_COLOR } from '@/shared/types';
import ThemeHandler from '../ThemeHandler';

// Mocking the UserContext and usePrevious hook
vi.mock('@/contexts/UserContext', () => ({
  UserContext: {
    useStore: vi.fn(),
  },
}));

vi.mock('@/hooks/common/usePrevious', () => ({
  default: vi.fn(),
}));

describe('ThemeHandler', () => {
  const mockUseStore = UserContext.useStore as Mock;
  const mockUsePrevious = usePrevious as Mock;

  beforeEach(() => {
    mockUseStore.mockReset();
    mockUsePrevious.mockReset();
  });

  it('should add the dark theme class if prefers-color-scheme is dark and no theme is set', () => {
    mockUseStore.mockReturnValue(undefined);
    mockUsePrevious.mockReturnValue(undefined);
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query === '(prefers-color-scheme: dark)',
      addListener: vi.fn(),
      removeListener: vi.fn(),
    }));

    render(<ThemeHandler />);

    expect(document.documentElement.classList.contains(THEME_COLOR.DARK)).toBe(true);
  });

  it('should add the light theme class if prefers-color-scheme is not dark and no theme is set', () => {
    mockUseStore.mockReturnValue(undefined);
    mockUsePrevious.mockReturnValue(undefined);
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query === '(prefers-color-scheme: light)',
      addListener: vi.fn(),
      removeListener: vi.fn(),
    }));

    render(<ThemeHandler />);

    expect(document.documentElement.classList.contains(THEME_COLOR.LIGHT)).toBe(true);
  });

  it('should add the theme class from the context', () => {
    const theme = THEME_COLOR.DARK;
    mockUseStore.mockReturnValue(theme);
    mockUsePrevious.mockReturnValue(undefined);

    render(<ThemeHandler />);

    expect(document.documentElement.classList.contains(theme)).toBe(true);
  });

  it('should add the theme class from the context overide default browser', () => {
    const theme = THEME_COLOR.DARK;
    mockUseStore.mockReturnValue(theme);
    mockUsePrevious.mockReturnValue(undefined);
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query === '(prefers-color-scheme: light)',
      addListener: vi.fn(),
      removeListener: vi.fn(),
    }));

    render(<ThemeHandler />);

    expect(document.documentElement.classList.contains(theme)).toBe(true);
  });

  it('should remove the previous theme class and add the new one', () => {
    const previousTheme = THEME_COLOR.LIGHT;
    const newTheme = THEME_COLOR.DARK;
    mockUseStore.mockReturnValue(newTheme);
    mockUsePrevious.mockReturnValue(previousTheme);
    render(<ThemeHandler />);

    expect(document.documentElement.classList.contains(previousTheme)).toBe(false);
    expect(document.documentElement.classList.contains(newTheme)).toBe(true);
  });
});
