/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import StdButton, { StdButtonProps } from '@/components/common/base/stdButton/StdButton';
import StdRowBox from './StdRowBox';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps';

type StdCollapseIconProps = {
  onClick: StdButtonProps['onClick'];
  isOpen: boolean;
};

const StdCollapseIcon = ({ onClick, isOpen }: StdCollapseIconProps) => (
  <StdRowBox>
    <StdButton
      onClick={onClick}
      icon={isOpen ? StdIconId.KeyboardArrowDown : StdIconId.KeyboardArrowRight}
      size="extraSmall"
      variant="text"
    />
  </StdRowBox>
);

export default StdCollapseIcon;
