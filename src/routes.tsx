/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/* eslint-disable react-refresh/only-export-components */
import { lazy } from 'react';
import { RouteItem } from './shared/types';

const Settings = lazy(() => import('./pages/pegase/settings/Settings'));
const HomePage = lazy(() => import('./pages/pegase/home/HomePage'));
const ProjectsPage = lazy(() => import('./pages/pegase/projects/ProjectsPage'));
const About = lazy(() => import('./pages/pegase/about/About'));
const LogoutPage = lazy(() => import('./pages/pegase/logout/Logout'));

export const mainMenuItems: RouteItem[] = [
  {
    id: 'home-link',
    label: 'page.@home',
    link: '/',
    icon: 'info',
    component: HomePage,
  },
  {
    id: 'project-link',
    label: 'page.@projects',
    link: '/projects',
    icon: 'folder',
    component: ProjectsPage,
  },
  // {
  //   id: 'logs-link',
  //   link: '/logs',
  //   component: LogsPage,
  // },
  {
    id: 'parameters-link',
    label: 'page.@parameters',
    link: '/parameters',
    icon: 'settings',
    component: Settings,
  },
  // {
  //   id: 'antares-link',
  //   link: '/antares',
  //   component: AntaresPage,
  // },
  {
    id: 'about-link',
    label: 'page.@about',
    link: '/about',
    component: About,
    icon: 'info',
  },
];

export const footerMenuItems: RouteItem[] = [
  {
    id: 'logout-link',
    label: 'page.@logout',
    link: '/logout',
    icon: 'logout',
    component: LogoutPage,
  },
];