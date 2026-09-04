/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import KeywordsInput from '@/components/input/KeywordsInput.tsx';
import HorizonInput from '@/components/input/HorizonInput';
import { SelectDSOption, StudyDTO } from '@/shared/types';
import { useUser } from '@/store/contexts/UserContext.tsx';
import { notifyAlert, notifyToast } from '@/shared/notification/notification';
import { validateMaxLength } from '@/shared/utils/validateMaxTextLength';
import {
  MAX_KEYWORD_LENGTH,
  MAX_KEYWORD_NUMBER,
  MAX_STUDY_NAME_LENGTH,
  MIN_KEYWORD_LENGTH,
} from '@/shared/const/studyConfig';
import { hasArrayChanged } from '@/shared/utils/arrayUtils.ts';
import { Button, Modal, Select, TextInput } from '@design-system-rte/react';
import { FieldInFormation } from '@common/base/FieldInFormation.tsx';
import { convertToOneYearHorizon } from '@/shared/utils/textUtils.ts';
import { useFetchProjectOptions } from '@/hooks/useFetchProjectOptions.ts';
import { useStudyModification } from '@/hooks/useStudyModification.ts';
import { ERROR_MESSAGE_TYPE } from '@/shared/enum/warning.ts';

interface StudyCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  study: StudyDTO;
  setReloadStudies?: React.Dispatch<React.SetStateAction<number>>;
  isDuplicateMode?: boolean;
}

const StudyModificationModal: React.FC<StudyCreationModalProps> = ({
  onClose,
  study,
  setReloadStudies,
  isDuplicateMode = false,
  isOpen
}) => {
  const { t } = useTranslation();
  const { user } = useUser();
  const { projects } = useFetchProjectOptions();

  const baseStudyName = study.name.substring(0, study.name.lastIndexOf('_'));
  const [studyName, setStudyName] = useState<string>(baseStudyName);
  const [project, setProject] = useState<SelectDSOption>({
    id: Number(study.projectId),
    label: study.project,
    value: study.project,
  });

  const [keywords, setKeywords] = useState<string[]>(study?.keywords || []);
  const [horizon, setHorizon] = useState<string>(() => convertToOneYearHorizon(study.horizon));
  const [isFormValid, setIsFormValid] = useState(false);
  const [isHorizonValid, setIsHorizonValid] = useState(true);
  const [studyErrorMessage, setStudyErrorMessage] = useState<string>('');
  const [horizonErrorMessage, setHorizonErrorMessage] = useState<string>('');

  const resetErrorMessage = () => {
    setStudyErrorMessage('');
    setHorizonErrorMessage('');
  };

  const resetFields = () => {
    setStudyName('');
    setHorizon('');
    setKeywords([]);
    resetErrorMessage();
  };

  const { confirmUpdate } = useStudyModification(
    () => {
      setReloadStudies?.((prev) => prev + 1);
      notifyToast({
        type: 'success',
        message: `Study ${isDuplicateMode ? 'duplicated' : 'updated'} successfully`,
      });
      resetFields();
      onClose();
    },
    (error) => {
      if (error?.antaresErrorMessage?.includes(t('studyDetails.@duplicateModalStudyError'))) {
        setStudyErrorMessage(error?.antaresErrorMessage);
      } else if (error?.antaresErrorMessage?.includes(t('horizonInput.@validYearError'))) {
        setHorizonErrorMessage(error?.antaresErrorMessage);
      } else {
        if (error?.type === ERROR_MESSAGE_TYPE.BUSINESS) {
          notifyAlert({
            icon: 'close',
            message: error?.antaresErrorMessage,
            type: 'error',
            filledIcon: true,
          });
        }
        resetFields();
        onClose();
      }
    },
  );

  useEffect(() => {
    const validateForm = () => {
      const studyNameChanged = studyName.length > 0 && studyName.trim() !== baseStudyName.trim();
      const projectNameChanged = study.project.trim() !== project?.label.trim();
      const keywordsChanged = hasArrayChanged(study.keywords, keywords);
      const horizonChanged = isHorizonValid && convertToOneYearHorizon(study.horizon) !== horizon;
      if (isDuplicateMode) {
        setIsFormValid(horizonChanged || studyNameChanged || projectNameChanged);
      } else {
        setIsFormValid(studyNameChanged || projectNameChanged || keywordsChanged);
      }
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
    <Modal
      isOpen={isOpen}
      closeOnOverlayClick={false}
      id="study-update-modal"
      onClose={() => {
        resetFields()
        void onClose()
      }}
      primaryButton={<Button
        icon={isDuplicateMode ? 'copy' : 'edit'}
        label={isDuplicateMode ? t('study.@duplicate') : t('modal.@button_update')}
        onClick={() => {
          const studyData = {
            ...study,
            createdBy: user?.profile.sub,
            name: studyName,
            keywords,
            project: project.label,
            projectId: project?.id?.toString() || '',
            horizon,
          };

          void confirmUpdate(study.id, studyData, isDuplicateMode);
        }}
        variant="primary"
        disabled={!isFormValid}
      />}
      secondaryButton={<Button label={t('components.quickAccess.@cancel')} onClick={() => {
        resetFields()
        void onClose()
      }} variant="text" />}
      size="s"
      title={isDuplicateMode ? t('home.@duplicate_study') : t('studyModal.@update_study')}
      className="[&_h2]:!text-left"
    >
      <div className="flex w-full flex-col items-start justify-start space-y-2">
        <FieldInFormation />
        <div className="flex w-full flex-col items-start justify-start space-y-4">
          <div className="flex w-full items-start justify-start space-x-4">
            <div className="w-1/2">
              <TextInput
                id="text-input-study-modify-name"
                value={studyName}
                label={t('modal.@input_name')}
                onChange={handleStudyNameChange}
                required
                maxLength={MAX_STUDY_NAME_LENGTH}
                showCounter={true}
                error={!!studyErrorMessage}
                assistiveTextLabel={studyErrorMessage}
                assistiveAppearance={studyErrorMessage ? 'error' : 'description'}
                rightIconAction="clean"
                onRightIconClick={() => setStudyName('')}
              />
            </div>
            <div className="w-1/2">
              <Select
                id="project-select"
                value={project?.value ?? ''}
                onChange={(value: string) => {
                  const selectedProject = projects.find((projectOption) => projectOption.value === value);
                  if (selectedProject) {
                    setProject(selectedProject);
                  }
                }}
                label={t('page.@project')}
                options={projects}
                multiple={false}
                required={true}
                width={280}
              />
            </div>
          </div>
          <div className="w-1/2">
            <HorizonInput
              horizon={horizon}
              onChange={setHorizon}
              onValidChange={setIsHorizonValid}
              required
              disabled={!isDuplicateMode}
              customErrorMessage={isDuplicateMode && horizonErrorMessage ? horizonErrorMessage : ''}
            />
          </div>
          <KeywordsInput
            keywords={keywords}
            setKeywords={setKeywords}
            maxNbKeywords={MAX_KEYWORD_NUMBER}
            maxNbCharacters={MAX_KEYWORD_LENGTH}
            minNbCharacters={MIN_KEYWORD_LENGTH}
          />
        </div>
      </div>
    </Modal>
  );
};

export default StudyModificationModal;
