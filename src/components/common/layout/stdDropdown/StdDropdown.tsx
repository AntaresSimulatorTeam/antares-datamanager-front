/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { MouseEventHandler } from 'react';
import StdDropdownItem from './subComponents/StdDropdownItem';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps';
import { useStdId } from '@/hooks/common/useStdId';

export type StdDropdownOption = {
  id?: string;
  key: string;
  label: string;
  value: string;
  onItemClick: MouseEventHandler<HTMLDivElement>;
  disabled?: boolean;
  icon?: StdIconId;
  extraClasses?: string;
};

export type StdDropdownProps = {
  id?: string;
  items: StdDropdownOption[];
  header?: React.ReactNode;
  emptyDropdownItem?: React.ReactNode;
  footer?: React.ReactNode;
  selected?: Set<string>;
  isMultiple?: boolean;
};

const WRAPPER_CLASSES = 'shadow-4 min-w-24 max-h-28 flex flex-col rounded border shadow-black drop-shadow-sm bg-gray-w';
const ITEMS_WRAPPER_CLASSES = 'py-0.5 grow overflow-y-auto ig-scrollbar';

const StdDropdown = ({
  items,
  selected,
  header,
  emptyDropdownItem,
  footer,
  isMultiple,
  id: propsId,
}: StdDropdownProps) => {
  const dropdownId = useStdId('dropdown', propsId);

  const optionItems = !items.length
    ? emptyDropdownItem
    : items.map(({ key, label, value, disabled, icon, onItemClick, extraClasses, id }) => (
        <StdDropdownItem
          id={id}
          key={key}
          label={label}
          value={value}
          disabled={disabled}
          active={selected && selected.has(value)}
          icon={icon}
          onClick={onItemClick}
          extraClasses={extraClasses}
        />
      ));

  return (
    <div className={WRAPPER_CLASSES} role={isMultiple ? 'combobox' : undefined} id={dropdownId}>
      {header && (
        <>
          {header}
          <hr className="border-gray-300" />
        </>
      )}
      <div className={ITEMS_WRAPPER_CLASSES} role="listbox" tabIndex={-1}>
        {optionItems}
      </div>
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
