/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { MenuNavItem } from '@/shared/types';
import StdNavbarMenuItem from './StdNavbarMenuItem';

type StdNavbarMenuProps = {
  menuItems: MenuNavItem[];
  expanded?: boolean;
};

const StdNavbarMenu = ({ menuItems, expanded = true }: StdNavbarMenuProps) => (
  <section>
    {menuItems.map((item) => (
      <StdNavbarMenuItem item={item} expanded={expanded} key={item.key} />
    ))}
  </section>
);

export default StdNavbarMenu;
