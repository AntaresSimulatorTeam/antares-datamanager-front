/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import StdSwitch from '@/components/common/forms/stdSwitch/StdSwitch';
import { UserContext } from '@/contexts/UserContext';
import { THEME_COLOR } from '@/shared/types';
import i18next from 'i18next';
import { useTranslation } from 'react-i18next';

const Settings = () => {
  const themeColor = UserContext.useStore((store) => store.theme);
  const setContext = UserContext.useSetStore();
  const { i18n } = useTranslation();
  const changeLanguageHandler = (lang: string) => {
    void i18n.changeLanguage(lang);
  };
  return (
    <div className="grid gap-3 p-2">
      <div className="flex gap-1">
        <StdSwitch
          label="Theme"
          name="theme"
          value="theme"
          checked={THEME_COLOR.LIGHT === themeColor}
          onChange={(checked) => {
            setContext({ theme: checked ? THEME_COLOR.LIGHT : THEME_COLOR.DARK });
          }}
        />
        <p>Select Theme</p>
      </div>
      <div className="flex gap-1">
        <StdSwitch
          label="trad"
          name="trad"
          value="trad"
          checked={i18next.language === 'fr'}
          onChange={(checked) => {
            changeLanguageHandler(checked ? 'fr' : 'en');
          }}
        />
        <p>{`Current "${i18next.language}"`}</p>
      </div>
    </div>
  );
};

export default Settings;
