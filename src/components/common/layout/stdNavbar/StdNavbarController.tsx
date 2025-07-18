import StdIcon from '../../base/stdIcon/StdIcon';
import { ItemBackgroundStyleConfig, ItemStyleConfig } from './StdNavbar';
import { navbarControllerClassBuilder } from './navbarClassBuilder.ts';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps.ts';

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
  const iconId = expanded ? StdIconId.KeyboardDoubleArrowLeft : StdIconId.KeyboardDoubleArrowRight;
  const navbarControllerClasses = navbarControllerClassBuilder(
    expanded,
    itemsStyleConfig.itemBackground,
    itemsStyleConfig.itemContent,
  );

  return (
    <button id={id} className={navbarControllerClasses} onClick={action}>
      <div className={`flex items-center gap-1 ${expanded ? 'flex-row' : 'flex-col'}`}>
        {expanded ? <StdIcon name={iconId} isExplicit /> : <StdIcon name={iconId} isExplicit={false} alt={label} />}
        {label}
      </div>
    </button>
  );
};

export default StdNavbarController;
