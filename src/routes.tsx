/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/* eslint-disable react-refresh/only-export-components */
import { lazy } from 'react';
import { MenuNavItem } from './shared/types';

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
    link: '/',
    icon: 'home',
    component: HomePage,
  },
  {
    id: 'project-link',
    key: 'project',
    label: 'page.@project',
    link: '/projects',
    icon: 'folder',
    component: ProjectsPage,
  },
  {
    id: 'logs-link',
    key: 'logs',
    label: 'page.@logs',
    link: '/logs',
    icon: 'text-snippet',
    component: LogsPage,
  },
  {
    id: 'parameters-link',
    key: 'parameters',
    label: 'page.@parameters',
    link: '/parameters',
    icon: 'settings',
    component: Settings,
  },
  {
    id: 'antares-link',
    key: 'antares',
    label: 'page.@antares',
    link: '/antares',
    icon: 'apps',
    component: AntaresPage,
  },
  {
    id: 'about-link',
    key: 'about',
    label: 'page.@about',
    link: '/about',
    icon: 'info',
    component: About,
  },
];

export const menuBottomData: MenuNavItem[] = [
  {
    id: 'logout-link',
    key: 'logout',
    label: 'page.@logout',
    link: '/logout',
    icon: 'logout',
    component: LogoutPage,
  },
];
