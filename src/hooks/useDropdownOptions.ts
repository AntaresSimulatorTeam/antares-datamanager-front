/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { clsx } from 'clsx';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps';
import { StdDropdownOption } from '@/components/common/layout/stdDropdown/StdDropdown';

export const NO_WRAP_CLASS = 'whitespace-nowrap';

export const useDropdownOptions = () => {
  const { t } = useTranslation();

  const editOption = useCallback(
    (onClick: () => void, label?: string, disabled?: boolean): StdDropdownOption =>
      ({
        key: 'edit',
        label: label ?? t('project.@edit'),
        value: 'edit',
        onItemClick: onClick,
        disabled,
        icon: StdIconId.Edit,
        extraClasses: NO_WRAP_CLASS,
      }) as StdDropdownOption,
    [t],
  );

  const deleteOption = useCallback(
    (onClick: () => void, label?: string, disabled?: boolean): StdDropdownOption =>
      ({
        key: 'delete',
        label: label ?? t('project.@delete'),
        value: 'delete',
        icon: StdIconId.Delete,
        onItemClick: disabled ? undefined : onClick,
        extraClasses: clsx(NO_WRAP_CLASS, '[&]:text-error-600 [&]:hover:text-error-600'),
        disabled,
      }) as StdDropdownOption,
    [t],
  );

  const pinOption = useCallback(
    (pinned: boolean, onClick: () => void, disabled?: boolean): StdDropdownOption =>
      ({
        key: 'pin',
        label: pinned ? t('project.@unpin') : t('project.@pin'),
        value: 'pin',
        icon: pinned ? StdIconId.KeepOff : StdIconId.PushPin,
        onItemClick: onClick,
        extraClasses: NO_WRAP_CLASS,
        disabled,
      }) as StdDropdownOption,
    [t],
  );

  return {
    editOption,
    deleteOption,
    pinOption,
  };
};
