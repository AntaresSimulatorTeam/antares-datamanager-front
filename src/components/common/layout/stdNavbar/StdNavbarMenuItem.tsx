import { MenuNavItem } from '@/shared/types';
import StdIcon from '../../base/stdIcon/StdIcon';
import { ItemStyleConfig } from './StdNavbar';
import { navbarItemClassBuilder } from './navbarClassBuilder';
import { Link } from 'react-router-dom';

type StdNavbarMenuItemProps = {
  item: MenuNavItem;
  expanded?: boolean;
  selected?: boolean;
  itemsStyleConfig: {
    itemContent?: ItemStyleConfig;
    itemBackground?: ItemStyleConfig;
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
    <Link to={path} className={navbarMenuItemClasses} key={key} {...otherProps}>
      <div>
        <StdIcon name={icon} />
      </div>
      {expanded && label}
    </Link>
  );
};

export default StdNavbarMenuItem;
