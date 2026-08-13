/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { APP_NAME } from '@/shared/constants.ts';
import { SideNavHeaderConfig } from '@design-system-rte/core/components/side-nav/side-nav.interface';
import { NavItemProps } from '@design-system-rte/core/components/side-nav/nav-item/nav-item.interface';
import packageJson from '../../../package.json';

export const navBarConfig: SideNavHeaderConfig = {
    title: APP_NAME,
    identifier: "Antares",
    icon:'home',
    link: '/',
    version: `v${packageJson.version}`,
};

export const mainMenuItems: NavItemProps [] = [
  {
    label: 'home.@label',
    link: '/',
    icon: 'home',
  },
  {
    label: 'page.@project',
    link: '/projects',
    icon: 'folder',
  },
  {
    id: 'logs-link',
    label: 'page.@logs',
    link: '/logs',
    icon: 'text-snippet',
  },
  {
    id: 'parameters-link',
    label: 'page.@parameters',
    link: '/parameters',
    icon: 'settings',
  },
  {
    id: 'antares-link',
    label: 'page.@antares',
    link: '/antares',
    icon: 'apps',
  },
  {
    id: 'about-link',
    label: 'page.@about',
    link: '/about',
    icon: 'info',
  },
];

export const footerMenuItems: NavItemProps[] = [
  {
    id: 'logout-link',
    label: 'page.@logout',
    link: '/logout',
    icon: 'logout',
  },
];
