/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { APP_NAME } from '@/shared/constants.ts';
import { NavbarConfig } from '@common/layout/stdNavbar/StdNavbar.tsx';

// export const navBarConfig = {
//   header: {
//     variant: 'logo',
//     versionTextColor: 'gray-600',
//     appName: APP_NAME,
//     appVersion: `v${import.meta.env.VITE_APP_VERSION}`,
//     as: 'a',
//     //headerLink: '/',
//     headerId: 'main-nav-bar-controller',
//     logoConfig: {
//       logoExpandedHref: 'brand/logo_antares_pegase_light_expand.svg',
//       logoExpandedId: 'appIcon-collapsed-id',
//       logoCollapsedHref: 'brand/logo_antares_pegase_light_collapse.svg',
//       logoCollapsedId: 'appIcon-expanded-id',
//     },
//   } as HeaderStyleTextConfig,
// };

export const navBarConfig: NavbarConfig = {
  header: {
    appName: APP_NAME,
    appVersion: `v${import.meta.env.VITE_APP_VERSION}`,
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
    main: 'gray-800',
    hover: 'primary-500',
    active: 'gray-900',
    selected: 'gray-900',
  },
  itemBackground: {
    main: 'gray-w',
    hover: 'primary-500',
    active: 'gray-w',
    selected: 'gray-w',
  },
  separatorColor: 'gray-700',
  textColor: 'gray-800',
};
