/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { StdDropdownOption } from '@common/layout/stdDropdown/StdDropdown';
import { clsx } from 'clsx';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps';

export const NO_WRAP_CLASS = 'whitespace-nowrap';

export const useDropdownOptions = () => {
  const { t } = useTranslation();

  const settingOption = useCallback(
    (onClick: () => void, label?: string): StdDropdownOption => ({
      key: 'setting',
      label: label || t('project.@setting'),
      value: 'setting',
      icon: StdIconId.Settings,
      onItemClick: onClick,
      extraClasses: NO_WRAP_CLASS,
    }),
    [t],
  );

  const duplicateOption = useCallback(
    (onClick: () => void, label?: string): StdDropdownOption => ({
      key: 'duplicate',
      label: label ?? t('project.@duplicate'),
      value: 'duplicate',
      icon: StdIconId.ContentCopy,
      onItemClick: onClick,
      extraClasses: NO_WRAP_CLASS,
    }),
    [t],
  );

  const deleteOption = useCallback(
    (onClick: () => void, label?: string): StdDropdownOption => ({
      key: 'delete',
      label: label ?? t('project.@delete'),
      value: 'delete',
      icon: StdIconId.Delete,
      onItemClick: onClick,
      extraClasses: clsx(NO_WRAP_CLASS, '[&]:text-error-600 [&]:hover:text-error-600'),
    }),
    [t],
  );

  return {
    settingOption,
    duplicateOption,
    deleteOption,
  };
};
