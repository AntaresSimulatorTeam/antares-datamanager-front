/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { MenuNavItem } from '@/shared/types';

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
