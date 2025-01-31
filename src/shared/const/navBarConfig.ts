/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { APP_NAME } from '@/shared/constants.ts';
import { HeaderStyleConfig } from 'rte-design-system-react';

export const navBarConfig = {
  header: {
    variant: 'logo',
    versionTextColor: 'gray-600',
    appName: APP_NAME,
    appVersion: `v${import.meta.env.VITE_APP_VERSION}`,
    headerLink: '/',
    headerId: 'main-nav-bar-controller',
    logoConfig: {
      logoExpandedHref: 'brand/appIcon.svg',
      logoExpandedId: 'appIcon-collapsed-id',
      logoCollapsedHref: 'brand/appIcon.svg',
      logoCollapsedId: 'appIcon-expanded-id',
    },
  } as HeaderStyleConfig,
};
