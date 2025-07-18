/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import StdTextWithTooltip from '@/components/common/layout/stdTextWithTooltip/StdTextWithTooltip';
import { ReactElement } from 'react';
import cardTitleClassBuilder from './cardTitleClassBuilder';
import {
  RdsButton,
  RdsDropdown,
  RdsDropdownOption,
  RdsFloatingWrapper,
  RdsIconButtonProps,
  RdsIconId,
  RdsTag,
  RdsTagProps,
} from 'rte-design-system-react';

export type PegaseCardTitleProps = {
  id: string;
  title: string;
  dropdownOptions: RdsDropdownOption[];
  icons?: ReactElement<RdsIconButtonProps>;
  tag?: Omit<RdsTagProps, 'onClose'>;
  lineClamp?: number;
  onClick?: () => void;
};

const { Trigger, Element } = RdsFloatingWrapper;

const PegaseCardTitle = ({ title, dropdownOptions, icons, tag, lineClamp, onClick, id }: PegaseCardTitleProps) => {
  const { titleClasses, textClasses } = cardTitleClassBuilder(lineClamp, !!onClick);
  return (
    <header className="flex items-start justify-between gap-1">
      <div className="flex min-w-0 items-center gap-1">
        {icons && <span className="flex shrink items-center">{icons}</span>}
        {onClick ? (
          <button className={titleClasses} onClick={() => onClick()} aria-label={`title-${id}`}>
            <StdTextWithTooltip className={textClasses} text={title} id={`title-${id}`} />
          </button>
        ) : (
          <StdTextWithTooltip className={titleClasses} text={title} id={`title-${id}`} />
        )}
        {tag && (
          <span role="list" className="flex items-center">
            <RdsTag {...tag} id={`${id}-tag`} />
          </span>
        )}
      </div>
      <div className="interactive" onClick={(e) => e.stopPropagation()}>
        <RdsFloatingWrapper placement={'bottom-start'} fallbackPlacements={['bottom-end']} autoClose>
          <Trigger>
            <RdsButton
              id={`${id}-button`}
              variant="text"
              size="small"
              icon={RdsIconId.MoreVert}
              disabled={dropdownOptions.length === 0}
            />
          </Trigger>
          <Element>
            <div className="whitespace-nowrap">
              <RdsDropdown items={dropdownOptions} />
            </div>
          </Element>
        </RdsFloatingWrapper>
      </div>
    </header>
  );
};

export default PegaseCardTitle;
