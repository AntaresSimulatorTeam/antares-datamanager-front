/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { RdsButtonProps } from 'rte-design-system-react';
import StdButton from '@common/base/stdButton/StdButton';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps.ts';

type RdsCollapseIconProps = {
  onClick: RdsButtonProps['onClick'];
  isOpen: boolean;
};

const StdCollapseIcon = ({ onClick, isOpen }: RdsCollapseIconProps) => (
  <StdButton
    onClick={onClick}
    icon={isOpen ? StdIconId.KeyboardArrowDown : StdIconId.KeyboardArrowRight}
    size="extraSmall"
    variant="text"
  />
);

export default StdCollapseIcon;
