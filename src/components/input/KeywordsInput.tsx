/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { Dispatch, SetStateAction, useState } from 'react';
import { fetchSuggestedKeywords } from '@/shared/services/studyService.ts';
import { clsx } from 'clsx';
import { useTranslation } from 'react-i18next';
import { validateMaxLength } from '@/shared/utils/validateMaxTextLength.ts';
import { Button, IconButton, TextInput } from '@design-system-rte/react';

interface KeywordsInputProps {
  keywords: string[];
  setKeywords: Dispatch<SetStateAction<string[]>>;
  maxNbKeywords?: number;
  maxNbCharacters?: number;
  minNbCharacters?: number;
  width?: string;
  required?: boolean;
}

const KeywordsInput = ({
  keywords,
  setKeywords,
  maxNbKeywords,
  maxNbCharacters,
  minNbCharacters,
  width,
  required = false,
}: KeywordsInputProps) => {
  const { t } = useTranslation();
  const [keywordInput, setKeywordInput] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [suggestedKeywords, setSuggestedKeywords] = useState<string[]>([]);

  const handleKeywordChange = async (value: string) => {
    if (!value) {
      errorMessage && setErrorMessage('');
      setKeywordInput(value);
    } else if (value) {
      if (maxNbCharacters != null && value?.length > maxNbCharacters) {
        if (validateMaxLength(value, maxNbCharacters + 1)) {
          setErrorMessage(t('modal.@number_characters_exceeds'));
          setKeywordInput(value);
        } else {
          return;
        }
      } else {
        errorMessage && setErrorMessage('');
        setKeywordInput(value);
        try {
          const tags = await fetchSuggestedKeywords(value);
          setSuggestedKeywords(tags);
        } catch {
          setErrorMessage('Failed to fetch suggested keywords');
        }
      }
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
    if (!input || errorMessage) {
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
    <div className={clsx(width ?? 'w-full', 'flex min-h-22 flex-col items-start justify-start gap-4')}>
      <div className="inline-flex items-end gap-1">
        <div className="relative flex w-full flex-col items-start gap-2">
          <TextInput
            id="text-input-keywords"
            label={t('home.@keywords')}
            aria-required
            assistiveAppearance="error"
            autoComplete="off"
            error={!!errorMessage}
            labelPosition="top"
            rightIconAction="clean"
            onChange={(value: string) => void handleKeywordChange(value)}
            value={keywordInput}
            assistiveTextLabel={errorMessage}
            maxLength={maxNbCharacters}
            showCounter
            required={required}
          />
          {/* Suggested Keywords Dropdown */}
          {keywordInput && !errorMessage && suggestedKeywords.length > 0 && (
            <div
              className="absolute left-0 top-7 z-50 max-h-14 w-full overflow-y-auto rounded border border-gray-300 bg-gray-w shadow-2 outline-none"
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
        <div className="mb-0.5">
          {shouldAddKeywordButton(keywordInput) && (
            <IconButton onClick={() => handleAddKeyword()} name="add" size="s" variant="text" />
          )}
        </div>
      </div>

      {/* Keywords Display and Clear All Button */}
      <div className="flex flex-col items-start justify-start gap-1">
        <div className="flex flex-wrap gap-2">
          {keywords.map((keyword, index) => (
            <div key={index} className="flex items-center gap-2 rounded bg-gray-200 px-1">
              <span>{keyword}</span>
              <IconButton name="close" onClick={() => handleRemoveKeyword(index)} size="s" variant="text" />
            </div>
          ))}
        </div>

        {/* Clear All Keywords Button */}
        {keywords?.length > 0 && (
          <Button label={t('projectModal.@keyword_button_clear')} onClick={clearAllKeywords} variant="text" />
        )}
      </div>
    </div>
  );
};

export default KeywordsInput;
