/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { Placement } from '@floating-ui/react';
import { Dispatch, ReactElement, SetStateAction } from 'react';
import StdFloatingWrapper from '../stdFloatingWrapper/StdFloatingWrapper';
import StdPopoverContent from './StdPopoverContent';
import StdPopoverFooter from './StdPopoverFooter';
import StdPopoverTrigger from './StdPopoverTrigger';
import { useStdId } from '@/hooks/common/useStdId';
import { findSlotOfType } from '@/shared/utils/common/slotsUtils';

const { Trigger, Element } = StdFloatingWrapper;

export type StdPopoverComponentProps = {
  children: ReactElement | ReactElement[];
  placement?: Placement;
  fallbackPlacement?: Placement[];
  offset?: number;
  enabled?: boolean;
  show?: boolean;
  setShow?: Dispatch<SetStateAction<boolean>>;
  disableArrow?: boolean;
  id?: string;
};

const StdPopoverComponent = ({
  children,
  placement,
  fallbackPlacement,
  offset,
  show,
  setShow,
  disableArrow,
  id: propsId,
}: StdPopoverComponentProps) => {
  const id = useStdId('popover', propsId);
  const TriggerComponent = findSlotOfType(children, StdPopoverTrigger);
  const ContentComponent = findSlotOfType(children, StdPopoverContent);
  const FooterComponent = findSlotOfType(children, StdPopoverFooter);

  return (
    <StdFloatingWrapper
      show={show}
      setShow={setShow}
      interactiveMode="click"
      placement={placement}
      fallbackPlacements={fallbackPlacement}
      offset={offset}
      arrowParams={{ enabled: !disableArrow, className: 'fill-gray-w' }}
      id={id}
    >
      <Trigger>{TriggerComponent}</Trigger>
      <Element>
        <div className="flex flex-col gap-2 rounded bg-gray-w p-2 shadow-4" role="popover">
          {ContentComponent}
          {FooterComponent}
        </div>
      </Element>
    </StdFloatingWrapper>
  );
};

const StdPopover = Object.assign(StdPopoverComponent, {
  Trigger: StdPopoverTrigger,
  Content: StdPopoverContent,
  Footer: StdPopoverFooter,
});

export default StdPopover;
