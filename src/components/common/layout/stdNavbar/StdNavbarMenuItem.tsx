/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { MenuNavItem } from '@/shared/types';
import { Link } from 'react-router-dom';
import { navbarItemClassBuilder } from './navbarClassBuilder';
import { useTranslation } from 'react-i18next';
import { RdsIcon, RdsTextTooltip, useRdsId } from 'rte-design-system-react';

type StdNavbarMenuItemProps = {
  item: MenuNavItem;
  expanded: boolean;
  selected: boolean;
};

const StdNavbarMenuItem = ({ item, expanded = true, selected = false }: StdNavbarMenuItemProps) => {
  const id = useRdsId('navbar-item', item.id);
  const { t } = useTranslation();
  const { path, key, icon, label } = item;
  const navbarMenuItemClasses = navbarItemClassBuilder(selected, expanded);

  return (
    <RdsTextTooltip text={label} placement="right" enabled={!expanded} disableArrow>
      <Link to={path} className={navbarMenuItemClasses} key={key} id={id}>
        <RdsIcon name={icon} />
        {expanded && t(label)}
      </Link>
    </RdsTextTooltip>
  );
};

export default StdNavbarMenuItem;
