/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import StdIcon from '@common/base/stdIcon/StdIcon';
import { RotationOptionsType } from '../stdIcon/Icon';
import { iconButtonClassBuilder } from './iconButtonClassBuilder';
import { useStdId } from '@/hooks/common/useStdId';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps';

export type IconButtonVariant = 'default' | 'danger';
export type IconButtonSize = 'extraSmall' | 'small' | 'medium';

export interface StdIconButtonProps {
  icon: StdIconId;
  size?: IconButtonSize;
  variant?: IconButtonVariant;
  disabled?: boolean;
  id?: string;
  color?: string;
  onClick: () => void;
  rotationOptions?: RotationOptionsType;
  rotate?: boolean;
}

const ICON_SIZE: Record<IconButtonSize, number> = {
  extraSmall: 12,
  small: 16,
  medium: 20,
};

const StdIconButton = ({
  icon,
  size = 'medium',
  variant = 'default',
  disabled = false,
  id: propsId,
  color,
  onClick,
  rotationOptions,
  rotate,
}: StdIconButtonProps) => {
  const iconButtonClasses = iconButtonClassBuilder(variant, disabled);
  const id = useStdId('icon-btn', propsId);

  return (
    <button
      className={iconButtonClasses}
      disabled={disabled}
      onClick={onClick}
      onMouseDown={(e) => e.preventDefault()}
      id={id}
      aria-label={icon}
    >
      <StdIcon
        name={icon}
        width={ICON_SIZE[size]}
        height={ICON_SIZE[size]}
        color={color}
        rotationOptions={rotationOptions}
        rotate={rotate}
      />
    </button>
  );
};

export default StdIconButton;
