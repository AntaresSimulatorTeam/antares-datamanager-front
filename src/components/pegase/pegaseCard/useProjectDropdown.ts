/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { StdDropdownOption } from '@common/layout/stdDropdown/StdDropdown';

import { useTranslation } from 'react-i18next';
import { useDropdownOptions } from './useDropdownOptions';

export const useProjectDropdown = () => {
  const { t } = useTranslation();
  const { settingOption, pinOption, deleteOption } = useDropdownOptions();

  const handleDropdownPin = () => {};

  const handleDropdownSetting = () => {};

  const dropdownItems: StdDropdownOption[] = [];

  dropdownItems.push(
    pinOption(false, handleDropdownPin),
    settingOption(handleDropdownSetting),
    deleteOption(() => t('project.@delete')),
  );

  return dropdownItems;
};
