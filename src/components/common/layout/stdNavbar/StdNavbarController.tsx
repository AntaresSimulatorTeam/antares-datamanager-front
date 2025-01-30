/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { navbarControllerClassBuilder } from './navbarClassBuilder';
import { RdsIcon, RdsIconId, RdsTextTooltip } from 'rte-design-system-react';

type StdNavbarControllerProps = {
  id: string;
  label: string;
  action: () => void;
  expanded?: boolean;
};

const StdNavbarController = ({ label, id, action, expanded = true }: StdNavbarControllerProps) => {
  const iconId = expanded ? RdsIconId.KeyboardDoubleArrowLeft : RdsIconId.KeyboardDoubleArrowRight;
  const navbarControllerClasses = expanded ? navbarControllerClassBuilder(expanded) : undefined;

  return (
    <div>
      <RdsTextTooltip text={label} enabled={!expanded} placement="right" disableArrow>
        <div className={navbarControllerClasses} id={id} onClick={action} role="button" tabIndex={0}>
          {expanded ? <RdsIcon name={iconId} isExplicit /> : <RdsIcon name={iconId} isExplicit={false} alt={label} />}
          {!expanded && <>{label}</>}
        </div>
      </RdsTextTooltip>
    </div>
  );
};

export default StdNavbarController;
