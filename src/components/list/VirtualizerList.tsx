import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

type Props<T> = {
  items: T[];
  isOpen: boolean;
  renderItem: (item: T, size: string, transform: string) => React.ReactNode;
};

export const VirtualizerList = <T,>({ items, isOpen, renderItem }: Props<T>) => {
  const listRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    horizontal: true,
    count: items.length,
    getScrollElement: () => listRef.current,
    estimateSize: () => 350,
    gap: 20,
    overscan: 5,
  });

  return (
    <div ref={listRef} className={`mr-4 overflow-auto rounded-lg ${isOpen ? 'h-[250px] sm:h-[180px]' : '0'}`}>
      <div className="relative m-2 h-full sm:m-0">
        {virtualizer.getVirtualItems()?.map((virtualItem) => {
          const item: T = items?.[virtualItem.index];
          return renderItem(item, `${virtualItem.size}px`, `translateX(${virtualItem.start}px)`);
        })}
      </div>
    </div>
  );
};
