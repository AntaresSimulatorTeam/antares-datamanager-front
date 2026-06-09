/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { MenuNavItem } from '@/shared/types';
import { Dispatch, SetStateAction } from 'react';
import { TFunction } from 'i18next';

export const translateMenuItemLabel = (menuItems: MenuNavItem[], t: (key: string) => string): MenuNavItem[] =>
  menuItems.map((data: MenuNavItem) => ({ ...data, label: t(data.label) }));

export const titleCase = (str: string, shouldLower = false) => {
  const s = shouldLower ? str.toLowerCase() : str;
  return s.charAt(0).toUpperCase() + s.slice(1);
};

export const sentenceCase = (str: string) => titleCase(str.replace(/_/g, ' '), true);

export const avatarCase = (str: string) => titleCase(str.substring(0, 2));

export const snakeCaseUnderscore = (str: string) => str?.trim().toLowerCase().replace(/\s+/g, '_') ?? '';
export const snakeCase = (str: string) => str?.trim().toLowerCase().replace(/\s+/g, ' ') ?? '';

export const normalizeTechnology = (s: string | undefined | null) => s?.trim().toLowerCase();

export const validateHorizon = (
  setErrorMessage: Dispatch<SetStateAction<string>>,
  t: TFunction<'translation', undefined>,
  value?: string,
  requiredField?: boolean,
  onChangeValidate?: (isValid: boolean) => void,
): boolean => {
  if (!value || value.trim() === '') {
    if (requiredField) {
      setErrorMessage(t('horizonInput.@requiredHorizon'));
      onChangeValidate?.(false);
      return false;
    } else {
      setErrorMessage('');
      onChangeValidate?.(true);
      return true;
    }
  }

  const trimmedValue = value.trim();

  if (!/^\d{4}$/.test(trimmedValue)) {
    setErrorMessage(t('horizonInput.@validYearError'));
    onChangeValidate?.(false);
    return false;
  }

  const numeric = Number(trimmedValue);

  if (Number.isNaN(numeric) || numeric < 2000 || numeric > 9999) {
    setErrorMessage(t('horizonInput.@validYearError'));
    onChangeValidate?.(false);
    return false;
  }

  setErrorMessage('');
  onChangeValidate?.(true);
  return true;
};

export const validateName = (name: string, setNameError: Dispatch<SetStateAction<string>>, message: string) => {
  if (name?.length === 0 || !name?.trim()) {
    setNameError(message);
    return false;
  }
  return true;
};

export const getStudyName = (studyName: string): string => studyName.substring(0, studyName.lastIndexOf('_'));

export const convertToOneYearHorizon = (rawHorizon: string) => {
  const years = rawHorizon.match(/\d{4}/g)?.map(Number) || [];
  const maxYear = years.length ? Math.max(...years) : '';
  return maxYear.toString();
};
