/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import useModal from '@/hooks/useModal';
import { StdIconId } from '@/shared/utils/mappings/common/iconMaps';
import StdButton from '@common/base/stdButton/StdButton';
import StdIcon from '@common/base/stdIcon/StdIcon';
import { PropsWithChildren, ReactNode, useEffect, useRef } from 'react';
import modalTitleClassBuilder from './modalTitleClassBuilder';
export type StdModalTitleStatus = 'default' | 'danger';

type StdModalTitleProps = {
  onClose?: () => void;
  status?: StdModalTitleStatus;
  icon?: StdIconId;
  customIcon?: ReactNode;
  disabledAutoFocus?: boolean;
};

export default function StdModalTitle({
  icon,
  status = 'default',
  onClose: onCloseProps,
  customIcon,
  disabledAutoFocus,
  children,
}: PropsWithChildren<StdModalTitleProps>) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { closeModal } = useModal();
  const onClose = onCloseProps ?? closeModal;
  const { containerClasses, iconColor, childrenClasses } = modalTitleClassBuilder(status);

  useEffect(() => {
    if (!disabledAutoFocus) {
      buttonRef.current?.focus();
      buttonRef.current?.blur();
    }
  }, [disabledAutoFocus]);

  return (
    <header className={containerClasses}>
      {customIcon ? (
        <div>{customIcon}</div>
      ) : (
        icon && (
          <div>
            <StdIcon name={icon} color={iconColor} />
          </div>
        )
      )}
      <div className={childrenClasses}>{children}</div>
      <StdButton
        icon={StdIconId.Close}
        color="secondary"
        variant="transparent"
        onClick={onClose ?? closeModal}
        ref={buttonRef}
      />
    </header>
  );
}
