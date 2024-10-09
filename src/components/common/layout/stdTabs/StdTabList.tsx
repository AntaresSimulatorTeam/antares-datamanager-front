/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useStdId } from '@/hooks/common/useStdId';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps';
import { UIEventHandler, useEffect, useRef, useState } from 'react';
import StdButton from '../../base/stdButton/StdButton';

import { TabItemType } from './StdTabItem';
import { tabListClassBuilder } from './tabClassBuilder';

type StdTabListProps<TItem> = {
  tabType: TabItemType;
  items: TItem[];
  renderItem: (item: TItem) => React.ReactElement;
  lastItem?: () => React.ReactElement;
  id?: string;
};

type ScreenSize = {
  width: number;
  height: number;
};

const SCROLL_GAP = 100;

const StdTabList = <TItem,>({
  tabType = 'primary',
  items,
  renderItem,
  lastItem,
  id: propsId,
}: StdTabListProps<TItem>) => {
  const divListRef = useRef<HTMLDivElement>(null);
  const [, setScreenSize] = useState<ScreenSize | null>(null);
  const [scrollValue, setScrollValue] = useState<number>(0);

  const id = useStdId('tbl', propsId);

  const { buttonClasses } = tabListClassBuilder(
    tabType,
    scrollValue,
    divListRef.current?.clientWidth,
    divListRef.current?.scrollWidth,
  );

  const onArrowLeftClick = () => {
    const nextScrollValue = scrollValue - SCROLL_GAP;
    if (scrollValue > 0) {
      divListRef?.current?.scroll({ left: nextScrollValue, behavior: 'smooth' });
    }
  };

  const onArrowRightClick = () => {
    let nextScrollValue = scrollValue + SCROLL_GAP;
    if (divListRef.current && scrollValue < divListRef.current.scrollWidth - divListRef.current.clientWidth) {
      const gapWidth = divListRef.current.scrollWidth - divListRef.current.clientWidth;
      nextScrollValue = Math.min(nextScrollValue, gapWidth);
      divListRef?.current?.scroll({
        left: nextScrollValue,
        behavior: 'smooth',
      });
    }
  };

  const handleScroll: UIEventHandler<HTMLDivElement> = (e) => {
    setScrollValue((e.target as HTMLDivElement).scrollLeft);
  };

  const handleResize = () => {
    setScreenSize({
      width: window.screen.width,
      height: window.screen.height,
    });
  };

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isPrimaryDisplay = tabType === 'primary';

  return (
    <div role="tablist" id={id} className="relative">
      <div className="flex">
        <div className={buttonClasses.left}>
          <StdButton
            icon={StdIconId.KeyboardArrowLeft}
            color="secondary"
            size="small"
            variant={isPrimaryDisplay ? 'contained' : 'text'}
            onClick={onArrowLeftClick}
          />
        </div>
        <div className="no-wrap flex overflow-x-hidden" ref={divListRef} onScroll={handleScroll}>
          {items.map((item) => renderItem(item))}
          {lastItem && lastItem()}
        </div>
        <div className={buttonClasses.right}>
          <StdButton
            icon={StdIconId.KeyboardArrowRight}
            color="secondary"
            size="small"
            variant={isPrimaryDisplay ? 'contained' : 'text'}
            onClick={onArrowRightClick}
          />
        </div>
        {isPrimaryDisplay && <div className="grow border-b-2 border-gray-300" />}
      </div>
    </div>
  );
};

export default StdTabList;
