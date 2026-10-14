/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { THEME_COLOR, THEME_MODE } from '@/shared/types';
import createFastContext from './createFastContext';

export type UserSettingsContextStore = {
  theme?: THEME_COLOR;
  mode?: THEME_MODE;
};

export const getInitialUserSettings = (): UserSettingsContextStore => {
  let theme: THEME_COLOR | undefined;
  let mode: THEME_MODE | undefined;

  try {
    const savedTheme = localStorage.getItem('theme') as THEME_COLOR | null;
    if (savedTheme && Object.values(THEME_COLOR).includes(savedTheme)) {
      theme = savedTheme;
    }
    const savedMode = localStorage.getItem('mode') as THEME_MODE | null;
    if (savedMode && Object.values(THEME_MODE).includes(savedMode)) {
      mode = savedMode;
    }
  } catch {
    // ignore storage access errors
  }

  if (!theme && typeof document !== 'undefined') {
    const domTheme = (document.body?.getAttribute('data-theme') ||
      document.documentElement?.getAttribute('data-theme')) as THEME_COLOR | null;
    if (domTheme && Object.values(THEME_COLOR).includes(domTheme)) {
      theme = domTheme;
    }
  }

  if (!mode && typeof document !== 'undefined') {
    const domMode = (document.body?.getAttribute('data-mode') ||
      document.documentElement?.getAttribute('data-mode')) as THEME_MODE | null;
    if (domMode && Object.values(THEME_MODE).includes(domMode)) {
      mode = domMode;
    }
  }

  return {
    theme: theme ?? THEME_COLOR.BLUE_ICEBERG,
    mode: mode ?? THEME_MODE.LIGHT,
  };
};

export const UserSettingsContext = createFastContext<UserSettingsContextStore>();
