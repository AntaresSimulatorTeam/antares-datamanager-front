/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { UserSettingsContext } from '@/store/contexts/UserSettingsContext.tsx';
import { THEME_COLOR } from '@/shared/types';
import i18next from 'i18next';
import { useTranslation } from 'react-i18next';
import { Switch } from '@design-system-rte/react';

const Settings = () => {
  const themeColor = UserSettingsContext.useStore((store) => store.theme);
  const setContext = UserSettingsContext.useSetStore();
  const { i18n } = useTranslation();
  const changeLanguageHandler = (lang: string) => {
    void i18n.changeLanguage(lang);
  };
  return (
    <div className="flex gap-3 p-6">
        <Switch
          appearance="brand"
          label="Select Theme"
          defaultChecked={THEME_COLOR.LIGHT === themeColor}
          onChange={(event) => setContext({ theme: event.target.checked ? THEME_COLOR.LIGHT : THEME_COLOR.DARK })}
        />
        <Switch
          appearance="brand"
          label={`Current "${i18next.language}"`}
          defaultChecked={i18next.language === 'fr'}
          onChange={(event) => changeLanguageHandler(event.target.checked ? 'fr' : 'en')}
        />
    </div>
  );
};

export default Settings;
