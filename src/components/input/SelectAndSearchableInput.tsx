/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useRef, useState } from 'react';
import { RdsButton, RdsIconId, RdsInputText } from 'rte-design-system-react';
import { useTranslation } from 'react-i18next';

interface ProjectManagerProps {
  options: SelectOption[] | undefined;
  defaultPlaceHolder: string;
  onSelect: (value: SelectOption) => void;
  setSearchTerm?: (value: string | undefined) => Promise<SelectOption[] | undefined>;
  isSearchable?: boolean;
  isInputDisabled?: boolean;
  resetField?: () => void;
}

const SelectAndSearchableInput = ({
  options,
  defaultPlaceHolder,
  onSelect,
  setSearchTerm,
  isSearchable = false,
  isInputDisabled = false,
  resetField,
}: ProjectManagerProps) => {
  const [defaultOptions] = useState<SelectOption[] | undefined>(options);
  const [optionsSelection, setOptionsSelection] = useState<SelectOption[] | undefined>(options);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [isSelectEnable, setIsSelectEnable] = useState<boolean>(true);
  const [isSearchableEnable, setIsSearchableEnable] = useState<boolean>(false);
  const [placeHolder] = useState<string>(defaultPlaceHolder);
  const [valueInput, setValueInput] = useState<string>('');
  const dropdownList = useRef<HTMLDivElement | null>(null);
  const { t } = useTranslation();

  const handleInputChange = async (value: string) => {
    try {
      if (value) {
        setValueInput(value);
        setIsDropdownOpen(false);
        setIsSelectEnable(false);
        setIsSearchableEnable(true);
        await setSearchTerm?.(value).then((results) => {
          if (results && results.length > 0) {
            setOptionsSelection(results);
          } else {
            setOptionsSelection([]);
          }
        });
      } else {
        setValueInput('');
        setIsSelectEnable(true);
        setIsSearchableEnable(false);
        setIsDropdownOpen(false);
        setOptionsSelection(defaultOptions);
      }
    } catch {
      // silent handler
    }
  };

  const handleSelectOption = (value: SelectOption) => {
    setValueInput(value?.label);
    onSelect(value);
    setIsDropdownOpen(false);
  };

  return (
    <div className="relative">
      <div className="absolute right-0 top-3">
        {isSearchableEnable && isSearchable && (
          <RdsButton
            icon={RdsIconId.Search}
            size="extraSmall"
            variant="text"
            onClick={(e) => {
              setIsDropdownOpen(true);
              e.stopPropagation();
            }}
            color="secondary"
            disabled={!isSearchableEnable}
          />
        )}
        {isSelectEnable && (
          <RdsButton
            icon={!isDropdownOpen ? RdsIconId.KeyboardArrowRight : RdsIconId.KeyboardArrowDown}
            size="extraSmall"
            variant="text"
            onClick={(e) => {
              setIsDropdownOpen((prev) => !prev);
              setTimeout(() => {
                dropdownList.current?.focus();
              }, 0);
              e.stopPropagation();
            }}
            color="secondary"
            disabled={!isSelectEnable}
          />
        )}
      </div>
      <RdsInputText
        onChange={(e) => {
          if (isSearchable) {
            void handleInputChange(e);
          } else {
            resetField?.();
            setValueInput('');
            setIsDropdownOpen(false);
          }
        }}
        placeHolder={!options?.length ? t('components.selectAnsSearchInput.@emptyList') : placeHolder}
        variant="outlined"
        value={valueInput}
        disabled={isInputDisabled}
      />
      {isDropdownOpen && optionsSelection && optionsSelection?.length > 0 && (
        <div
          className="absolute left-0 top-7 z-50 max-h-14 w-full overflow-y-auto rounded border border-gray-300 bg-gray-w shadow-2 outline-none"
          onMouseDown={(e) => e.preventDefault()}
          ref={dropdownList}
          tabIndex={0}
          onBlur={() => setIsDropdownOpen(false)}
        >
          {optionsSelection.map((trajectory, index) => (
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
