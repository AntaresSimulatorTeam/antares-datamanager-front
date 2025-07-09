/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/* eslint-disable react-refresh/only-export-components */
import { lazy } from 'react';
import { MenuNavItem } from './shared/types';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps.ts';

const Settings = lazy(() => import('./pages/pegase/settings/Settings'));
const HomePage = lazy(() => import('./pages/pegase/home/HomePage'));
const ProjectsPage = lazy(() => import('./pages/pegase/projects/ProjectsPage'));
const LogsPage = lazy(() => import('./pages/pegase/reports/LogsPage'));
const AntaresPage = lazy(() => import('./pages/pegase/antares/Antares'));
const About = lazy(() => import('./pages/pegase/about/About'));
const LogoutPage = lazy(() => import('./pages/pegase/logout/Logout'));

export const menuTopData: MenuNavItem[] = [
  {
    id: 'home-link',
    key: 'home',
    label: 'home.@label',
    path: '/',
    as: 'a',
    icon: StdIconId.Home,
    component: HomePage,
  },
  {
    id: 'project-link',
    key: 'project',
    label: 'page.@project',
    path: '/projects',
    as: 'a',
    icon: StdIconId.Folder,
    component: ProjectsPage,
  },
  {
    id: 'logs-link',
    key: 'logs',
    label: 'page.@logs',
    path: '/logs',
    as: 'a',
    icon: StdIconId.ReceiptLong,
    component: LogsPage,
  },
  {
    id: 'parameters-link',
    key: 'parameters',
    label: 'page.@parameters',
    path: '/parameters',
    as: 'a',
    icon: StdIconId.Settings,
    component: Settings,
  },
  {
    id: 'antares-link',
    key: 'antares',
    label: 'page.@antares',
    path: '/antares',
    as: 'a',
    icon: StdIconId.Apps,
    component: AntaresPage,
  },
  {
    id: 'about-link',
    key: 'about',
    label: 'page.@about',
    path: '/about',
    as: 'a',
    icon: StdIconId.Info,
    component: About,
  },
];

export const menuBottomData: MenuNavItem[] = [
  {
    id: 'logout-link',
    key: 'logout',
    label: 'page.@logout',
    path: '/logout',
    as: 'a',
    icon: StdIconId.Logout,
    component: LogoutPage,
  },
];
