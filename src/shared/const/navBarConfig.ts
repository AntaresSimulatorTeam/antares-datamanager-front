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
      logoExpandedHref: 'brand/logo_antares_pegase_light_expand.svg',
      logoCollapsedHref: 'brand/logo_antares_pegase_light_collapse.svg',
    },
    versionTextColor: 'gray-600',
    as: 'a',
    to: '/',
  },
  itemContent: {
    mainText: 'text-gray-800',
    hoverText: 'hover:text-gray-800',
    activeText: 'active:text-gray-800',
    selectedText: '[&]:text-gray-800',
  },
  itemBackground: {
    mainBg: 'bg-gray-w',
    hoverBg: 'hover:bg-acc1-100',
    activeBg: 'active:bg-acc1-400',
    activeBgExplicit: '[&.active]:bg-acc1-400',
    selectedBg: '[&]:bg-acc1-400',
  },
  separatorColor: 'border-transparent',
  textColor: 'text-gray-800',
  zIndex: 'z-50',
};
