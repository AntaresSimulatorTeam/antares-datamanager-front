/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { UserSettingsContext } from '@/store/contexts/UserSettingsContext.tsx';
import { THEME_COLOR, THEME_MODE } from '@/shared/types';
import { useEffect } from 'react';

const ThemeHandler = () => {
  const darkThemeMq = window.matchMedia('(prefers-color-scheme: dark)');
  const theme = UserSettingsContext.useStore((store) => store.theme);
  const mode = UserSettingsContext.useStore((store) => store.mode);

  useEffect(() => {
    let currentMode = mode;
    if (!currentMode) {
      try {
        const savedMode = localStorage.getItem('mode') as THEME_MODE | null;
        if (savedMode && Object.values(THEME_MODE).includes(savedMode)) {
          currentMode = savedMode;
        }
      } catch {
        // ignore storage errors
      }
      if (!currentMode) {
        currentMode = darkThemeMq.matches ? THEME_MODE.DARK : THEME_MODE.LIGHT;
      }
    }

    let currentTheme = theme;
    if (!currentTheme) {
      try {
        const savedTheme = localStorage.getItem('theme') as THEME_COLOR | null;
        if (savedTheme && Object.values(THEME_COLOR).includes(savedTheme)) {
          currentTheme = savedTheme;
        }
      } catch {
        // ignore storage errors
      }
      if (!currentTheme) {
        const domTheme = (document.body?.getAttribute('data-theme') ||
          document.documentElement?.getAttribute('data-theme')) as THEME_COLOR | null;
        currentTheme =
          domTheme && Object.values(THEME_COLOR).includes(domTheme) ? domTheme : THEME_COLOR.BLUE_ICEBERG;
      }
    }

    try {
      localStorage.setItem('theme', currentTheme);
      localStorage.setItem('mode', currentMode);
    } catch {
      // ignore storage errors
    }

    document.documentElement.setAttribute('data-theme', currentTheme);
    document.documentElement.setAttribute('data-mode', currentMode);
    document.body.setAttribute('data-theme', currentTheme);
    document.body.setAttribute('data-mode', currentMode);

    if (currentMode === THEME_MODE.DARK) {
      document.documentElement.classList.add(THEME_MODE.DARK);
    } else {
      document.documentElement.classList.remove(THEME_MODE.DARK);
    }
  }, [theme, mode, darkThemeMq.matches]);

  return <></>;
};

export default ThemeHandler;
