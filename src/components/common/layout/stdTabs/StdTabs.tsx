/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useStdId } from '@/hooks/common/useStdId';
import { useEffect, useMemo, useState } from 'react';
import { StdTabItemProps } from './StdTabItem';
import StdTabList from './StdTabList';

export type StdTabItemPrimary = Omit<StdTabItemProps, 'onClick' | 'tabType'>;
export type StdTabItemSecondary = Omit<StdTabItemProps, 'tabType'>;

type StdTabProps<TPrimary extends StdTabItemPrimary, TSecondary extends StdTabItemSecondary> = {
  id?: string;
  items: TPrimary[];
  renderPrimary: (item: TPrimary) => React.ReactElement;
  renderSecondary?: (item: TSecondary) => React.ReactElement;
};

const StdTabs = <TPrimary extends StdTabItemPrimary, TSecondary extends StdTabItemSecondary>({
  items,
  id: propsId,
  renderPrimary,
  renderSecondary,
}: StdTabProps<TPrimary, TSecondary>) => {
  const [primaryCurrentTab, setPrimaryCurrentTab] = useState(items.find((item) => item.active)?.id || items[0].id);
  const id = useStdId('tbs', propsId);

  useEffect(() => {
    const firstActive = items.find((item) => item.active);
    setPrimaryCurrentTab(firstActive?.id || items[0].id);
  }, [items]);

  const secondaryTabs = useMemo(() => {
    const selectPrimary = items.find((item) => item.id === primaryCurrentTab);
    return selectPrimary?.secondary ?? [];
  }, [items, primaryCurrentTab]) as TSecondary[];
  return (
    <div className="flex flex-col gap-1" role="group" id={id}>
      <StdTabList tabType="primary" items={items} renderItem={renderPrimary} />
      {secondaryTabs.length > 0 && renderSecondary && (
        <StdTabList tabType="secondary" items={secondaryTabs} renderItem={renderSecondary} />
      )}
    </div>
  );
};

export default StdTabs;
