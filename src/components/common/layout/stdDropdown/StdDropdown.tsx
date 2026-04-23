import { useStdId } from '@/hooks/useStdId';
import { useVirtualizer } from '@tanstack/react-virtual';
import clsx from 'clsx';
import { type JSX, useRef } from 'react';
import StdDropdownItem from './subComponents/StdDropdownItem';

const DEFAULT_VIRTUALIZATION_THRESHOLD = 50;
const DEFAULT_VIRTUAL_ITEM_HEIGHT = 37;

const DEFAULT_ESTIMATE_SIZE = (_index: number) => DEFAULT_VIRTUAL_ITEM_HEIGHT;

export type StdDropdownOwnOption = {
  id?: string;
  key: string;
  label: string | JSX.Element;
  value: string;
  onItemClick?: (e: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>) => void;
  onCheckedChange?: (checked?: boolean) => void;
  disabled?: boolean;
  icon?: string;
  extraClasses?: string;
};

export type StdDropdownOption<E extends React.ElementType | undefined = React.ElementType | undefined> =
  StdDropdownOwnOption &
    (E extends React.ElementType ? Omit<React.ComponentProps<E>, keyof StdDropdownOwnOption> : unknown);

export type StdDropdownProps = {
  id?: string;
  items: StdDropdownOption[];
  header?: React.ReactNode;
  emptyDropdownItem?: React.ReactNode;
  footer?: React.ReactNode;
  selected?: Set<string>;
  isMultiple?: boolean;
  withCheckbox?: boolean;
  extraClasses?: string;
  estimateVirtualSize?: (index: number) => number;
  virtualizationThreshold?: number;
  onCloseDropdown?: () => void;
};

const WRAPPER_CLASSES = 'shadow-4 flex flex-col rounded border drop-shadow-sm bg-gray-w';
const ITEMS_WRAPPER_CLASSES = 'py-0.5 grow overflow-y-auto ig-scrollbar overflow-x-hidden';
const DEFAULT_EXTRA_CLASSES = 'max-h-28';

type ItemsProps = {
  items: StdDropdownOption[];
  selected?: Set<string>;
  withCheckbox?: boolean;
  estimateVirtualSize?: (index: number) => number;
};

const ItemsWithVirtualization = ({ items, selected, withCheckbox, estimateVirtualSize }: ItemsProps) => {
  'use no memo';
  const parentRef = useRef(null);

  // eslint-disable-next-line react-hooks/incompatible-library
  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: estimateVirtualSize ?? DEFAULT_ESTIMATE_SIZE,
  });
  return (
    <div className={ITEMS_WRAPPER_CLASSES} role="listbox" ref={parentRef}>
      <div
        className="relative w-full"
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualItem) => {
          const {
            value,
            onItemClick,
            onCheckedChange,
            extraClasses: itemExtraClasses,
            id,
            key: _,
            ...otherProps
          } = items[virtualItem.index];
          return (
            <StdDropdownItem
              id={id}
              key={virtualItem.index}
              value={value}
              active={selected?.has(value)}
              onClick={onItemClick}
              withCheckbox={withCheckbox}
              onCheckedChange={onCheckedChange}
              extraClasses={itemExtraClasses}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
              {...otherProps}
            />
          );
        })}
      </div>
    </div>
  );
};

const ItemsWithoutVirtualization = ({ items, selected, withCheckbox }: ItemsProps) => (
  <div className={ITEMS_WRAPPER_CLASSES} role="listbox">
    {items.map((item) => {
      const {
        key,
        value,
        disabled,
        onItemClick,
        onCheckedChange,
        extraClasses: itemExtraClasses,
        ...otherProps
      } = item;
      return (
        <StdDropdownItem
          key={key}
          value={value}
          disabled={disabled}
          active={selected?.has(value)}
          onClick={onItemClick}
          withCheckbox={withCheckbox}
          onCheckedChange={onCheckedChange}
          extraClasses={itemExtraClasses}
          {...otherProps}
        />
      );
    })}
  </div>
);

const StdDropdown = ({
  items,
  selected,
  header,
  emptyDropdownItem,
  footer,
  isMultiple,
  id: propsId,
  withCheckbox,
  extraClasses = DEFAULT_EXTRA_CLASSES,
  estimateVirtualSize,
  virtualizationThreshold,
  onCloseDropdown,
}: StdDropdownProps) => {
  const dropdownId = useStdId('dropdown', propsId);
  const wrapperClasses = clsx(WRAPPER_CLASSES, extraClasses);

  const useVirtualization = items.length >= (virtualizationThreshold ?? DEFAULT_VIRTUALIZATION_THRESHOLD);

  return (
    <div className={wrapperClasses} role={isMultiple ? 'combobox' : undefined} id={dropdownId} onBlur={onCloseDropdown}>
      {header && (
        <>
          {header}
          <hr className="border-gray-300" />
        </>
      )}
      {items.length === 0 ? (
        emptyDropdownItem
      ) : useVirtualization ? (
        <ItemsWithVirtualization
          items={items}
          selected={selected}
          withCheckbox={withCheckbox}
          estimateVirtualSize={estimateVirtualSize}
        />
      ) : (
        <ItemsWithoutVirtualization items={items} selected={selected} withCheckbox={withCheckbox} />
      )}
      {footer && (
        <>
          <hr className="border-gray-300" />
          {footer}
        </>
      )}
    </div>
  );
};

export default StdDropdown;
