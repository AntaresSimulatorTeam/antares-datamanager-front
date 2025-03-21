/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { Dispatch, SetStateAction, useState } from 'react';
import { RdsButton, RdsIcon, RdsIconId, RdsInputText } from 'rte-design-system-react';
import { fetchSuggestedKeywords } from '@/shared/services/studyService.ts';
import { clsx } from 'clsx';
import { useTranslation } from 'react-i18next';

interface KeywordsInputProps {
  keywords: string[];
  setKeywords: Dispatch<SetStateAction<string[]>>;
  maxNbKeywords?: number;
  maxNbCharacters?: number;
  minNbCharacters?: number;
  width?: string;
}

const KeywordsInput = ({
  keywords,
  setKeywords,
  maxNbKeywords,
  maxNbCharacters,
  minNbCharacters,
  width,
}: KeywordsInputProps) => {
  const { t } = useTranslation();
  const [keywordInput, setKeywordInput] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [suggestedKeywords, setSuggestedKeywords] = useState<string[]>([]);

  const handleKeywordChange = async (value: string) => {
    if (maxNbCharacters !== undefined && value.length > maxNbCharacters) {
      return;
    }
    setKeywordInput(value);
    setErrorMessage(''); // Clear error message when input changes
    try {
      const tags = (await fetchSuggestedKeywords(value)) as string[];
      setSuggestedKeywords(tags);
    } catch (error) {
      setErrorMessage('Failed to fetch suggested keywords');
    }
  };

  const handleAddKeyword = (suggestedKeyword = keywordInput) => {
    if (suggestedKeyword.trim()) {
      if (keywords?.includes(suggestedKeyword.trim())) {
        setErrorMessage(t('projectModal.@keyword_already_exists'));
      } else if (
        minNbCharacters &&
        maxNbCharacters &&
        (suggestedKeyword.trim().length < minNbCharacters || suggestedKeyword.trim().length > maxNbCharacters)
      ) {
        setErrorMessage(t('projectModal.@keyword_length_error', { min: minNbCharacters, max: maxNbCharacters }));
      } else if (minNbCharacters && !maxNbCharacters && suggestedKeyword.trim().length < minNbCharacters) {
        setErrorMessage(t('projectModal.@keyword_minimum_error', { min: minNbCharacters }));
      } else if (!minNbCharacters && maxNbCharacters && suggestedKeyword.trim().length > maxNbCharacters) {
        setErrorMessage(t('projectModal.@keyword_maximum_error', { max: maxNbCharacters }));
      } else if (maxNbKeywords && keywords?.length >= maxNbKeywords) {
        setErrorMessage(t('projectModal.@keyword_max_keys_errors', { maxNbKey: maxNbKeywords }));
      } else {
        setKeywords((prevKeywords) => [...prevKeywords, suggestedKeyword.trim()]);
        setKeywordInput('');
        setErrorMessage('');
      }
    }
  };

  const clearAllKeywords = () => {
    setKeywords([]);
    setErrorMessage('');
    setKeywordInput('');
  };

  const handleRemoveKeyword = (index: number) => {
    setKeywords((prevKeywords) => prevKeywords.filter((_, i) => i !== index));
    if (maxNbKeywords && keywords.length === maxNbKeywords) {
      setErrorMessage('');
    }
  };

  const shouldAddKeywordButton = (input: string): boolean => {
    if (!input) {
      return false;
    } else {
      if (minNbCharacters && !maxNbCharacters) {
        return input.length >= minNbCharacters;
      } else if (minNbCharacters && maxNbCharacters) {
        return input.length >= minNbCharacters && input.length <= maxNbCharacters;
      }
    }
    return false;
  };

  return (
    <div className={clsx(width ?? 'w-full', 'flex min-h-18 flex-col items-start justify-start')}>
      <div className="relative flex w-full">
        <div className="flex w-full items-center gap-2">
          <div className="max-w-3/4 flex">
            <RdsInputText
              label="Keywords"
              value={keywordInput}
              onChange={handleKeywordChange}
              placeHolder="Add a keyword"
              variant="outlined"
              maxLength={maxNbCharacters}
            />
          </div>
          {shouldAddKeywordButton(keywordInput) && (
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
        {keywordInput && suggestedKeywords.length > 0 && (
          <div
            className="bg-white max-h-40 absolute z-10 w-full overflow-y-auto border border-gray-300"
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
      {errorMessage && <div className="my-2 text-error-500">{errorMessage}</div>}

      {/* Keywords Display and Clear All Button */}
      <div className="flex flex-wrap gap-2">
        {keywords.map((keyword, index) => (
          <div key={index} className="py-0.3 flex items-center gap-2 rounded bg-gray-200 px-1">
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
      {keywords?.length > 0 && (
        <div className="text-sm text-secondary mt-1 flex cursor-pointer items-center gap-1" onClick={clearAllKeywords}>
          <RdsIcon name={RdsIconId.InkEraser} color="secondary" />
          <span>Clear all</span>
        </div>
      )}
    </div>
  );
};

export default KeywordsInput;
