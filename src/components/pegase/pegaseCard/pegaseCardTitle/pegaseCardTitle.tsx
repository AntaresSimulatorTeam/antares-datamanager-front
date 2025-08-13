/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { ReactElement } from 'react';
import cardTitleClassBuilder from './cardTitleClassBuilder';
import {
  RdsDropdown,
  RdsDropdownOption,
  RdsFloatingWrapper,
  RdsIconButtonProps,
  RdsTag,
  RdsTagProps,
} from 'rte-design-system-react';
import StdButton from '@common/base/stdButton/StdButton.tsx';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps.ts';

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
        {tag && (
          <span role="list" className="flex items-center">
            <RdsTag {...tag} id={`${id}-tag`} />
          </span>
        )}
      </div>
      <div className="interactive" onClick={(e) => e.stopPropagation()}>
        <RdsFloatingWrapper placement={'bottom-start'} fallbackPlacements={['bottom-end']} autoClose>
          <Trigger>
            <StdButton
              id={`${id}-button`}
              variant="text"
              size="small"
              icon={StdIconId.MoreVert}
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
