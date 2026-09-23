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
      currentMode = darkThemeMq.matches ? THEME_MODE.DARK : THEME_MODE.LIGHT;
    }
    const currentTheme = theme || THEME_COLOR.BLUE_ICEBERG;

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
