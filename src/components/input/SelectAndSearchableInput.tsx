/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useCallback, useState } from 'react';
import { Dropdown, DropdownItem, IconButton, TextInput } from '@design-system-rte/react';
import { DropdownItemOption } from '@/shared/types';

interface ProjectManagerProps {
  onSelect: (value: DropdownItemOption) => void;
  setSearchTerm?: (value?: string) => Promise<DropdownItemOption[] | undefined>;
  isSearchable?: boolean;
  isInputDisabled?: boolean;
  resetField?: () => void;
  options?: DropdownItemOption[];
  required?: boolean;
  errorMessage?: string;
  defaultValue?: string;
  label?: string;
  defaultPlaceHolder?: string;
  dropdownWidth?: number;
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
  dropdownWidth
}: ProjectManagerProps) => {
  const [defaultOptions] = useState<DropdownItemOption[] | undefined>(options);
  const [optionsSelection, setOptionsSelection] = useState<DropdownItemOption[] | undefined>(options ?? []);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSelectEnable, setIsSelectEnable] = useState(true);
  const [valueInput, setValueInput] = useState(defaultValue ?? '');

  const handleInputChange = useCallback(
    async (value: string) => {
      try {
        if (value) {
          setValueInput(value);
          setIsSelectEnable(false);
          const results = await setSearchTerm?.(value);
          if (results && results.length > 0) {
            setOptionsSelection(results);
            setIsDropdownOpen(true);
          } else {
            setOptionsSelection([]);
            setIsDropdownOpen(false);
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
    (value: DropdownItemOption) => {
      value?.label && setValueInput(value?.label);
      onSelect(value);
      setIsDropdownOpen(false);
    },
    [onSelect],
  );

  const handleClickOnKeyboard = useCallback(
    async () => {
      try {
        if (isDropdownOpen) {
            setIsDropdownOpen(false);
        } else {
          const results = await setSearchTerm?.();
          if (results && results.length > 0) {
            setOptionsSelection(results);
            setIsDropdownOpen(true);
          } else {
            setOptionsSelection([]);
            setIsDropdownOpen(false);
          }
        }
      } catch {
        // Silent handler
      }
    },
    [isDropdownOpen, setSearchTerm],
  );

  return (
    <div className="relative w-full">
      <Dropdown
        dropdownId="card-options"
        onClose={() => setIsDropdownOpen(false)}
        style={{width: dropdownWidth != null ? `${dropdownWidth}px` : '250px'}}
        hasMaxWidth={!dropdownWidth}
        maxHeight={400}
        trigger={
          <div className="flex">
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
              placeholder={defaultPlaceHolder}
            />
            <div className="absolute right-1 top-0.5">
              {isSelectEnable && !valueInput && (
                <IconButton
                  name={isDropdownOpen ? 'arrow-chevron-down' : 'arrow-chevron-right'}
                  size="s"
                  variant="text"
                  onClick={() => void handleClickOnKeyboard()}
                  disabled={!isSelectEnable || isInputDisabled}
                />
              )}
            </div>
          </div>
        }
        isOpen={isDropdownOpen}
        autofocus={false}
      >
        {optionsSelection?.map(option => (<DropdownItem key={option.label} {...option} onClick={() => handleSelectOption(option)}/>))}
      </Dropdown>
      {errorMessage && <div className="text-red-500 mt-2">{errorMessage}</div>}
    </div>
  );
};

export default SelectAndSearchableInput;
