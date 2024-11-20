/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useStdId } from '@/hooks/common/useStdId';
import { DisplayStatus } from '@/shared/types/common/DisplayStatus.type';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps';
import StdButton from '../../base/stdButton/StdButton';
import { toastClassBuilder } from './toastClassBuilder';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface StdToastProps {
  message: string;
  id?: string;
  status?: DisplayStatus;
  action?: ToastAction;
  onClose?: () => void;
  progressBarPlaceholder?: boolean;
}

const StdToast = ({
  message,
  id: propsId,
  status = 'info',
  action,
  onClose,
  progressBarPlaceholder = false,
}: StdToastProps) => {
  const { containerClasses, textClasses } = toastClassBuilder(status, progressBarPlaceholder);
  const id = useStdId('toast', propsId);
  return (
    <div id={id} className={containerClasses} role="alert">
      <span className={textClasses}>{message}</span>
      {action && (
        <StdButton
          onClick={action.onClick}
          variant="transparent"
          size="small"
          color="secondary"
          label={action.label}
          aria-label={action.label}
        />
      )}
      {onClose && <StdButton icon={StdIconId.Close} onClick={onClose} variant="text" />}
    </div>
  );
};

export default StdToast;
