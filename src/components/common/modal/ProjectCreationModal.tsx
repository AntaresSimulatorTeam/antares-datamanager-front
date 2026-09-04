/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { ChangeEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import KeywordsInput from '@/components/input/KeywordsInput.tsx';
import { notifyToast } from '@/shared/notification/notification.tsx';
import { ProjectResponse } from '@/shared/types/Project.type.ts';
import { validateMaxLength } from '@/shared/utils/validateMaxTextLength.ts';
import {
  MAX_KEYWORD_LENGTH,
  MAX_KEYWORD_NUMBER,
  MAX_PROJECT_DESCRIPTION_LENGTH,
  MAX_PROJECT_DESCRIPTION_ROWS_NB,
  MAX_PROJECT_NAME_LENGTH,
  MIN_KEYWORD_LENGTH,
} from '@/shared/const/studyConfig.ts';
import { Button, Modal, Textarea, TextInput } from '@design-system-rte/react';
import { FieldInFormation } from '@common/base/FieldInFormation.tsx';
import { useProjectCreation } from '@/hooks/useProjectCreation.ts';

interface ProjectCreationModalProps {
  onClose: () => void;
  projectInfo?: ProjectResponse | null;
  isOpen: boolean;
}

export const ProjectCreationModal = ({ onClose, projectInfo, isOpen }: ProjectCreationModalProps) => {
  const { t } = useTranslation();
  const [name, setName] = useState<string>(projectInfo?.name ?? '');
  const [description, setDescription] = useState<string>(projectInfo?.description ?? '');
  const [keywords, setKeywords] = useState<string[]>(projectInfo?.tags ?? []);
  const [isFormValid, setIsFormValid] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  const resetFields = () => {
    setName('');
    setDescription('');
    setKeywords([]);
    setNameError('')
  };

  const resetNameField = () => {
    setName('');
    setNameError('');
  };

  const { confirmCreation } = useProjectCreation(
    () => {
      notifyToast({
        type: 'success',
        message: 'Successful project save',
      });
      resetFields();
      onClose();
    },
    (message) => setNameError(message),
  );

  useEffect(() => {
    if (keywords.length > 0) {
      setIsFormValid(true);
    }
  }, [keywords.length]);

  return (
  <Modal
    isOpen={isOpen}
    closeOnOverlayClick={false}
    id="project-creation-modal"
    onClose={() => {
      resetFields()
      void onClose()
    }}
    primaryButton={<Button
      label={projectInfo ? t('modal.@button_update') : t('modal.@button_create')}
      icon={projectInfo ? 'edit' : 'add'}
      onClick={() => {
        const projectData = {
          name,
          tags: keywords,
          description,
        };
        void confirmCreation(projectData, projectInfo?.id);
      }}
      variant="primary"
      color="primary"
      disabled={!isFormValid}
    />}
    secondaryButton={<Button label={t('components.quickAccess.@cancel')} onClick={() => {
      resetFields()
      void onClose()
    }} variant="text" />}
    size="s"
    title={projectInfo ? t('home.@update_project') : t('home.@new_project')}
    className="[&_h2]:!text-left"
    >
    <div className="flex flex-col items-start gap-4">
      <FieldInFormation />
      <div className="flex flex-col items-start gap-4">
        <TextInput
          aria-required
          id="text-input-default"
          label={t('modal.@input_name')}
          labelPosition="top"
          rightIconAction="clean"
          onRightIconClick={resetNameField}
          onChange={(value: string) => {
            if (validateMaxLength(value, MAX_PROJECT_NAME_LENGTH)) {
              setNameError(null);
              setName(value);
              setIsFormValid(true);
            } else if (value?.length === MAX_PROJECT_NAME_LENGTH + 1) {
              setNameError(t('modal.@number_characters_exceeds'));
              setIsFormValid(false);
              setName('');
            }
          }}
          maxLength={MAX_PROJECT_NAME_LENGTH}
          showCounter={true}
          required
          value={name}
          assistiveTextLabel={nameError ?? ''}
          assistiveAppearance="error"
          error={!!nameError?.length}
        />
        <Textarea
          label={t('modal.@input_description')}
          value={description}
          onChange={(event: ChangeEvent<HTMLTextAreaElement>) => {
            const text = event.target.value;
            if (validateMaxLength(text, MAX_PROJECT_DESCRIPTION_LENGTH)) {
              setDescription(text || '');
              !nameError && setIsFormValid(true);
            } else if (text?.length === MAX_PROJECT_DESCRIPTION_LENGTH + 1) {
              setDescription(text || '');
              setIsFormValid(false);
            }
          }}
          maxLength={MAX_PROJECT_DESCRIPTION_LENGTH}
          showCounter={true}
          rows={MAX_PROJECT_DESCRIPTION_ROWS_NB}
          resizeable={false}
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
  </Modal>
  );
};
