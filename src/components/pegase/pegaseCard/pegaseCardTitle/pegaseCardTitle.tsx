/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import StdButton from '@/components/common/base/stdButton/StdButton';
import { StdIconButtonProps } from '@/components/common/base/stdIconButton/StdIconButton';
import StdDropdown, { StdDropdownOption } from '@/components/common/layout/stdDropdown/StdDropdown';
import StdFloatingWrapper from '@/components/common/layout/stdFloatingWrapper/StdFloatingWrapper';
import StdTextWithTooltip from '@/components/common/layout/stdTextWithTooltip/StdTextWithTooltip';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps';
import StdTag, { StdTagProps } from '@common/base/stdTag/StdTag';
import { ReactElement } from 'react';
import cardTitleClassBuilder from './cardTitleClassBuilder';

export type PegaseCardTitleProps = {
  id: string;
  title: string;
  dropdownOptions: StdDropdownOption[];
  icons?: ReactElement<StdIconButtonProps>;
  tag?: Omit<StdTagProps, 'onClose'>;
  lineClamp?: number;
  onClick?: () => void;
};

const { Trigger, Element } = StdFloatingWrapper;

const PegaseCardTitle = ({ title, dropdownOptions, icons, tag, lineClamp, onClick, id }: PegaseCardTitleProps) => {
  const { titleClasses, textClasses } = cardTitleClassBuilder(lineClamp, !!onClick);
  return (
    <header className="flex items-start justify-between gap-1">
      <div className="flex min-w-0 items-center gap-1">
        {icons && <span className="flex shrink items-center">{icons}</span>}
        {onClick ? (
          <button className={titleClasses} onClick={onClick}>
            <StdTextWithTooltip className={textClasses} text={title} id={`title-${id}`} />
          </button>
        ) : (
          <StdTextWithTooltip className={titleClasses} text={title} id={`title-${id}`} />
        )}
        {tag && (
          <span role="list" className="flex items-center">
            <StdTag {...tag} id={`${id}-tag`} />
          </span>
        )}
      </div>
      <div className="interactive" onClick={(e) => e.stopPropagation()}>
        <StdFloatingWrapper placement={'bottom-start'} fallbackPlacements={['bottom-end']} autoClose>
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
              <StdDropdown items={dropdownOptions} />
            </div>
          </Element>
        </StdFloatingWrapper>
      </div>
    </header>
  );
};

export default PegaseCardTitle;
