/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { RdsBreadcrumbSeparator, useRdsId } from 'rte-design-system-react';
import { PegaseBreadcrumbItemType } from '@/shared/types';
import { PegaseLinearBreadcrumb } from '@common/layout/PegaseBreadcrumb/PegaseLinearBreadcrumb.tsx';

type RdsBreadcrumbProps = {
  items: PegaseBreadcrumbItemType[];
  id?: string;
};

export const PegaseBreadcrumb = ({ items, id: propsId }: RdsBreadcrumbProps) => {
  const id = useRdsId('breadcrumb', propsId);

  if (items.length <= 3) {
    return (
      <div id={id} className="rds-flex rds-gap-0.5 rds-align-middle">
        <PegaseLinearBreadcrumb items={items} />
      </div>
    );
  }

  return (
    <div id={id} className="rds-flex rds-items-center rds-align-middle">
      <RdsBreadcrumbSeparator />
      <PegaseLinearBreadcrumb items={items.slice(-2)} />
    </div>
  );
};
