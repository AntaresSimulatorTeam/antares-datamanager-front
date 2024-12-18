/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useStdId } from '@/hooks/useStdId';
import { findSlotOfType } from '@/shared/utils/slotsUtils';
import { ReactElement } from 'react';
import { modalClassBuilder } from './modalClassBuilder';
import StdModalTitle from './slots/StdModalTitle/StdModalTitle';
import StdModalContent from './slots/stdModalContents/StdModalContent';
import StdModalLateralContent from './slots/stdModalContents/StdModalLateralContent';
import StdModalFooter from './slots/stdModalFooter/StdModalFooter';
import StdModalWrapper, { StdModalProps } from './stdModalWrapper/StdModalWrapper';

export type ModalSize = 'extraSmall' | 'small' | 'medium' | 'large' | 'extraLarge';

export type StdModalComponentProps = StdModalProps & {
  children?: ReactElement | ReactElement[];
  size?: ModalSize;
  id?: string;
};

function StdModalComponent({ onClose, size, children = undefined, id: propsId }: StdModalComponentProps) {
  const id = useStdId('modal', propsId);
  const TitleComponent = findSlotOfType(children, StdModalTitle);
  const ContentComponent = findSlotOfType(children, StdModalContent);
  const LateralContentComponent = findSlotOfType(children, StdModalLateralContent);
  const FooterComponent = findSlotOfType(children, StdModalFooter);

  return (
    <StdModalWrapper onClose={onClose}>
      <div className={modalClassBuilder(size)} id={id}>
        {LateralContentComponent}
        <div className="flex grow flex-col gap-2">
          {TitleComponent}
          {ContentComponent}
          {FooterComponent}
        </div>
      </div>
    </StdModalWrapper>
  );
}

const StdModal = Object.assign(StdModalComponent, {
  Title: StdModalTitle,
  Content: StdModalContent,
  LateralContent: StdModalLateralContent,
  Footer: StdModalFooter,
});

export default StdModal;
