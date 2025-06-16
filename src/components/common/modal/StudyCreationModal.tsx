/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import React, { useEffect, useState } from 'react';
import { RdsButton, RdsIconId, RdsInputText, RdsModal } from 'rte-design-system-react';
import { useTranslation } from 'react-i18next';
import KeywordsInput from '@/components/input/KeywordsInput.tsx';
import HorizonInput from '@/components/input/HorizonInput';
import ProjectInput from '@/components/input/ProjectInput.tsx';
import { saveStudy } from '@/shared/services/studyService';
import { StudyDTO } from '@/shared/types';
import { useUser } from '@/store/contexts/UserContext.tsx';
import { notifyToast } from '@/shared/notification/notification';
import { validateMaxLength } from '@/shared/utils/validateMaxTextLength';
import { MAX_STUDY_NAME_LENGTH } from '@/shared/const/studyConfig';

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
  const [studyName, setStudyName] = useState<string>(study?.name || '');
  const [projectName, setProjectName] = useState<string>(study?.project || projectInfoName || '');
  const [keywords, setKeywords] = useState<string[]>(study?.keywords || []);
  const [trajectoryIds] = useState<number[]>(study?.trajectoryIds || []);
  const [isFormValid, setIsFormValid] = useState(false);
  const { user } = useUser();
  const [isHorizonValid, setIsHorizonValid] = useState(false);

  const [horizon, setHorizon] = useState<string>(() => {
    const rawHorizon = study?.horizon || '';
    const years = rawHorizon.match(/\d{4}/g)?.map(Number) || [];
    const maxYear = years.length ? Math.max(...years) : '';
    return maxYear.toString();
  });

  const handleStudyNameChange = (value: string) => {
    if (validateMaxLength(value, MAX_STUDY_NAME_LENGTH)) {
      setStudyName(value || '');
    }
  };

  const saveStudyHandler = async () => {
    if (study && studyName.trim() === study.name.trim()) {
      notifyToast({
        type: 'error',
        message: 'A study with the same name already exists for the given project',
      });
      return;
    }
    const studyData = {
      name: studyName,
      createdBy: user?.profile.sub,
      keywords,
      project: projectName,
      horizon,
      trajectoryIds,
    };

    try {
      await saveStudy(studyData);
      setReloadStudies((prev) => !prev); // Trigger reload after successful save
      setStudyName('');
      setProjectName('');
      setHorizon('');
      setKeywords([]);
      onClose();
    } catch {
      // Modal remains open if error occurred
    }
  };

  useEffect(() => {
    const validateForm = () => {
      const isDuplicateMode = Boolean(study);
      const originalName = study?.name || '';
      const nameChanged = studyName.trim() !== originalName.trim();

      if (isDuplicateMode) {
        if (isHorizonValid || nameChanged) {
          setIsFormValid(true);
        } else {
          setIsFormValid(false);
        }
      } else {
        if (studyName && projectName && horizon && isHorizonValid) {
          setIsFormValid(true);
        } else {
          setIsFormValid(false);
        }
      }
    };
    validateForm();
  }, [study, studyName, projectName, horizon, keywords, isHorizonValid]);



  const handleHorizonChange = (value: string) => {
    setHorizon(value);
  };

  const handleHorizonValidityChange = (valid: boolean) => {
    setIsHorizonValid(valid);
  };

  return (
    <RdsModal size="small">
      <RdsModal.Title onClose={onClose}>
        {study ? t('home.@duplicate_study') : t('studyModal.@new_study')}
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
            {study && (
              <div className="w-1/2">
                <ProjectInput value={projectName} onChange={setProjectName} required />
              </div>
            )}
          </div>
          <HorizonInput
            horizon={horizon}
            onChange={handleHorizonChange}
            onValidChange={handleHorizonValidityChange}
            required
          />
          <KeywordsInput
            keywords={keywords}
            setKeywords={setKeywords}
            maxNbKeywords={6}
            maxNbCharacters={15}
            minNbCharacters={3}
          />
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
