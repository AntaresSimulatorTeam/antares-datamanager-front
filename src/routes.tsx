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
const LogsPage = lazy(() => import('./pages/pegase/reports/LogsPage'));
const AntaresPage = lazy(() => import('./pages/pegase/antares/Antares'));
const About = lazy(() => import('./pages/pegase/about/About'));
const LogoutPage = lazy(() => import('./pages/pegase/logout/Logout'));

export const mainRoutes: RouteItem[] = [
  {
    id: 'home-link',
    link: '/',
    component: HomePage,
  },
  {
    id: 'project-link',
    link: '/projects',
    component: ProjectsPage,
  },
  {
    id: 'logs-link',
    link: '/logs',
    component: LogsPage,
  },
  {
    id: 'parameters-link',
    link: '/parameters',
    component: Settings,
  },
  {
    id: 'antares-link',
    link: '/antares',
    component: AntaresPage,
  },
  {
    id: 'about-link',
    link: '/about',
    component: About,
  },
];

export const footerRoutes = [
  {
    id: 'logout-link',
    link: '/logout',
    component: LogoutPage,
  },
];