/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { Dispatch, SetStateAction, useState } from 'react';
import { fetchSuggestedKeywords } from '@/shared/services/studyService.ts';
import { clsx } from 'clsx';
import { useTranslation } from 'react-i18next';
import StdButton from '@common/base/stdButton/StdButton';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps.ts';
import StdInputText from '@/components/forms/stdInputText/StdInputText.tsx';
import { ERROR_CLASSES, HELPER_CLASSES } from '@/components/forms/stdInputText/textClassBuilder.ts';
import { validateMaxLength } from '@/shared/utils/validateMaxTextLength.ts';

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
    <div className={clsx(width ?? 'w-full', 'flex min-h-22 flex-col items-start justify-start gap-1')}>
      <div className="inline-flex items-end justify-start gap-2">
        <div className="relative flex w-full flex-col items-start">
          <StdInputText
            label={t('home.@keywords')}
            value={keywordInput}
            onChange={handleKeywordChange}
            placeHolder={t('')}
            variant="outlined"
            maxLength={maxNbCharacters}
            error={!!errorMessage}
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
            <StdButton
              onClick={() => handleAddKeyword()}
              icon={StdIconId.Add}
              color="secondary"
              size="extraSmall"
              variant="transparent"
            />
          )}
        </div>
        <span className={clsx(HELPER_CLASSES, !!errorMessage && ERROR_CLASSES.text)}>{errorMessage}</span>
      </div>

      {/* Keywords Display and Clear All Button */}
      <div className="flex flex-wrap gap-2">
        {keywords.map((keyword, index) => (
          <div key={index} className="flex items-center gap-2 rounded bg-gray-200 px-1">
            <span>{keyword}</span>
            <StdButton
              icon={StdIconId.Close}
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
        <StdButton
          label={t('projectModal.@keyword_button_clear')}
          icon={StdIconId.InkEraser}
          onClick={clearAllKeywords}
          variant="text"
          color="secondary"
        />
      )}
    </div>
  );
};

export default KeywordsInput;
