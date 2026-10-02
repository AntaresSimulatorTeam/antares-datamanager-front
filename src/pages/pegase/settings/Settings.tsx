/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { UserSettingsContext } from '@/store/contexts/UserSettingsContext.tsx';
import { THEME_COLOR, THEME_MODE } from '@/shared/types';
import i18next from 'i18next';
import { useTranslation } from 'react-i18next';
import { RadioButtonGroup, SegmentedControl, Switch } from '@design-system-rte/react';

const Settings = () => {
  const theme = UserSettingsContext.useStore((store) => store.theme);
  const mode = UserSettingsContext.useStore((store) => store.mode);
  const setContext = UserSettingsContext.useSetStore();
  const { i18n, t } = useTranslation();
  const changeLanguageHandler = (lang: string) => {
    void i18n.changeLanguage(lang);
  };
  return (
    <div className="flex flex-col gap-3 px-6 pt-6 justify-start items-start">
      <div className="flex flex-col gap-1 justify-start items-start">
        <h2>{t('settingsUser.@mode')}</h2>
        <SegmentedControl
          appearance="brand"
          options={[
            {
              id: THEME_MODE.LIGHT,
              label: t('settingsUser.@mode_light'),
              icon: 'mode-light'
            },
            {
              id: THEME_MODE.DARK,
              label: t('settingsUser.@mode_dark'),
              icon: 'mode-dark'
            },
          ]}
          defaultValue={mode}
          selectedSegment={mode}
          onChange={(value) => setContext({ mode: value as THEME_MODE })}
          compactSpacing={true}
        />
      </div>
      <div className="flex flex-col gap-1 justify-start items-start">
      <h2>{t('settingsUser.@theme')}</h2>
        <RadioButtonGroup
          direction="horizontal"
          groupName="radio-group"
          selectedValue={theme}
          value={theme}
          onValueChange={(value) => setContext({ theme: value as THEME_COLOR })}
          items={[
            {
              label: t('settingsUser.@vert_foret'),
              value: THEME_COLOR.VERT_FORET
            },
            {
              label: t('settingsUser.@blue_iceberg'),
              value: THEME_COLOR.BLUE_ICEBERG
            },
            {
              label: t('settingsUser.@violet'),
              value: THEME_COLOR.VIOLET
            }
          ]}
          showGroupTitle
          showHelpText
          showItemsLabel
        />
      </div>
      <h2>{t('settingsUser.@language')}</h2>
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
