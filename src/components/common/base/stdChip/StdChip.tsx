/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import useActiveKeyboard from '@/hooks/common/useActiveKeyboard';
import { useStdId } from '@/hooks/common/useStdId';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps';

import StdIcon from '@common/base/stdIcon/StdIcon';
import { MouseEventHandler } from 'react';
import { chipClassBuilder } from './chipClassBuilder';

export type ChipStatus = 'primary' | 'secondary' | 'success' | 'error';

export type StdChipProps = {
  id?: string;
  status?: ChipStatus;
  label?: string;
  icon?: StdIconId;
  onClick?: (e: React.MouseEvent<HTMLSpanElement> | React.KeyboardEvent<HTMLSpanElement>) => void;
  onClose?: MouseEventHandler<HTMLButtonElement>;
};

const CHIP_ICON_SIZE = 16;
const CLOSE_ICON_SIZE = 12;

const StdChip = ({ id: propsId, label, status = 'primary', icon, onClose, onClick }: StdChipProps) => {
  const id = useStdId('chip', propsId);
  const [handlerKeyboardEvent, isActiveKeyboard] = useActiveKeyboard<HTMLSpanElement>((e) => onClick?.(e), { id });
  const { labelClasses, chipClasses, closeButtonClasses } = chipClassBuilder(
    status,
    isActiveKeyboard,
    label,
    icon,
    onClick,
    onClose,
  );

  return (
    <span
      className={chipClasses}
      tabIndex={onClick ? 0 : -1}
      role="listitem"
      onClick={onClick}
      id={id}
      {...handlerKeyboardEvent}
    >
      {icon && <StdIcon name={icon} width={CHIP_ICON_SIZE} height={CHIP_ICON_SIZE} />}
      {label && <span className={labelClasses}>{label}</span>}
      {onClose && (
        <button
          title="Close"
          className={closeButtonClasses}
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation();
            onClose(e);
          }}
        >
          <StdIcon name={StdIconId.Close} width={CLOSE_ICON_SIZE} height={CLOSE_ICON_SIZE} />
        </button>
      )}
    </span>
  );
};

export default StdChip;
