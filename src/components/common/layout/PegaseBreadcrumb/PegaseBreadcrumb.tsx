/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import {
  RdsBreadcrumbSeparator,
  RdsDropdown,
  RdsDropdownOption,
  RdsFloatingWrapper,
  useRdsId,
} from 'rte-design-system-react';
import { PegaseBreadcrumbItemType } from '@/shared/types';
import { PegaseLinearBreadcrumb } from '@common/layout/PegaseBreadcrumb/PegaseLinearBreadcrumb.tsx';
import StdButton from '@/components/button/stdButton/StdButton.tsx';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps.ts';

type RdsBreadcrumbProps = {
  items: PegaseBreadcrumbItemType[];
  id?: string;
};

const { Trigger, Element } = RdsFloatingWrapper;

export const PegaseBreadcrumb = ({ items, id: propsId }: RdsBreadcrumbProps) => {
  const id = useRdsId('breadcrumb', propsId);

  if (items.length <= 3) {
    return (
      <div id={id} className="rds-flex rds-gap-0.5 rds-align-middle">
        <PegaseLinearBreadcrumb items={items} />
      </div>
    );
  }

  const extraItems: RdsDropdownOption[] = items.slice(0, -2).map((item) => ({
    id: item.id,
    key: item.key,
    label: item.label,
    value: item.label,
    onItemClick: () => {},
  }));

  return (
    <div id={id} className="rds-flex rds-items-center rds-align-middle">
      <RdsFloatingWrapper placement="bottom-start" autoClose offset={3}>
        <Trigger>
          <div className="rds-flex rds-items-center">
            <StdButton variant="transparent" size="small" color="secondary" icon={StdIconId.MoreHoriz} />
          </div>
        </Trigger>
        <Element>
          <RdsDropdown items={extraItems} />
        </Element>
      </RdsFloatingWrapper>
      <RdsBreadcrumbSeparator />
      <PegaseLinearBreadcrumb items={items.slice(-2)} />
    </div>
  );
};
