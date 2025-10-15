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
import { saveStudy } from '@/shared/services/studyService';
import { StudyDTO } from '@/shared/types';
import { useUser } from '@/store/contexts/UserContext.tsx';
import { notifyToast } from '@/shared/notification/notification';
import { validateMaxLength } from '@/shared/utils/validateMaxTextLength';
import { MAX_STUDY_NAME_LENGTH } from '@/shared/const/studyConfig';
import StdButton from '@common/base/stdButton/StdButton';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps.ts';

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
  const [studyName, setStudyName] = useState<string>('');
  const [horizon, setHorizon] = useState<string>('');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [isFormValid, setIsFormValid] = useState(false);
  const { user } = useUser();
  const [isHorizonValid, setIsHorizonValid] = useState(false);

  const saveStudyHandler = async () => {
    const studyData = {
      id: study?.id,
      name: studyName,
      createdBy: user?.profile.sub,
      keywords,
      project: projectInfoName,
      horizon,
      trajectoryIds: [],
      studyId: study?.id,
    };

    try {
      await saveStudy(studyData);
      setReloadStudies((prev) => prev + 1);
      setStudyName('');
      setHorizon('');
      setKeywords([]);
      notifyToast({
        type: 'success',
        message: 'Study created successfully',
      });
      onClose();
    } catch (error) {
      notifyToast({
        type: 'error',
        message: (error as Error)?.message ?? '',
      });
    }
  };

  useEffect(() => {
    const validateForm = () => {
      if (studyName && horizon && isHorizonValid) {
        setIsFormValid(true);
      } else {
        setIsFormValid(false);
      }
    };
    validateForm();
  }, [studyName, horizon, isHorizonValid]);

  const handleStudyNameChange = (value: string) => {
    if (validateMaxLength(value, MAX_STUDY_NAME_LENGTH)) {
      setStudyName(value || '');
    }
  };

  return (
    <RdsModal size="small">
      <RdsModal.Title onClose={onClose}>{t('studyModal.@new_study')}</RdsModal.Title>
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
          </div>
          <HorizonInput horizon={horizon} onChange={setHorizon} onValidChange={setIsHorizonValid} required />
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
          icon={StdIconId.Add}
          label={t('studyModal.@button_create')}
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
