/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import useActiveKeyboard from '@/hooks/common/useActiveKeyboard';
import { useStdId } from '@/hooks/common/useStdId';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps';
import { MouseEventHandler } from 'react';
import StdButton from '../../base/stdButton/StdButton';
import StdIcon from '../../base/stdIcon/StdIcon';
import { tabItemClassBuilder } from './tabClassBuilder';

export type TabItemType = 'primary' | 'secondary';

export type StdTabItemProps = {
  onClick: (selectedItemName: string) => void;
  name: string;
  tabType?: TabItemType;
  id?: string;
  label?: string;
  icon?: StdIconId;
  active?: boolean;
  disabled?: boolean;
  button?: {
    icon: StdIconId;
    onClick: MouseEventHandler<HTMLButtonElement>;
  };
  onDropdown?: MouseEventHandler<HTMLInputElement>;
  secondary?: Omit<StdTabItemProps, 'onClick' | 'secondary'>[];
};

const ICON_SIZE = 16;

const StdTabItem = ({
  id: propsId,
  tabType = 'primary',
  label,
  icon,
  active,
  disabled,
  name,
  onClick,
  button,
}: StdTabItemProps) => {
  const id = useStdId('tbi', propsId);
  const [handlerKeyboardEvent, isActiveKeyboard] = useActiveKeyboard<HTMLDivElement>(() => onClick?.(name), { id });
  const { contentContainerClasses, borderClasses } = tabItemClassBuilder(
    tabType,
    isActiveKeyboard,
    icon,
    active,
    disabled,
  );

  return (
    <div role="tab" id={id}>
      <div
        className={contentContainerClasses}
        id={id}
        onClick={() => onClick(name)}
        tabIndex={disabled ? -1 : 0}
        {...handlerKeyboardEvent}
      >
        {icon && <StdIcon name={icon} width={ICON_SIZE} height={ICON_SIZE} />}
        {label && <span className="whitespace-nowrap">{label}</span>}
        {button && <StdButton icon={button.icon} onClick={button.onClick} variant="transparent" size="extraSmall" />}
      </div>
      {tabType === 'primary' && <div className={borderClasses} />}
    </div>
  );
};

export default StdTabItem;
