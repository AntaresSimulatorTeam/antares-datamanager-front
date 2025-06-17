import StdIcon from '../../base/stdIcon/StdIcon';
import { ItemBackgroundStyleConfig, ItemStyleConfig } from './StdNavbar';
import { navbarControllerClassBuilder } from './navbarClassBuilder.ts';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps.ts';

type StdNavbarControllerProps = {
  label: string;
  action: () => void;
  expanded?: boolean;
  itemsStyleConfig: {
    itemContent?: ItemStyleConfig;
    itemBackground?: ItemBackgroundStyleConfig;
  };
};

const StdNavbarController = ({ label, action, expanded = true, itemsStyleConfig }: StdNavbarControllerProps) => {
  const iconId = expanded ? StdIconId.KeyboardDoubleArrowLeft : StdIconId.KeyboardDoubleArrowRight;
  const navbarControllerClasses = navbarControllerClassBuilder(
    expanded,
    itemsStyleConfig.itemBackground,
    itemsStyleConfig.itemContent,
  );

  return (
    <button className={navbarControllerClasses} onClick={action}>
      <div>
        {expanded ? <StdIcon name={iconId} isExplicit /> : <StdIcon name={iconId} isExplicit={false} alt={label} />}
      </div>
      {expanded && <>{label}</>}
    </button>
  );
};

export default StdNavbarController;
