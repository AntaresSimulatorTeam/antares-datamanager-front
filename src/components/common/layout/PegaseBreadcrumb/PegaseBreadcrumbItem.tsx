/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useActiveKeyboard, useRdsId } from 'rte-design-system-react';
import { pegaseBreadcrumbItemClassBuilder } from '@common/layout/PegaseBreadcrumb/pegaseBreadcrumbItemClassBuilder.ts';

export interface PegaseBreadcrumbItemProps {
  label: string;
  data: { id: string; name: string } | null;
  onClickItem: void | ((id: string, name: string) => Promise<void>);
  id?: string;
}

export const PegaseBreadcrumbItem = ({ label, onClickItem, data, id: propsId }: PegaseBreadcrumbItemProps) => {
  const id = useRdsId('breadcrumb-item', propsId);
  const { isActiveKeyboard } = useActiveKeyboard<HTMLAnchorElement>(undefined, {
    id,
    interactiveKeyCodes: ['Enter'],
  });

  return (
    <button
      onClick={() => {
        if (data) void onClickItem?.(data.id, data.name);
      }}
      className={pegaseBreadcrumbItemClassBuilder(isActiveKeyboard)}
      id={id}
    >
      <span className="rds-p-0.125 rds-text-button-m">{label}</span>
    </button>
  );
};
