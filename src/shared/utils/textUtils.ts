/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { NavItemProps } from '@design-system-rte/core/components/side-nav/nav-item/nav-item.interface';
import { FsTrajectory } from '@/shared/types';
import { isRepositoryTrajectory } from '@/shared/utils/formFormatter.ts';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';

export const translateMenuItemLabel = (menuItems: NavItemProps[], t: (key: string) => string): NavItemProps[] =>
  menuItems.map((data: NavItemProps, index: number) => ({ ...data, label: t(data.label), key: `${index}-${data.label}` }));

export const titleCase = (str: string, shouldLower = false) => {
  const s = shouldLower ? str.toLowerCase() : str;
  return s.charAt(0).toUpperCase() + s.slice(1);
};

export const sentenceCase = (str: string) => titleCase(str.replace(/_/g, ' '), true);

export const avatarCase = (str: string) => titleCase(str.substring(0, 2));

export const snakeCaseUnderscore = (str: string) => str?.trim().toLowerCase().replace(/\s+/g, '_') ?? '';
export const snakeCase = (str: string) => str?.trim().toLowerCase().replace(/\s+/g, ' ') ?? '';

export const normalizeTechnology = (s: string | undefined | null) => s?.trim().toLowerCase();

export const convertToOneYearHorizon = (rawHorizon: string) => {
  const years = rawHorizon.match(/\d{4}/g)?.map(Number) || [];
  const maxYear = years.length ? Math.max(...years) : '';
  return maxYear.toString();
};

export const formatFlowBasedLabel = (name: string) => name.replace('/', '###');

export const formatLabel = (option: FsTrajectory, isDefaultArea = false) => option.trajectoryName && !isRepositoryTrajectory(option.type, isDefaultArea)
  ? option.trajectoryName.substring(0, option.trajectoryName.lastIndexOf('.'))
  : option.trajectoryName;

export const getDataVizModalTitle = (type: TRAJECTORY_TYPE) => {
  if (type === TRAJECTORY_TYPE.AREA) {
    return 'trajectoryViewModal.@title_area';
  } else if (type === TRAJECTORY_TYPE.LINK) {
    return 'trajectoryViewModal.@title_link';
  } else {
    return 'trajectoryViewModal.@title_sts';
  }
};

export const getDataVizModalIcon = (trajectoryType: TRAJECTORY_TYPE): string => trajectoryType === TRAJECTORY_TYPE.AREA || trajectoryType === TRAJECTORY_TYPE.LINK
    ? 'linked-services'
    : 'battery-charging-full';