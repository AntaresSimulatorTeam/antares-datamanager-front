/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { clsx } from 'clsx';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { RdsDropdownOption, RdsIconId } from 'rte-design-system-react';

export const NO_WRAP_CLASS = 'whitespace-nowrap';

export const useDropdownOptions = () => {
  const { t } = useTranslation();

  const settingOption = useCallback(
    (onClick: () => void, label?: string): RdsDropdownOption => ({
      key: 'setting',
      label: label || t('project.@setting'),
      value: 'setting',
      icon: RdsIconId.Settings,
      onItemClick: onClick,
      extraClasses: NO_WRAP_CLASS,
    }),
    [t],
  );

  const deleteOption = useCallback(
    (onClick: () => void, label?: string): RdsDropdownOption => ({
      key: 'delete',
      label: label ?? t('project.@delete'),
      value: 'delete',
      icon: RdsIconId.Delete,
      onItemClick: onClick,
      extraClasses: clsx(NO_WRAP_CLASS, '[&]:text-error-600 [&]:hover:text-error-600'),
    }),
    [t],
  );

  const pinOption = useCallback(
    (pinned: boolean, onClick: () => void): RdsDropdownOption => ({
      key: 'pin',
      label: pinned ? t('project.@unpin') : t('project.@pin'),
      value: 'pin',
      icon: pinned ? RdsIconId.KeepOff : RdsIconId.PushPin,
      onItemClick: onClick,
      extraClasses: NO_WRAP_CLASS,
    }),
    [t],
  );

  return {
    settingOption,
    deleteOption,
    pinOption,
  };
};
