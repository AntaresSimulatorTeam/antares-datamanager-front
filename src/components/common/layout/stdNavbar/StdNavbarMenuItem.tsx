import { MenuNavItem } from '@/shared/types';
import { ItemBackgroundStyleConfig, ItemStyleConfig } from './StdNavbar';
import { navbarItemClassBuilder } from './navbarClassBuilder.ts';
import { Link } from 'react-router-dom';
import { Icon } from '@design-system-rte/react';

type StdNavbarMenuItemProps = {
  item: MenuNavItem;
  expanded?: boolean;
  selected?: boolean;
  itemsStyleConfig: {
    itemContent?: ItemStyleConfig;
    itemBackground?: ItemBackgroundStyleConfig;
  };
  currentItemKey?: string;
};

const StdNavbarMenuItem = ({ item, expanded = true, selected = false, itemsStyleConfig }: StdNavbarMenuItemProps) => {
  const { key, icon, label, path, ...otherProps } = item;
  const navbarMenuItemClasses = navbarItemClassBuilder(
    selected,
    expanded,
    itemsStyleConfig.itemBackground,
    itemsStyleConfig.itemContent,
  );

  return (
    <Link className={navbarMenuItemClasses} key={key} {...otherProps} to={path}>
      <div className={`flex items-center gap-1 ${expanded ? 'flex-row' : 'flex-col'}`}>
        <Icon name={icon} size={24} />
        {label}
      </div>
    </Link>
  );
};

export default StdNavbarMenuItem;
