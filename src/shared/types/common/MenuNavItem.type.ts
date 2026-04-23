/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { ComponentType, ElementType } from 'react';
import { AnchorDefaultAsType } from '@/shared/types';

export type MenuNavItem<E extends ElementType = typeof AnchorDefaultAsType> = {
  key: string;
  label: string;
  path: string;
  icon: string;
  id: string;
  as?: E;
  component: ComponentType;
};
