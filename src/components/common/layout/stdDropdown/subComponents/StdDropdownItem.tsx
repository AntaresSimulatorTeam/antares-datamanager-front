/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import StdIcon from '@common/base/stdIcon/StdIcon';
import { MouseEventHandler } from 'react';
import { dropdownElementClassBuilder } from '../dropdownClassBuilder';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps';
import { useStdId } from '@/hooks/common/useStdId';

type StdDropDownItemProps = {
  id?: string;
  label: string;
  value: string;
  disabled?: boolean;
  active?: boolean;
  onClick: MouseEventHandler<HTMLDivElement>;
  icon?: StdIconId;
  extraClasses?: string;
};

const ICON_SIZE = 16;

const StdDropdownItem = ({
  id: propsId,
  label,
  disabled = false,
  active = false,
  onClick,
  icon,
  extraClasses,
}: StdDropDownItemProps) => {
  const id = useStdId('dropdown-item', propsId);

  return (
    <div
      id={id}
      onClick={onClick}
      className={dropdownElementClassBuilder(disabled, active, extraClasses)}
      tabIndex={disabled ? undefined : 0}
      role="option"
    >
      {icon && <StdIcon name={icon} height={ICON_SIZE} width={ICON_SIZE} />}
      {label}
    </div>
  );
};

export default StdDropdownItem;
