/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useState } from 'react';
import { RdsButton, RdsIcon, RdsIconId, RdsInputText } from 'rte-design-system-react';
import { fetchSuggestedKeywords } from '@/pages/pegase/home/components/studyService';

const MAX_KEYWORDS = 6;

interface KeywordsInputProps {
  keywords: string[];
  setKeywords: React.Dispatch<React.SetStateAction<string[]>>;
}

const KeywordsInput: React.FC<KeywordsInputProps> = ({ keywords, setKeywords }) => {
  const [keywordInput, setKeywordInput] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [suggestedKeywords, setSuggestedKeywords] = useState<string[]>([]);

  const handleKeywordChange = async (value: string) => {
    setKeywordInput(value);
    setErrorMessage(''); // Clear error message when input changes
    try {
      const tags = await fetchSuggestedKeywords(value);
      setSuggestedKeywords(tags);
    } catch (error) {
      setErrorMessage('Failed to fetch suggested keywords');
    }
  };

  const handleAddKeyword = (suggestedKeyword = keywordInput) => {
    if (suggestedKeyword.trim()) {
      if (keywords.includes(suggestedKeyword.trim())) {
        setErrorMessage('Keyword already exists');
      } else if (suggestedKeyword.trim().length < 3 || suggestedKeyword.trim().length > 10) {
        setErrorMessage('Keyword must be between 3 and 10 characters');
      } else if (keywords.length >= MAX_KEYWORDS) {
        setErrorMessage('Cannot add more than 6 keywords');
      } else {
        setKeywords((prevKeywords) => [...prevKeywords, suggestedKeyword.trim()]);
        setKeywordInput('');
        setErrorMessage('');
      }
    }
  };

  const clearAllKeywords = () => {
    setKeywords([]);
  };

  const handleRemoveKeyword = (index: number) => {
    setKeywords((prevKeywords) => prevKeywords.filter((_, i) => i !== index));
  };

  return (
    <div className="flex w-[300px] flex-col items-start justify-center">
      <div className="relative w-full">
        <div className="flex items-center gap-4">
          <RdsInputText
            label="Keywords"
            value={keywordInput}
            onChange={handleKeywordChange}
            placeHolder="Add a keyword"
            variant="outlined"
          />
          {keywordInput && keywordInput.length >= 3 && (
            <RdsButton
              onClick={() => handleAddKeyword()}
              icon={RdsIconId.Add}
              color="secondary"
              size="extraSmall"
              variant="transparent"
            />
          )}
        </div>

        {/* Suggested Keywords Dropdown */}
        {keywordInput && (
          <div
            className="bg-white max-h-40 absolute z-10 mt-1 w-full overflow-y-auto border border-gray-300"
            style={{
              backgroundColor: 'white', // Ensure opaque background
              maxHeight: '100px', // Set max height for scrollbar
              top: '100%',
              left: 0,
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', // Optional: add shadow for better visibility
            }}
            onMouseDown={(e) => e.preventDefault()} // Prevent closing when interacting with dropdown
          >
            {suggestedKeywords.map((suggestedKeyword, index) => (
              <div
                key={index}
                className="cursor-pointer px-2 py-1 hover:bg-gray-200"
                onClick={() => handleAddKeyword(suggestedKeyword)}
              >
                {suggestedKeyword}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Error Message */}
      {errorMessage && <div className="text-red-500 mt-2">{errorMessage}</div>}

      {/* Keywords Display and Clear All Button */}
      <div className="flex flex-wrap gap-2">
        {keywords.map((keyword, index) => (
          <div key={index} className="py-0.3 flex items-center rounded bg-gray-200 px-1">
            <span>{keyword}</span>
            <RdsButton
              icon={RdsIconId.Close}
              onClick={() => handleRemoveKeyword(index)}
              size="extraSmall"
              variant="text"
              color="secondary"
            />
          </div>
        ))}
      </div>

      {/* Clear All Keywords Button */}
      {keywords.length > 0 && (
        <div className="text-sm text-secondary flex cursor-pointer items-center gap-1" onClick={clearAllKeywords}>
          <RdsIcon name={RdsIconId.InkEraser} color="secondary" />
          <span>Clear all</span>
        </div>
      )}
    </div>
  );
};

export default KeywordsInput;
