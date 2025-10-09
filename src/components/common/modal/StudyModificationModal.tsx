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
import ProjectInput from '@/components/input/ProjectInput.tsx';
import { duplicateStudy, updateStudy } from '@/shared/services/studyService';
import { StudyDTO } from '@/shared/types';
import { useUser } from '@/store/contexts/UserContext.tsx';
import { notifyToast } from '@/shared/notification/notification';
import { validateMaxLength } from '@/shared/utils/validateMaxTextLength';
import { MAX_STUDY_NAME_LENGTH } from '@/shared/const/studyConfig';
import StdButton from '@common/base/stdButton/StdButton';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps.ts';
import { hasArrayChanged } from '@/shared/utils/arrayUtils.ts';

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
  const [studyName, setStudyName] = useState<string>(study?.name.substring(0, study?.name.lastIndexOf('_')) || '');
  const [projectName, setProjectName] = useState<string>(study?.project || '');
  const [keywords, setKeywords] = useState<string[]>(study?.keywords || []);
  const [horizon, setHorizon] = useState<string>(() => {
    const rawHorizon = study?.horizon || '';
    const years = rawHorizon.match(/\d{4}/g)?.map(Number) || [];
    const maxYear = years.length ? Math.max(...years) : '';
    return maxYear.toString();
  });
  const [isFormValid, setIsFormValid] = useState(false);
  const [isHorizonValid, setIsHorizonValid] = useState(false);
  const [duplicateErrorMessage, setDuplicateErrorMessage] = useState<string>('');

  const updateStudyHandler = async () => {
    setDuplicateErrorMessage('');

    const studyData = {
      ...study,
      createdBy: user?.profile.sub,
      name: studyName,
      keywords,
      project: projectName,
      horizon,
    };

    try {
      isDuplicateMode ? await duplicateStudy(studyData) : await updateStudy(studyData, study.id);
      setReloadStudies?.((prev) => prev + 1); // Trigger reload after successful save
      notifyToast({
        type: 'success',
        message: `Study ${isDuplicateMode ? 'duplicated' : 'updated'} successfully`,
      });
      onClose();
    } catch (error) {
      let errorMsg = (error as Error).message;
      errorMsg = errorMsg.replace(/:\s+/g, ': ');
      isDuplicateMode && setDuplicateErrorMessage(errorMsg);
    }
  };

  useEffect(() => {
    const validateForm = () => {
      const originalName = study?.name.substring(0, study?.name.lastIndexOf('_')) || '';
      const studyNameChanged = studyName.trim() !== originalName.trim();
      const projectNameChanged = study.project.trim() !== projectName.trim();
      const heywordsChanged = hasArrayChanged(study.keywords, keywords);

      if (isDuplicateMode) {
        if (isHorizonValid || studyNameChanged) {
          setIsFormValid(true);
        } else {
          setIsFormValid(false);
        }
      } else {
        if (studyNameChanged || projectNameChanged || heywordsChanged) {
          setIsFormValid(true);
        } else {
          setIsFormValid(false);
        }
      }
    };
    validateForm();
  }, [study, studyName, projectName, horizon, keywords, isHorizonValid, isDuplicateMode]);

  const handleStudyNameChange = (value: string) => {
    if (validateMaxLength(value, MAX_STUDY_NAME_LENGTH)) {
      setStudyName(value || '');
      isDuplicateMode && setDuplicateErrorMessage('');
    }
  };

  const handleHorizonChange = (value: string) => {
    setHorizon(value);
    isDuplicateMode && setDuplicateErrorMessage('');
  };

  const handleHorizonValidityChange = (valid: boolean) => {
    setIsHorizonValid(valid);
  };

  const handleProjectNameChange = (value: string) => {
    setProjectName(value);
    isDuplicateMode && setDuplicateErrorMessage('');
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
                label={t('studyModal.@input_name')}
                value={studyName}
                onChange={handleStudyNameChange}
                variant="outlined"
                placeHolder={t('studyModal.@study_creation_placeholder')}
                required
                maxLength={75}
              />
            </div>
            <div className="w-1/2">
              <ProjectInput value={projectName} onChange={handleProjectNameChange} required />
            </div>
          </div>
          <HorizonInput
            horizon={horizon}
            onChange={handleHorizonChange}
            onValidChange={handleHorizonValidityChange}
            required
            customErrorMessage={isDuplicateMode ? duplicateErrorMessage : undefined}
            disabled={!isDuplicateMode}
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
          label={isDuplicateMode ? t('study.@duplicate') : t('studyModal.@button_edit')}
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
