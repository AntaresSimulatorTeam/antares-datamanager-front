/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { ComponentType } from 'react';
import { NavItemProps } from '@design-system-rte/core/components/side-nav/nav-item/nav-item.interface';

export interface RouteItem extends NavItemProps {
  component: ComponentType;
}
