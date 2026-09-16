/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import KeywordsInput from '@/components/input/KeywordsInput.tsx';
import HorizonInput from '@/components/input/HorizonInput';
import { StudyDTO } from '@/shared/types';
import { notifyToast } from '@/shared/notification/notification';
import { validateMaxLength } from '@/shared/utils/validateMaxTextLength';
import {
  MAX_KEYWORD_LENGTH,
  MAX_KEYWORD_NUMBER,
  MAX_STUDY_NAME_LENGTH,
  MIN_KEYWORD_LENGTH,
} from '@/shared/const/studyConfig';
import { Button, Modal, TextInput } from '@design-system-rte/react';
import { FieldInFormation } from '@common/base/FieldInFormation.tsx';
import { useStudyCreation } from '@/hooks/useStudyCreation.ts';
import { useUser } from '@/store/contexts/UserContext.tsx';

interface StudyCreationModalProps {
  isOpen: boolean;
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
  isOpen
}) => {
  const { t } = useTranslation();
  const [studyName, setStudyName] = useState<string>('');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [horizon, setHorizon] = useState<string>('');
  const [trajectoryIds] = useState<number[]>([]);
  const [isFormValid, setIsFormValid] = useState(false);
  const [isHorizonValid, setIsHorizonValid] = useState(false);
  const [studyErrorMessage, setStudyErrorMessage] = useState<string>('');
  const { user } = useUser();

  const resetNameField = () => {
    setStudyName('');
    setStudyErrorMessage('');
  };

  const handleClose = useCallback(() => {
    setStudyErrorMessage('');
    onClose();
  }, [onClose]);

  const { confirmCreation } = useStudyCreation(
    () => {
      setReloadStudies((prev) => prev + 1);
      notifyToast({
        type: 'success',
        message: 'Study created successfully',
      });
      handleClose();
    },
    (message) => setStudyErrorMessage(message)
  );

  useEffect(() => {
    studyName && horizon && isHorizonValid ? setIsFormValid(true) : setIsFormValid(false);
  }, [studyName, horizon, isHorizonValid]);

  const handleStudyNameChange = (value: string) => {
    if (validateMaxLength(value, MAX_STUDY_NAME_LENGTH)) {
      setStudyName(value || '');
      setStudyErrorMessage('');
    } else if (value?.length === MAX_STUDY_NAME_LENGTH + 1) {
      setStudyName(value || '');
      setStudyErrorMessage(t('modal.@number_characters_exceeds'));
      setIsFormValid(false);
    }
  };

  const handleHorizonChange = (value: string) => {
    setHorizon(value);
    setStudyErrorMessage('');
  };

  const handleHorizonValidityChange = (valid: boolean) => {
    setIsHorizonValid(valid);
    setStudyErrorMessage('');
  };

  return (
    <Modal
      isOpen={isOpen}
      closeOnOverlayClick={false}
      id="study-creation-modal"
      onClose={handleClose}
      primaryButton={<Button
        icon="add"
        label={t('modal.@button_create')}
        onClick={() => {
          const studyData = {
            id: study?.id,
            name: studyName,
            createdBy: user?.profile.sub,
            keywords,
            project: projectInfoName,
            horizon,
            trajectoryIds,
            studyId: study?.id,
            hvdc: false,
            recalculate: false
          };
          void confirmCreation(studyData);
        }}
        variant="primary"
        disabled={!isFormValid}
      />}
      secondaryButton={<Button label={t('components.quickAccess.@cancel')} onClick={handleClose} variant="text" />}
      size="s"
      title={t('studyModal.@new_study')}
      className="[&_h2]:!text-left"
    >
      <div className="flex w-full flex-col gap-4 self-stretch">
        <div className="flex flex-col items-start gap-4">
          <FieldInFormation />
          <div className="flex w-1/2 flex-col items-start gap-4">
            <TextInput
              id="text-input-study-create-name"
              label={t('modal.@input_name')}
              value={studyName}
              onChange={handleStudyNameChange}
              required
              maxLength={MAX_STUDY_NAME_LENGTH}
              showCounter={true}
              error={!!studyErrorMessage}
              assistiveTextLabel={studyErrorMessage}
              assistiveAppearance="error"
              rightIconAction="clean"
              onRightIconClick={resetNameField}
            />
            <HorizonInput
              horizon={horizon}
              onChange={handleHorizonChange}
              onValidChange={handleHorizonValidityChange}
              required
            />
            <KeywordsInput
              keywords={keywords}
              setKeywords={setKeywords}
              maxNbKeywords={MAX_KEYWORD_NUMBER}
              maxNbCharacters={MAX_KEYWORD_LENGTH}
              minNbCharacters={MIN_KEYWORD_LENGTH}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default StudyCreationModal;
