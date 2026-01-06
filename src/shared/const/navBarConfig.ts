/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { APP_NAME } from '@/shared/constants.ts';
import { NavbarConfig } from '@common/layout/stdNavbar/StdNavbar.tsx';
import packageJson from '../../../package.json';

export const navBarConfig: NavbarConfig = {
  header: {
    appName: APP_NAME,
    appVersion: `v${packageJson.version}`,
    variant: 'logo',
    logoConfig: {
      logoExpandedHref: 'brand/logo_antares_pegase_dark_expand.svg',
      logoCollapsedHref: 'brand/logo_antares_pegase_dark_collapse.svg',
    },
    versionTextColor: 'primary-800',
    as: 'a',
    to: '/',
  },
  itemContent: {
    mainText: 'text-gray-100',
    hoverText: 'hover:text-gray-100',
    activeText: 'active:text-gray-100',
    selectedText: '[&]:text-gray-100',
  },
  itemBackground: {
    mainBg: 'bg-gray-900',
    hoverBg: 'hover:bg-primary-800',
    activeBg: 'active:bg-primary-700',
    activeBgExplicit: '[&.active]:bg-primary-700',
    selectedBg: '[&]:bg-primary-600',
  },
  separatorColor: 'border-transparent',
  textColor: 'text-gray-100',
  zIndex: 'z-50',
};
