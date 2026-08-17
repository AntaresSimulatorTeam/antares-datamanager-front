/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { ReactElement, useState } from 'react';
import cardTitleClassBuilder from './cardTitleClassBuilder';
import { RdsIconButtonProps } from 'rte-design-system-react';
import { Button, Dropdown, DropdownItem, IconButton } from '@design-system-rte/react';
import { DropdownItemOption } from '@/shared/types';

export type PegaseCardTitleProps = {
  id: string;
  title: string;
  dropdownOptions: DropdownItemOption[];
  icons?: ReactElement<RdsIconButtonProps>;
  lineClamp?: number;
  onClick?: () => void;
};

const PegaseCardTitle = ({ title, dropdownOptions, icons, lineClamp, onClick, id }: PegaseCardTitleProps) => {
  const { titleClasses } = cardTitleClassBuilder(lineClamp, !!onClick);
  const [open, setOpen] = useState(false);

  return (
    <header className="flex items-start justify-between gap-1">
      <div className="flex justify-start min-w-0 items-center gap-1">
        {icons && <span className="flex shrink items-center">{icons}</span>}
        {onClick ? (
          <Button
            label={title}
            onClick={onClick}
            variant="neutral"
            size="s"
          />
        ) : (
          <span className={titleClasses} id={`title-${id}`}>
            {title}
          </span>
        )}
      </div>
      <div role="presentation" onClick={(e) => e.stopPropagation()}>
          <Dropdown
            dropdownId="card-options"
            onClose={() => setOpen(false)}
            style={{width: '20px'}}
            trigger={
              <IconButton
                id={`${id}-button`}
                data-testid="project-card-menu"
                aria-label="more-vert"
                variant="text"
                size="m"
                name="more-vert"
                disabled={dropdownOptions.length === 0}
                onClick={(e) => {
                  setOpen(true);
                  e.stopPropagation();
                }}
              />
            }
            isOpen={open}
          >
            {dropdownOptions.map(option => (<DropdownItem key={option.label} {...option} />))}
          </Dropdown>
      </div>
    </header>
  );
};

export default PegaseCardTitle;
