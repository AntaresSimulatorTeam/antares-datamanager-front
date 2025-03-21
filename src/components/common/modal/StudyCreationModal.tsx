/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import React, { useEffect, useState } from 'react';
import { RdsButton, RdsIconId, RdsInputText, RdsModal } from 'rte-design-system-react';
import { useTranslation } from 'react-i18next';
import KeywordsInput from '@/components/input/KeywordsInput.tsx';
import HorizonInput from '@/components/input/HorizonInput.tsx';
import ProjectInput from '@/components/input/ProjectInput.tsx';
import { saveStudy } from '@/shared/services/studyService';
import { StudyDTO } from '@/shared/types';
import { useUser } from '@/store/contexts/UserContext.tsx';

interface StudyCreationModalProps {
  isOpen?: boolean;
  onClose: () => void;
  study?: StudyDTO | null;
  setReloadStudies: React.Dispatch<React.SetStateAction<boolean>>;
  projectInfoName?: string;
}

const StudyCreationModal: React.FC<StudyCreationModalProps> = ({
  onClose,
  study,
  setReloadStudies,
  projectInfoName,
}) => {
  const { t } = useTranslation();
  const [studyName, setStudyName] = useState<string>('');
  const [horizon, setHorizon] = useState<string>(study?.horizon ? study.horizon.substring(0, 4) : '');
  const [projectName, setProjectName] = useState<string>(study?.project || projectInfoName || '');
  const [keywords, setKeywords] = useState<string[]>(study?.keywords || []);
  const [trajectoryIds] = useState<number[]>(study?.trajectoryIds || []);
  const [isFormValid, setIsFormValid] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const { user } = useUser();

  const saveStudyHandler = async () => {
    const studyData = {
      name: studyName,
      createdBy: user?.profile.sub,
      keywords,
      project: projectName,
      horizon,
      trajectoryIds,
    };

    await saveStudy(studyData);
    // Clear form fields
    setReloadStudies((prev) => !prev); // Trigger reload after successful save
    setStudyName('');
    setProjectName('');
    setHorizon('');
    setKeywords([]);
    onClose();
  };

  const validateForm = () => {
    if (studyName && projectName && horizon && !errorMessage) {
      setIsFormValid(true);
    } else {
      setIsFormValid(false);
    }
  };

  useEffect(() => {
    validateForm();
  }, [studyName, projectName, horizon, keywords, errorMessage]);

  const validateHorizon = (year: string) => {
    const currentYear = new Date().getFullYear();
    const selectedYear = parseInt(year);
    if (selectedYear < currentYear) {
      setErrorMessage('Horizon must be a year greater than the current year');
    } else if (selectedYear > 2100) {
      setErrorMessage('Horizon must be a year less than or equal to 2100');
    } else {
      setErrorMessage('');
    }
  };

  const handleHorizonChange = (value: string) => {
    const numericRegex = /^[0-9]*$/;
    if (!numericRegex.test(value)) {
      setErrorMessage('Please enter a valid year');
      setHorizon('');
    } else {
      setHorizon(value);
      validateHorizon(value);
    }
  };

  return (
    <RdsModal size="small">
      <RdsModal.Title onClose={onClose}>
        {study ? t('home.@duplicate_study') : t('studyModal.@new_study')}
      </RdsModal.Title>
      <RdsModal.Content>
        <div className="flex gap-4 self-stretch">
          <div className="flex w-32 flex-col items-start justify-start">
            <RdsInputText
              label={t('studyModal.@input_name')}
              value={studyName}
              onChange={(value) => setStudyName(value || '')}
              variant="outlined"
              placeHolder={t('studyModal.@study_creation_placeholder')}
              required
            />
            <HorizonInput value={horizon} onChange={handleHorizonChange} required />
            <KeywordsInput
              keywords={keywords}
              setKeywords={setKeywords}
              maxNbKeywords={6}
              maxNbCharacters={15}
              minNbCharacters={3}
            />
          </div>
          {study && (
            <div className="flex w-32 flex-col items-start justify-start">
              <ProjectInput value={projectName} onChange={setProjectName} required />
            </div>
          )}
        </div>
      </RdsModal.Content>
      <RdsModal.Footer>
        <RdsButton label={t('components.quickAccess.@cancel')} onClick={onClose} color="secondary" />
        <RdsButton
          icon={study ? RdsIconId.ContentCopy : RdsIconId.Add}
          label={study ? t('study.@duplicate') : t('studyModal.@button_create')}
          onClick={() => void saveStudyHandler()}
          variant="contained"
          color="primary"
          disabled={!isFormValid}
        />
      </RdsModal.Footer>
    </RdsModal>
  );
};

export default StudyCreationModal;
