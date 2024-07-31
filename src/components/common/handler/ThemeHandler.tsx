/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { UserContext } from '@/contexts/UserContext';
import usePrevious from '@/hooks/common/usePrevious';
import { THEME_COLOR } from '@/shared/types';
import { useEffect } from 'react';

const ThemeHandler = () => {
  const darkThemeMq = window.matchMedia('(prefers-color-scheme: dark)');
  const themeColor = UserContext.useStore((store) => store.theme);
  const previousTheme = usePrevious(themeColor, undefined);
  useEffect(() => {
    if (previousTheme) {
      document.documentElement.classList.remove(previousTheme);
    }

    let newTheme = themeColor;
    if (!newTheme) {
      newTheme = darkThemeMq.matches ? THEME_COLOR.DARK : THEME_COLOR.LIGHT;
    }
    document.documentElement.classList.add(newTheme);
  });
  return <></>;
};

export default ThemeHandler;
