/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/* eslint-disable react-refresh/only-export-components */
import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import App from './App';

const Settings = lazy(() => import('./pages/pegase/settings/Settings'));
const HomePage = lazy(() => import('./pages/pegase/home/HomePage'));
const AreasPage = lazy(() => import('./pages/pegase/areas/AreasPage'));
const AreaTableDisplay = lazy(() => import('./pages/pegase/areas/components/AreaTableDisplay'));
export const browserRouter = createBrowserRouter([
  {
    id: 'app',
    path: '/',
    Component: App,
    children: [
      {
        index: true,
        id: 'home',
        path: '/',
        Component: HomePage,
      },
      {
        id: 'settings',
        path: '/settings',
        Component: Settings,
      },
      {
        id: 'tabs',
        path: '/tabs',
        Component: AreasPage,
        children: [
          {
            id: 'areas',
            path: 'areas',
            Component: AreaTableDisplay,
          },
          {
            id: 'load',
            path: 'load',
            Component: () => <p>Load</p>,
          },
          {
            id: 'thermal',
            path: 'thermal',
            Component: () => <p>Thermal</p>,
          },
        ],
      },
    ],
  },
]);
