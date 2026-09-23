/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { THEME_COLOR, THEME_MODE } from '@/shared/types';
import ThemeHandler from '../ThemeHandler';
import { UserSettingsContext } from '@/store/contexts/UserSettingsContext.tsx';

// Mocking the UserSettingsContext
vi.mock('@/store/contexts/UserSettingsContext', () => ({
  UserSettingsContext: {
    useStore: vi.fn(),
  },
}));

describe('ThemeHandler', () => {
  const mockUseStore = UserSettingsContext.useStore as Mock;

  beforeEach(() => {
    localStorage.clear();
    mockUseStore.mockReset();
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.removeAttribute('data-mode');
    document.documentElement.classList.remove(THEME_MODE.DARK);
    document.body.removeAttribute('data-theme');
    document.body.removeAttribute('data-mode');
  });

  it('should set dark mode and default theme if prefers-color-scheme is dark and no mode is set', () => {
    mockUseStore.mockImplementation((selector: (store: { theme?: THEME_COLOR; mode?: THEME_MODE }) => unknown) => selector({}));
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query === '(prefers-color-scheme: dark)',
      addListener: vi.fn(),
      removeListener: vi.fn(),
    }));

    render(<ThemeHandler />);

    expect(document.documentElement.getAttribute('data-mode')).toBe(THEME_MODE.DARK);
    expect(document.documentElement.getAttribute('data-theme')).toBe(THEME_COLOR.BLUE_ICEBERG);
    expect(document.documentElement.classList.contains(THEME_MODE.DARK)).toBe(true);
  });

  it('should set light mode and default theme if prefers-color-scheme is not dark and no mode is set', () => {
    mockUseStore.mockImplementation((selector: (store: { theme?: THEME_COLOR; mode?: THEME_MODE }) => unknown) => selector({}));
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query === '(prefers-color-scheme: light)',
      addListener: vi.fn(),
      removeListener: vi.fn(),
    }));

    render(<ThemeHandler />);

    expect(document.documentElement.getAttribute('data-mode')).toBe(THEME_MODE.LIGHT);
    expect(document.documentElement.getAttribute('data-theme')).toBe(THEME_COLOR.BLUE_ICEBERG);
    expect(document.documentElement.classList.contains(THEME_MODE.DARK)).toBe(false);
  });

  it('should set data-theme and data-mode attributes from context', () => {
    mockUseStore.mockImplementation((selector: (store: { theme?: THEME_COLOR; mode?: THEME_MODE }) => unknown) => selector({ theme: THEME_COLOR.VERT_FORET, mode: THEME_MODE.LIGHT }));

    render(<ThemeHandler />);

    expect(document.documentElement.getAttribute('data-theme')).toBe(THEME_COLOR.VERT_FORET);
    expect(document.documentElement.getAttribute('data-mode')).toBe(THEME_MODE.LIGHT);
    expect(document.body.getAttribute('data-theme')).toBe(THEME_COLOR.VERT_FORET);
    expect(document.body.getAttribute('data-mode')).toBe(THEME_MODE.LIGHT);
    expect(document.documentElement.classList.contains(THEME_MODE.DARK)).toBe(false);
  });

  it('should update attributes when theme changes to violet and mode to dark', () => {
    mockUseStore.mockImplementation((selector: (store: { theme?: THEME_COLOR; mode?: THEME_MODE }) => unknown) => selector({ theme: THEME_COLOR.VIOLET, mode: THEME_MODE.DARK }));

    render(<ThemeHandler />);

    expect(document.documentElement.getAttribute('data-theme')).toBe(THEME_COLOR.VIOLET);
    expect(document.documentElement.getAttribute('data-mode')).toBe(THEME_MODE.DARK);
    expect(document.body.getAttribute('data-theme')).toBe(THEME_COLOR.VIOLET);
    expect(document.body.getAttribute('data-mode')).toBe(THEME_MODE.DARK);
    expect(document.documentElement.classList.contains(THEME_MODE.DARK)).toBe(true);
    expect(localStorage.getItem('theme')).toBe(THEME_COLOR.VIOLET);
    expect(localStorage.getItem('mode')).toBe(THEME_MODE.DARK);
  });

  it('should restore theme and mode from localStorage if not set in context', () => {
    localStorage.setItem('theme', THEME_COLOR.VERT_FORET);
    localStorage.setItem('mode', THEME_MODE.DARK);

    mockUseStore.mockImplementation((selector: (store: { theme?: THEME_COLOR; mode?: THEME_MODE }) => unknown) => selector({}));

    render(<ThemeHandler />);

    expect(document.documentElement.getAttribute('data-theme')).toBe(THEME_COLOR.VERT_FORET);
    expect(document.documentElement.getAttribute('data-mode')).toBe(THEME_MODE.DARK);
    expect(document.body.getAttribute('data-theme')).toBe(THEME_COLOR.VERT_FORET);
    expect(document.body.getAttribute('data-mode')).toBe(THEME_MODE.DARK);
    expect(document.documentElement.classList.contains(THEME_MODE.DARK)).toBe(true);
  });
});
