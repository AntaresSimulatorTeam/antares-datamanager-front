import { ItemBackgroundStyleConfig, ItemStyleConfig } from './StdNavbar';
import { navbarControllerClassBuilder } from './navbarClassBuilder.ts';
import { Icon } from '@design-system-rte/react';

type StdNavbarControllerProps = {
  id: string;
  label: string;
  action: () => void;
  expanded?: boolean;
  itemsStyleConfig: {
    itemContent?: ItemStyleConfig;
    itemBackground?: ItemBackgroundStyleConfig;
  };
};

const StdNavbarController = ({ id, label, action, expanded = true, itemsStyleConfig }: StdNavbarControllerProps) => {
  const iconId = expanded ? 'arrow-double-left' : 'arrow-double-right';
  const navbarControllerClasses = navbarControllerClassBuilder(
    expanded,
    itemsStyleConfig.itemBackground,
    itemsStyleConfig.itemContent,
  );

  return (
    <button id={id} className={navbarControllerClasses} onClick={action}>
      <div className={`flex items-center gap-1 ${expanded ? 'flex-row' : 'flex-col'}`}>
        <Icon name={iconId} />
        {label}
      </div>
    </button>
  );
};

export default StdNavbarController;
