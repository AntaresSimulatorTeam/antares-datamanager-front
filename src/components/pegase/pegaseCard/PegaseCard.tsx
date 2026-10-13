/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { PropsWithChildren, ReactElement } from 'react';
import PegaseCardTitle from './pegaseCardTitle/PegaseCardTitle';
import { DropdownItemOption } from '@/shared/types';
import { Card } from '@design-system-rte/react';

export type PegaseCardSecondaryButtonPosition = 'default' | 'center';

type CardProps = {
  id?: number;
  disabled?: boolean;
  onClick?: () => void;
  title: string;
  dropdownOptions: DropdownItemOption[];
  icons?: ReactElement;
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
    <Card
      cardType="default"
      clickable
      onClick={onClick}
    >
      <div className="flex h-full w-full cursor-pointer flex-col gap-2 p-2">
        <PegaseCardTitle
          id={`${id}-title`}
          title={title}
          onClick={onClick}
          icons={icons}
          lineClamp={lineClamp}
          dropdownOptions={dropdownOptions}
        />
        <div className="flex">{children}</div>
      </div>
    </Card>
);
export default PegaseCard;
