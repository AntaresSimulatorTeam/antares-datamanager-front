import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { WarningMessage } from '@/shared/types';
import { CardWithAccordion } from '@common/layout/CardWithAccordion.tsx';

type VirtualizerListProps = {
  items: WarningMessage[];
};

export const VirtualizerList = ({ items }: VirtualizerListProps) => {
  const listRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    scrollMargin: listRef.current?.offsetTop ?? 0,
    getScrollElement: () => listRef.current,
    estimateSize: () => 80,
    overscan: 7,
  });

  // Kill the cache entirely to prevent weird scrolling issues. This is a hack
  virtualizer.measurementsCache = [];

  return (
    <div ref={listRef} className="h-[600px] w-full overflow-y-auto rounded-lg">
      {/*`${virtualizer.getTotalSize()}px`*/}
      <div className="relative m-2 rounded-lg shadow-2" style={{ height: `${virtualizer.getTotalSize()}px` }}>
        {virtualizer.getVirtualItems()?.map((virtualItem) => {
          const item: WarningMessage = items?.[virtualItem.index];
          return (
            <CardWithAccordion key={virtualItem.index} data={item} index={virtualItem.index} nbItems={items.length} />
          );
        })}
      </div>
    </div>
  );
};
