/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useStdId } from '@/hooks/common/useStdId';
import { MenuNavItem } from '@/shared/types';
import { Link } from 'react-router-dom';
import StdIcon from '../../base/stdIcon/StdIcon';
import StdTextTooltip from '../stdTextTooltip/StdTextTooltip';
import { navbarItemClassBuilder } from './navbarClassBuilder';

type StdNavbarMenuItemProps = {
  item: MenuNavItem;
  expanded?: boolean;
  selected?: boolean;
};

const StdNavbarMenuItem = ({ item, expanded = true, selected = false }: StdNavbarMenuItemProps) => {
  const id = useStdId('navbar-item', item.id);
  const { path, key, icon, label } = item;
  const navbarMenuItemClasses = navbarItemClassBuilder(selected, expanded);

  return (
    <StdTextTooltip text={label} placement="right" enabled={!expanded} disableArrow>
      <Link to={path} className={navbarMenuItemClasses} key={key} id={id}>
        <StdIcon name={icon} />
        {expanded && label}
      </Link>
    </StdTextTooltip>
  );
};

export default StdNavbarMenuItem;
