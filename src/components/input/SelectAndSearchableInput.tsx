/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { MouseEvent, useCallback, useRef, useState } from 'react';
import { SelectOption } from '@/shared/types';
import { IconButton, TextInput } from '@design-system-rte/react';

interface ProjectManagerProps {
  onSelect: (value: SelectOption) => void;
  setSearchTerm?: (value?: string) => Promise<SelectOption[] | undefined>;
  isSearchable?: boolean;
  isInputDisabled?: boolean;
  resetField?: () => void;
  options?: SelectOption[];
  required?: boolean;
  errorMessage?: string;
  defaultValue?: string;
  label?: string;
  defaultPlaceHolder?: string;
}

const SelectAndSearchableInput = ({
  onSelect,
  setSearchTerm,
  isSearchable = false,
  isInputDisabled = false,
  resetField,
  options,
  required = false,
  errorMessage,
  defaultValue,
  label,
  defaultPlaceHolder,
}: ProjectManagerProps) => {
  const [defaultOptions] = useState<SelectOption[] | undefined>(options);
  const [optionsSelection, setOptionsSelection] = useState<SelectOption[] | undefined>(options ?? []);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [isSelectEnable, setIsSelectEnable] = useState<boolean>(true);
  const [valueInput, setValueInput] = useState<string>(defaultValue ?? '');
  const dropdownList = useRef<HTMLDivElement | null>(null);
  const selectInputClass = isInputDisabled ? `bg-gray-200 border-opacity-0 cursor-not-allowed pointer-events-none` : '';
  const classNameIcon = `absolute right-0 ${label ? 'top-4' : 'top-0.5'} z-50`;

  const handleInputChange = useCallback(
    async (value: string) => {
      try {
        if (value) {
          setValueInput(value);
          setIsDropdownOpen(false);
          setIsSelectEnable(false);
          const results = await setSearchTerm?.(value);
          setIsDropdownOpen(true);
          if (results && results.length > 0) {
            setOptionsSelection(results);
          } else {
            setOptionsSelection([]);
          }
        } else {
          resetField?.();
          setValueInput('');
          setIsSelectEnable(true);
          setIsDropdownOpen(false);
          setOptionsSelection(defaultOptions);
        }
      } catch {
        // silent handler
      }
    },
    [defaultOptions, resetField, setSearchTerm],
  );

  const handleSelectOption = useCallback(
    (value: SelectOption) => {
      setValueInput(value?.label);
      onSelect(value);
      setIsDropdownOpen(false);
    },
    [onSelect],
  );

  const handleClickOnKeyboard = useCallback(
    async (event: MouseEvent<HTMLButtonElement>) => {
      try {
        const results = await setSearchTerm?.();
        if (results && results.length > 0) {
          setOptionsSelection(results);
        } else {
          setOptionsSelection([]);
        }
      } finally {
        setIsDropdownOpen((prev) => !prev);
        setTimeout(() => {
          dropdownList.current?.focus();
        }, 0);
        event.stopPropagation();
      }
    },
    [setSearchTerm],
  );

  return (
    <div className={`relative ${selectInputClass}`}>
      <div className={classNameIcon}>
        {isSelectEnable && !valueInput && (
          <IconButton
            name={isDropdownOpen ? 'arrow-chevron-down' : 'arrow-chevron-right'}
            size="s"
            variant="text"
            onClick={(e) => void handleClickOnKeyboard(e)}
            disabled={!isSelectEnable}
          />
        )}
      </div>
      <TextInput
        id="text-input-select"
        label={label ?? ''}
        onChange={(e) => {
          if (isSearchable) {
            void handleInputChange(e);
          } else {
            resetField?.();
            setValueInput('');
            setIsDropdownOpen(false);
          }
        }}
        value={valueInput}
        disabled={isInputDisabled}
        required={required}
        rightIconAction="clean"
        placeholder={defaultPlaceHolder}
      />
      {errorMessage && <div className="text-red-500 mt-2">{errorMessage}</div>}
      {isDropdownOpen && !!optionsSelection?.length && (
        <div
          className={`absolute left-0 ${label ? 'top-8' : 'top-4'} z-50 max-h-32 w-full overflow-y-auto rounded border border-gray-300 bg-gray-w shadow-2 outline-none`}
          onMouseDown={(e) => e.preventDefault()}
          ref={dropdownList}
          tabIndex={0}
          onBlur={() => setIsDropdownOpen(false)}
          role="listbox"
        >
          {optionsSelection.map((trajectory: SelectOption, index) => (
            <div
              key={`option-item-${index}`}
              role="option"
              className="cursor-pointer px-2 py-1 hover:bg-gray-200"
              onClick={() => handleSelectOption(trajectory)}
            >
              {trajectory.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SelectAndSearchableInput;
