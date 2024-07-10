/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { MenuNavItem } from '@/shared/types';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps';

export const menuItemSample: MenuNavItem = {
  id: 'download',
  key: 'downloads',
  label: 'Téléchargements',
  path: '/',
  icon: StdIconId.Download,
};
