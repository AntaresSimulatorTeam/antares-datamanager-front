/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import React, { useState } from 'react';
import { RdsButton, RdsIconId, RdsInputText } from 'rte-design-system-react';

interface YearDropdownProps {
  value: string;
  onChange: (value: string) => void;
  required: boolean;
}

const generateYears = (startYear: number, endYear: number): number[] => {
  const years = [];
  for (let year = startYear; year <= endYear; year++) {
    years.push(year);
  }
  return years;
};

const HorizonInput: React.FC<YearDropdownProps> = ({ value, onChange, required = false }) => {
  const [isOpen, setIsOpen] = useState(false); // State to control dropdown visibility
  const [errorMessage, setErrorMessage] = useState<string>(''); // State for error message

  const currentYear = new Date().getFullYear();
  const years = generateYears(currentYear, 2050);

  const toggleDropdown = () => {
    setIsOpen(!isOpen); // Toggle dropdown visibility
  };

  const handleBlur = () => {
    // If the entered value is not in the list, show an error and clear it
    if (!years.includes(parseInt(value))) {
      setErrorMessage('Veuillez choisir une date valide.');
      onChange('');
    } else {
      setErrorMessage(''); // Clear error if the value is valid
    }
  };

  return (
    <div className="relative flex w-[320px] flex-col">
      {/* Container for input and button */}
      <div className="flex w-full items-center">
        {/* Input field */}
        <RdsInputText
          label="Horizon"
          value={value}
          onChange={(t) => {
            onChange(t || '');
            setErrorMessage(''); // Clear error message on input change
          }}
          onBlur={handleBlur} // Validate input on blur
          placeHolder="Select a horizon"
          variant="outlined"
          required={required}
        />

        {/* Toggle Button */}
        <RdsButton
          icon={RdsIconId.KeyboardArrowDown}
          onClick={toggleDropdown}
          size="small"
          variant="text"
          color="secondary"
        />
      </div>

      {/* Error Message */}
      {errorMessage && <div className="text-red-500 text-sm mt-1">{errorMessage}</div>}

      {/* Dropdown list */}
      {isOpen && (
        <div
          className="bg-white max-h-40 absolute z-10 mt-1 w-full overflow-y-auto border border-gray-300"
          style={{
            backgroundColor: 'white', // Ensure opaque background
            maxHeight: '100px',
            top: '100%',
            left: 0,
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', // Optional: add shadow for better visibility
          }}
          onMouseDown={(e) => e.preventDefault()} // Prevent dropdown from closing when clicking inside
        >
          {years.map((year, index) => (
            <div
              key={index}
              className="cursor-pointer px-2 py-1 hover:bg-gray-200"
              onClick={() => {
                onChange(year.toString());
                setIsOpen(false); // Close the dropdown on selection
                setErrorMessage(''); // Clear error on valid selection
              }}
            >
              {year}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HorizonInput;
