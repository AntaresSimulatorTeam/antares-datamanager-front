/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { StdIconId } from '@/shared/utils/common/mappings/iconMaps';
import StdIcon from '../../base/stdIcon/StdIcon';
import StdTextTooltip from '../stdTextTooltip/StdTextTooltip';
import { navbarControllerClassBuilder } from './navbarClassBuilder';

type StdNavbarControllerProps = {
  id: string;
  label: string;
  action: () => void;
  expanded?: boolean;
};

const StdNavbarController = ({ label, id, action, expanded = true }: StdNavbarControllerProps) => {
  const iconId = expanded ? StdIconId.KeyboardDoubleArrowLeft : StdIconId.KeyboardDoubleArrowRight;
  const navbarControllerClasses = navbarControllerClassBuilder(expanded);

  return (
    <div>
      <StdTextTooltip text={label} enabled={!expanded} placement="right" disableArrow>
        <div className={navbarControllerClasses} id={id} onClick={action} role="button" tabIndex={0}>
          <StdIcon name={iconId} isExplicit={expanded} alt={!expanded ? label : undefined} />
          {expanded && <>{label}</>}
        </div>
      </StdTextTooltip>
    </div>
  );
};

export default StdNavbarController;
