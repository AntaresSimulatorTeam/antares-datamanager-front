import { ItemBackgroundStyleConfig, ItemStyleConfig } from './StdNavbar';
import StdNavbarMenuItem from './StdNavbarMenuItem';
import { MenuNavItem } from '@/shared/types';

type StdNavbarMenuProps = {
  menuItems: MenuNavItem[];
  expanded?: boolean;
  itemsStyleConfig?: {
    itemContent?: ItemStyleConfig;
    itemBackground?: ItemBackgroundStyleConfig;
  };
  currentItemKey?: string;
};

const StdNavbarMenu = ({ menuItems, expanded = true, itemsStyleConfig = {}, currentItemKey }: StdNavbarMenuProps) => (
  <section>
    {menuItems.map((item: MenuNavItem) => (
      <StdNavbarMenuItem
        item={item}
        key={item.key}
        expanded={expanded}
        itemsStyleConfig={itemsStyleConfig}
        selected={currentItemKey === item.key}
      />
    ))}
  </section>
);

export default StdNavbarMenu;
