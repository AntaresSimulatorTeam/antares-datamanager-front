import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { WarningMessage } from '@/shared/types';
import { CardWithAccordion } from '@common/layout/CardWithAccordion.tsx';

type VirtualizerListProps = {
  items: WarningMessage[];
};

export const VirtualizerList = ({ items }: VirtualizerListProps) => {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,
    overscan: 5,
  });

  return (
    <div ref={parentRef} className="h-[600px] w-full overflow-y-auto rounded">
      {/* The large inner element to hold all of the items */}
      {/*`${virtualizer.getTotalSize()}px`*/}
      {/* Only the visible items in the virtualizer, manually positioned to be in view */}
      {virtualizer.getVirtualItems()?.map((virtualItem) => {
        const item: WarningMessage = items?.[virtualItem.index];
        return <CardWithAccordion key={`message-${virtualItem.index}`} data={item} />;
      })}
    </div>
  );
};
