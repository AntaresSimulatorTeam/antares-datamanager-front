/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { APP_NAME } from '@/shared/constants.ts';
import packageJson from '../../../package.json';
import { SideNavHeaderConfig } from '@design-system-rte/core/components/side-nav/side-nav.interface';

export const headerConfig: SideNavHeaderConfig = {
  title: APP_NAME,
  version: `v${packageJson.version}`,
  link: '/',
};
