/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import React, { useState } from 'react';
import { RdsModal } from 'rte-design-system-react';
import { useTranslation } from 'react-i18next';
import KeywordsInput from '@/components/input/KeywordsInput.tsx';
import { StudyDTO } from '@/shared/types';
import { useUser } from '@/store/contexts/UserContext.tsx';
import { notifyToast } from '@/shared/notification/notification';
import {
  MAX_HORIZON_NUMBER,
  MAX_KEYWORD_LENGTH,
  MAX_KEYWORD_NUMBER,
  MAX_STUDY_NAME_LENGTH,
} from '@/shared/const/studyConfig';
import { Button, TextInput } from '@design-system-rte/react';
import { FieldInFormation } from '@common/base/FieldInFormation.tsx';
import { validateHorizon } from '@/shared/utils/validateFormInput.ts';
import { useStudyCreation } from '@/hooks/useStudyCreation.ts';

interface StudyCreationModalProps {
  isOpen?: boolean;
  onClose: () => void;
  study?: StudyDTO | null;
  setReloadStudies: React.Dispatch<React.SetStateAction<number>>;
  projectInfoName: string;
}

const StudyCreationModal: React.FC<StudyCreationModalProps> = ({
  onClose,
  study,
  setReloadStudies,
  projectInfoName,
}) => {
  const { t } = useTranslation();
  const [trajectoryIds] = useState<number[]>([]);
  const { user } = useUser();
  const [studyName, setStudyName] = useState<string>('');
  const [nameError, setNameError] = useState<string>('');
  const [horizon, setHorizon] = useState<string>('');
  const [horizonError, setHorizonError] = useState<string>('');
  const [keywords, setKeywords] = useState<string[]>([]);

  const resetFields = () => {
    setStudyName('');
    setHorizon('');
    setKeywords([]);
  };

  const { confirmCreation } = useStudyCreation(
    () => {
      setReloadStudies((prev) => prev + 1);
      resetFields();
      notifyToast({
        type: 'success',
        message: 'Study created successfully',
      });
      onClose();
    },
    (message) => setNameError(message),
  );

  const validFormInputs = () => {
    // Name
    let isNameValid = true;
    if (studyName?.length === 0 || !studyName?.trim()) {
      setNameError(t('studyModal.@requiredStudy'));
      isNameValid = false;
    }
    // Horizon
    const isHorizonValid = validateHorizon(setHorizonError, t, horizon, true);
    return isNameValid && isHorizonValid;
  };

  return (
    <RdsModal size="small">
      <RdsModal.Title onClose={onClose}>{t('studyModal.@new_study')}</RdsModal.Title>
      <RdsModal.Content>
        <div className="flex w-full flex-col gap-4 self-stretch">
          <div className="flex flex-col items-start justify-start gap-4">
            <FieldInFormation />
            <TextInput
              id="text-input-study-create-name"
              label={t('modal.@input_name')}
              value={studyName}
              onChange={(value: string) => {
                nameError && setNameError('');
                setStudyName(value ?? '');
              }}
              required
              maxLength={MAX_STUDY_NAME_LENGTH}
              showCounter={true}
              error={!!nameError}
              assistiveTextLabel={nameError}
              assistiveAppearance="error"
              rightIconAction="clean"
            />
          </div>
          <TextInput
            id="text-input-horizon"
            label={t('home.@horizon')}
            value={horizon}
            required
            onChange={(value: string) => {
              horizonError && setHorizonError('');
              setHorizon(value ?? '');
            }}
            onBlur={() => validateHorizon(setHorizonError, t, horizon, false)}
            maxLength={MAX_HORIZON_NUMBER}
            showCounter={true}
            error={!!horizonError}
            assistiveTextLabel={horizonError || t('components.horizonInput.@assistiveTextForYear')}
            assistiveAppearance={horizonError ? 'error' : 'description'}
          />
          <KeywordsInput
            keywords={keywords}
            setKeywords={setKeywords}
            maxNbKeywords={MAX_KEYWORD_NUMBER}
            maxNbCharacters={MAX_KEYWORD_LENGTH}
            minNbCharacters={1}
          />
        </div>
      </RdsModal.Content>
      <RdsModal.Footer>
        <Button label={t('components.quickAccess.@cancel')} onClick={onClose} variant="text" />
        <Button
          icon="add"
          label={t('modal.@button_create')}
          onClick={() => {
            if (validFormInputs()) {
              const studyData = {
                id: study?.id,
                name: studyName,
                createdBy: user?.profile.sub,
                keywords,
                project: projectInfoName,
                horizon,
                trajectoryIds,
                studyId: study?.id,
              };
              void confirmCreation(studyData);
            }
          }}
          variant="primary"
        />
      </RdsModal.Footer>
    </RdsModal>
  );
};

export default StudyCreationModal;
