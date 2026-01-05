/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import React, { useEffect, useState } from 'react';
import { RdsInputText, RdsModal } from 'rte-design-system-react';
import { useTranslation } from 'react-i18next';
import KeywordsInput from '@/components/input/KeywordsInput.tsx';
import HorizonInput from '@/components/input/HorizonInput';
import { duplicateStudy, updateStudy } from '@/shared/services/studyService';
import { SelectOption, StudyDTO } from '@/shared/types';
import { useUser } from '@/store/contexts/UserContext.tsx';
import { notifyToast } from '@/shared/notification/notification';
import { validateMaxLength } from '@/shared/utils/validateMaxTextLength';
import { MAX_STUDY_NAME_LENGTH } from '@/shared/const/studyConfig';
import StdButton from '@common/base/stdButton/StdButton';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps.ts';
import { hasArrayChanged } from '@/shared/utils/arrayUtils.ts';
import ProjectInput from '@/components/input/ProjectInput.tsx';

interface StudyCreationModalProps {
  isOpen?: boolean;
  onClose: () => void;
  study: StudyDTO;
  setReloadStudies?: React.Dispatch<React.SetStateAction<number>>;
  isDuplicateMode?: boolean;
}

const StudyModificationModal: React.FC<StudyCreationModalProps> = ({
  onClose,
  study,
  setReloadStudies,
  isDuplicateMode,
}) => {
  const { t } = useTranslation();
  const { user } = useUser();
  const baseStudyName = study.name.substring(0, study.name.lastIndexOf('_'));
  const [studyName, setStudyName] = useState<string>(baseStudyName);
  const [project, setProject] = useState<SelectOption>({ id: Number(study.projectId), label: study.project });
  const [keywords, setKeywords] = useState<string[]>(study?.keywords || []);
  const [horizon, setHorizon] = useState<string>(() => {
    const rawHorizon = study?.horizon || '';
    const years = rawHorizon.match(/\d{4}/g)?.map(Number) || [];
    const maxYear = years.length ? Math.max(...years) : '';
    return maxYear.toString();
  });
  const [isFormValid, setIsFormValid] = useState(false);
  const [isHorizonValid, setIsHorizonValid] = useState(false);
  const [studyErrorMessage, setStudyErrorMessage] = useState<string>('');
  const [horizonErrorMessage, setHorizonErrorMessage] = useState<string>('');

  const resetErrorMessage = () => {
    setStudyErrorMessage('');
    setHorizonErrorMessage('');
  };

  const updateStudyHandler = async () => {
    resetErrorMessage();
    const studyData = {
      ...study,
      createdBy: user?.profile.sub,
      name: studyName,
      keywords,
      project: project.label,
      projectId: project?.id?.toString() || '',
      horizon,
    };

    try {
      isDuplicateMode ? await duplicateStudy(studyData) : await updateStudy(studyData, study.id);
      setReloadStudies?.((prev) => prev + 1);
      notifyToast({
        type: 'success',
        message: `Study ${isDuplicateMode ? 'duplicated' : 'updated'} successfully`,
      });
      onClose();
    } catch (error) {
      const errorMessages = (error as Error)?.message;
      if (errorMessages?.includes('study')) {
        setStudyErrorMessage(errorMessages);
        setIsFormValid(false);
      } else if (errorMessages?.includes('horizon')) {
        setHorizonErrorMessage(errorMessages);
      }
    }
  };

  useEffect(() => {
    const validateForm = () => {
      const studyNameChanged = studyName.trim() !== baseStudyName.trim();
      const projectNameChanged = study.project.trim() !== project?.label.trim();
      const keywordsChanged = hasArrayChanged(study.keywords, keywords);

      isDuplicateMode
        ? setIsFormValid(isHorizonValid || studyNameChanged)
        : setIsFormValid(studyNameChanged || projectNameChanged || keywordsChanged);
    };
    validateForm();
  }, [study, studyName, project, horizon, keywords, isHorizonValid, isDuplicateMode, baseStudyName]);

  const handleStudyNameChange = (value: string) => {
    resetErrorMessage();
    if (validateMaxLength(value, MAX_STUDY_NAME_LENGTH)) {
      setStudyName(value || '');
    }
  };

  return (
    <RdsModal size="small">
      <RdsModal.Title onClose={onClose}>
        {isDuplicateMode ? t('home.@duplicate_study') : t('studyModal.@update_study')}
      </RdsModal.Title>
      <RdsModal.Content>
        <div className="flex flex-col gap-4 self-stretch">
          <div className="flex justify-between gap-2">
            <div className="w-1/2">
              <RdsInputText
                label={t('modal.@input_name')}
                value={studyName}
                onChange={handleStudyNameChange}
                variant="outlined"
                placeHolder={t('studyModal.@study_creation_placeholder')}
                required
                maxLength={75}
              />
              <div
                className={`text-error-500 ${studyErrorMessage ? 'opacity-100' : 'opacity-0'} flex h-2 justify-start text-left text-body-s leading-4`}
              >
                {studyErrorMessage ?? ''}
              </div>
            </div>
            <div className="w-1/2">
              <ProjectInput value={project} onChange={setProject} required />
            </div>
          </div>
          <HorizonInput
            horizon={horizon}
            onChange={setHorizon}
            onValidChange={setIsHorizonValid}
            required
            disabled={!isDuplicateMode}
            customErrorMessage={isDuplicateMode && horizonErrorMessage ? horizonErrorMessage : ''}
          />
          <KeywordsInput
            keywords={keywords}
            setKeywords={setKeywords}
            maxNbKeywords={6}
            maxNbCharacters={15}
            minNbCharacters={1}
          />
        </div>
      </RdsModal.Content>
      <RdsModal.Footer>
        <StdButton label={t('components.quickAccess.@cancel')} onClick={onClose} color="secondary" />
        <StdButton
          icon={isDuplicateMode ? StdIconId.ContentCopy : StdIconId.Edit}
          label={isDuplicateMode ? t('study.@duplicate') : t('modal.@button_update')}
          onClick={() => void updateStudyHandler()}
          variant="contained"
          color="primary"
          disabled={!isFormValid}
        />
      </RdsModal.Footer>
    </RdsModal>
  );
};

export default StudyModificationModal;
