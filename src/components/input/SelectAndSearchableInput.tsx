/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useState } from 'react';
import { RdsButton, RdsIconId, RdsInputText } from 'rte-design-system-react';
import { useTranslation } from 'react-i18next';

interface ProjectManagerProps {
  options: SelectOption[] | undefined;
  defaultPlaceHolder: string;
  onSelect: (value: SelectOption) => void;
  setSearchTerm?: (value: string | undefined) => Promise<SelectOption[]>;
  isSearchable?: boolean;
}

const SelectAndSearchableInput = ({
  options,
  defaultPlaceHolder,
  onSelect,
  setSearchTerm,
  isSearchable = false,
}: ProjectManagerProps) => {
  const { t } = useTranslation();
  const [defaultOptions, _] = useState<SelectOption[] | undefined>(options);
  const [optionsSelection, setOptionsSelection] = useState<SelectOption[] | undefined>(options);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [isSelectEnable, setIsSelectEnable] = useState<boolean>(true);
  const [isSearchableEnable, setIsSearchableEnable] = useState<boolean>(false);
  const [placeHolder, setPlaceHolder] = useState<string>(defaultPlaceHolder);

  const handleInputChange = async (value: string) => {
    try {
      if (value) {
        setIsDropdownOpen(false);
        setIsSelectEnable(false);
        setIsSearchableEnable(true);
        setSearchTerm?.(value).then((results) => {
          if (results.length > 0) {
            setOptionsSelection(results);
          } else {
            setOptionsSelection([]);
          }
        });
      } else {
        setIsSelectEnable(true);
        setIsSearchableEnable(false);
        setIsDropdownOpen(false);
        setOptionsSelection(defaultOptions);
      }
    } catch {
      // silent handler
    }
  };

  const handleSelection = (selectedItem: SelectOption) => {
    if (optionsSelection?.length > 0) onSelect(selectedItem);
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
              e.stopPropagation();
            }}
            color="secondary"
            disabled={!isSelectEnable}
          />
        )}
      </div>
      <RdsInputText
        onChange={(e) => isSearchable && handleInputChange(e.target.value)}
        placeHolder={placeHolder}
        variant="outlined"
        disabled={!isSearchable}
      />
      {isDropdownOpen && optionsSelection?.length > 0 && (
        <div
          className="bg-white max-h-40 absolute z-10 w-full overflow-y-auto border border-gray-300"
          style={{
            backgroundColor: 'white',
            maxHeight: '100px',
            top: '55px',
            left: 0,
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          }}
          onMouseDown={(e) => e.preventDefault()}
        >
          {optionsSelection?.map((trajectory, index) => (
            <div
              key={index}
              className="cursor-pointer px-2 py-1 hover:bg-gray-200"
              onClick={() => handleSelection(trajectory)}
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
