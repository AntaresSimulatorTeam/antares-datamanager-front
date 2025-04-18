import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

type Props<T> = {
  items: T[];
  isOpen: boolean;
  renderItem: (item: T, size: string, transform: string, key: string) => React.ReactNode;
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
    paddingStart: 5,
  });

  return (
    <div ref={listRef} className={`w-full overflow-auto rounded-lg py-1 ${isOpen ? 'h-full' : '0'}`}>
      <div className="relative h-full w-full">
        {virtualizer.getVirtualItems()?.map((virtualItem) => {
          const item: T = items?.[virtualItem.index];
          return renderItem(item, `${virtualItem.size}px`, `translateX(${virtualItem.start}px)`, `${virtualItem.key}`);
        })}
      </div>
    </div>
  );
};
