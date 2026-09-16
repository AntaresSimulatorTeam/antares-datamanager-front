/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { DropdownItemOption } from '@/shared/types';

export const NO_WRAP_CLASS = 'whitespace-nowrap';

export const useDropdownOptions = () => {
  const { t } = useTranslation();

  const editOption = useCallback(
    (onClick: () => void, label?: string, disabled?: boolean): DropdownItemOption =>
      ({
        label: label ?? t('project.@edit'),
        leftIcon: 'edit',
        onClick,
        disabled,
      }),
    [t],
  );

  const deleteOption = useCallback(
    (onClick: () => void, label?: string, disabled?: boolean): DropdownItemOption =>
      ({
        label: label ?? t('project.@delete'),
        leftIcon: 'delete',
        onClick: disabled ? undefined : onClick,
        disabled,
      }),
    [t],
  );

  const pinOption = useCallback(
    (pinned: boolean, onClick: () => void, disabled?: boolean): DropdownItemOption =>
      ({
        label: pinned ? t('project.@unpin') : t('project.@pin'),
        leftIcon: pinned ? 'keep-off' : 'keep',
        onClick: disabled ? undefined : onClick,
        disabled,
      }),
    [t],
  );

  return {
    editOption,
    deleteOption,
    pinOption,
  };
};
