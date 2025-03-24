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
    if (maxNbCharacters != null && value?.length > maxNbCharacters) {
      return;
    }
    // Remove error message when input keyword is deleted and error message (max nb or already keyword is displayed)
    const isKeywordExist = keywords?.some((keyword) => keyword == keywordInput);
    if (
      (!value && errorMessage && maxNbKeywords != null && keywords?.length < maxNbKeywords) ||
      (!value && errorMessage && isKeywordExist)
    )
      setErrorMessage('');
    setKeywordInput(value);
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
    // In case of keyword is deleted, remove error message when max nb is reached or keyword already exists
    if ((maxNbKeywords && keywords.length === maxNbKeywords) || keywordInput === keywords[index]) {
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
    <div className={clsx(width ?? 'w-full', 'flex min-h-22 flex-col items-start justify-start')}>
      <div className="relative">
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
          {/* Error Message */}
          {errorMessage && <div className="my-2 text-error-500">{errorMessage}</div>}
        </div>

        {/* Suggested Keywords Dropdown */}
        {keywordInput && !errorMessage && suggestedKeywords.length > 0 && (
          <div
            className="absolute left-0 top-8 z-50 max-h-14 w-full overflow-y-auto rounded border border-gray-300 bg-gray-w shadow-2 outline-none"
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
