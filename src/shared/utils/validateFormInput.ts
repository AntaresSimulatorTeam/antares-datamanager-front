import { Dispatch, SetStateAction } from 'react';
import { TFunction } from 'i18next';
import { hasArrayChanged } from '@/shared/utils/arrayUtils.ts';
import { StudyDTO } from '@/shared/types';
import { getStudyName, validateHorizon, validateName } from '@/shared/utils/textUtils.ts';

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

export const validateNameAndHorizonInputs = (
  name: string,
  horizon: string,
  setNameError: Dispatch<SetStateAction<string>>,
  setHorizonError: Dispatch<SetStateAction<string>>,
  t: TFunction<'translation', undefined>,
) => {
  const isNameValid = validateName(name, setNameError, t('studyModal.@requiredStudy'));
  const isHorizonValid = validateHorizon(setHorizonError, t, horizon, true);
  return isNameValid && isHorizonValid;
};

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
