/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { PropsWithChildren, ReactElement } from 'react';
import PegaseCardTitle from './pegaseCardTitle/PegaseCardTitle';
import { StdDropdownOption } from '@common/layout/stdDropdown/StdDropdown.tsx';
import { RdsIconButtonProps } from 'rte-design-system-react';

export type PegaseCardSecondaryButtonPosition = 'default' | 'center';

type CardProps = {
  id?: string;
  disabled?: boolean;
  onClick?: () => void;
  title: string;
  dropdownOptions: StdDropdownOption[];
  icons?: ReactElement<RdsIconButtonProps>;
  lineClamp?: number;
};

const PegaseCard = ({
  id,
  onClick,
  title,
  icons,
  lineClamp,
  dropdownOptions,
  children,
}: PropsWithChildren<CardProps>) => (
  <section
    className="flex h-full w-full cursor-pointer flex-col gap-2 p-2"
    style={{
      borderRadius: '0.375rem',
      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.2), 0 2px 4px -2px rgb(0 0 0 / 0.2)',
    }}
    onClick={onClick}
    onKeyDown={onClick}
    role="region"
  >
    <PegaseCardTitle
      id={`${id}-title`}
      title={title}
      onClick={onClick}
      icons={icons}
      lineClamp={lineClamp}
      dropdownOptions={dropdownOptions}
    />
    <div className="flex grow">{children}</div>
  </section>
);
export default PegaseCard;
