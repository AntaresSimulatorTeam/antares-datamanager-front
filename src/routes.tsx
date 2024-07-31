/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/* eslint-disable react-refresh/only-export-components */
import { lazy } from 'react';

const Settings = lazy(() => import('./pages/pegase/settings/Settings'));

export const routes = {
  home: { path: '/settings', component: Settings },
} as const;
