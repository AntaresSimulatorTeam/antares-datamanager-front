/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { StdDropdownOption } from '@common/layout/stdDropdown/StdDropdown';

import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDropdownOptions } from './useDropdownOptions';

export const useProjectDropdown = (initialPinned: boolean, projectId: string, onUnpin: (projectId: string) => void) => {
  const { t } = useTranslation();
  const { settingOption, deleteOption, pinOption } = useDropdownOptions();

  const [isPinned, setIsPinned] = useState(initialPinned);

  const handleDropdownSetting = () => {};

  const handleDropdownPin = useCallback(() => {
    setIsPinned((prevPinned) => {
      const newPinnedStatus = !prevPinned;

      if (!newPinnedStatus) {
        onUnpin(projectId);
      }

      return newPinnedStatus;
    });
  }, [onUnpin, projectId]);

  const dropdownItems: StdDropdownOption[] = [];

  dropdownItems.push(
    pinOption(isPinned, handleDropdownPin),
    settingOption(handleDropdownSetting),
    deleteOption(() => t('project.@delete')),
  );

  return dropdownItems;
};
