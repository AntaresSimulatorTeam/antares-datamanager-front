import { Dispatch, SetStateAction } from 'react';
import { TFunction } from 'i18next';
import { hasArrayChanged } from '@/shared/utils/arrayUtils.ts';
import { StudyDTO } from '@/shared/types';

/**
 * Validate a string with a maxLength parameter
 * @param {string} text - text to be validated
 * @param {number} maxLength - maximum number of characters
 * @returns {boolean} - true if maximum number is respected
 */
export const validateMaxLength = (text: string, maxLength: number): boolean => {
  const trimmedText = text.trim();
  return trimmedText.length <= maxLength;
};

export const validateHorizon = (
  setErrorMessage: Dispatch<SetStateAction<string>>,
  t: TFunction<'translation', undefined>,
  value?: string,
  requiredField?: boolean,
  onChangeValidate?: (isValid: boolean) => void,
): boolean => {
  if (!value || value.trim() === '') {
    if (requiredField) {
      setErrorMessage(t('horizonInput.@requiredHorizon'));
      onChangeValidate?.(false);
      return false;
    } else {
      setErrorMessage('');
      onChangeValidate?.(true);
      return true;
    }
  }

  const trimmedValue = value.trim();

  if (!/^\d{4}$/.test(trimmedValue)) {
    setErrorMessage(t('horizonInput.@validYearError'));
    onChangeValidate?.(false);
    return false;
  }

  const numeric = Number(trimmedValue);

  if (Number.isNaN(numeric) || numeric < 2000 || numeric > 9999) {
    setErrorMessage(t('horizonInput.@validYearError'));
    onChangeValidate?.(false);
    return false;
  }

  setErrorMessage('');
  onChangeValidate?.(true);
  return true;
};

export const getStudyName = (studyName: string): string => studyName.substring(0, studyName.lastIndexOf('_'));

export const validateFormInputs = (
  isDuplication: boolean,
  study: StudyDTO,
  nameValue: string,
  projectValue: string,
  keywords: string[],
  horizon: string,
  setHorizonError: Dispatch<SetStateAction<string>>,
  t: TFunction<'translation', undefined>,
) => {
  const studyNameChanged = nameValue.trim() !== getStudyName(study.name);
  const projectNameChanged = study.project.trim() !== projectValue.trim();
  const keywordsChanged = hasArrayChanged(study.keywords, keywords);
  const isHorizonValid = isDuplication ? validateHorizon(setHorizonError, t, horizon, true) : true;

  return isDuplication
    ? studyNameChanged || isHorizonValid || !!projectValue
    : studyNameChanged || projectNameChanged || keywordsChanged;
};
