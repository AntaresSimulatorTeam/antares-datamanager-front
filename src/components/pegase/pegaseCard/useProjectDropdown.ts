/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { StdDropdownOption } from '@common/layout/stdDropdown/StdDropdown';

import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { NO_WRAP_CLASS, useDropdownOptions } from './useDropdownOptions';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps';

export const useProjectDropdown = () => {
  const { t } = useTranslation();
  const { settingOption, duplicateOption, deleteOption } = useDropdownOptions();

  const handleDropdownPin = () => {};

  const handleDropdownSetting = () => {};

  const pinOption = useCallback(
    (pinned: boolean, onClick: () => void): StdDropdownOption => ({
      key: 'pin',
      label: pinned ? t('project.@unpin') : t('project.@pin'),
      value: 'pin',
      icon: pinned ? StdIconId.KeepOff : StdIconId.PushPin,
      onItemClick: onClick,
      extraClasses: NO_WRAP_CLASS,
    }),
    [t],
  );

  const dropdownItems: StdDropdownOption[] = [pinOption(true, handleDropdownPin)];

  dropdownItems.push(
    settingOption(handleDropdownSetting),
    duplicateOption(() => t('project.@duplicate')),
    deleteOption(() => t('project.@delete')),
  );

  return dropdownItems;
};
