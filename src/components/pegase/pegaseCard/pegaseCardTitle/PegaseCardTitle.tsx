/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { ReactElement } from 'react';
import cardTitleClassBuilder from './cardTitleClassBuilder';
import { RdsFloatingWrapper, RdsIconButtonProps } from 'rte-design-system-react';
import StdDropdown, { StdDropdownOption } from '@common/layout/stdDropdown/StdDropdown.tsx';
import { IconButton } from '@design-system-rte/react';

export type PegaseCardTitleProps = {
  id: string;
  title: string;
  dropdownOptions: StdDropdownOption[];
  icons?: ReactElement<RdsIconButtonProps>;
  lineClamp?: number;
  onClick?: () => void;
};

const { Trigger, Element } = RdsFloatingWrapper;

const PegaseCardTitle = ({ title, dropdownOptions, icons, lineClamp, onClick, id }: PegaseCardTitleProps) => {
  const { titleClasses } = cardTitleClassBuilder(lineClamp, !!onClick);
  return (
    <header className="flex items-start justify-between gap-1">
      <div className="flex min-w-0 items-center gap-1">
        {icons && <span className="flex shrink items-center">{icons}</span>}
        {onClick ? (
          <button className={titleClasses} onClick={onClick} aria-label={`title-${id}`}>
            {title}
          </button>
        ) : (
          <span className={titleClasses} id={`title-${id}`}>
            {title}
          </span>
        )}
      </div>
      <div role="presentation" onClick={(e) => e.stopPropagation()}>
        <RdsFloatingWrapper placement={'bottom-start'} fallbackPlacements={['bottom-end']} autoClose>
          <Trigger>
            <IconButton
              id={`${id}-button`}
              data-testid="project-card-menu"
              aria-label="more-vert"
              variant="transparent"
              size="m"
              name="more-vert"
              disabled={dropdownOptions.length === 0}
            />
          </Trigger>
          <Element>
            <div className="whitespace-nowrap">
              <StdDropdown items={dropdownOptions} />
            </div>
          </Element>
        </RdsFloatingWrapper>
      </div>
    </header>
  );
};

export default PegaseCardTitle;
