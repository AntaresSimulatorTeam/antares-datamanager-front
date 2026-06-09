/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { RdsModal } from 'rte-design-system-react';
import { ChangeEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import KeywordsInput from '@/components/input/KeywordsInput.tsx';
import { notifyToast } from '@/shared/notification/notification.tsx';
import { ProjectResponse } from '@/shared/types/Project.type.ts';
import {
  MAX_KEYWORD_LENGTH,
  MAX_KEYWORD_NUMBER,
  MAX_PROJECT_DESCRIPTION_LENGTH,
  MAX_PROJECT_NAME_LENGTH,
} from '@/shared/const/studyConfig.ts';
import { Button, Textarea, TextInput } from '@design-system-rte/react';
import { FieldInFormation } from '@common/base/FieldInFormation.tsx';
import { useProjectCreation } from '@/hooks/useProjectCreation.ts';

interface ProjectCreationModalProps {
  onClose: () => void;
  projectInfo?: ProjectResponse | null;
}

export const ProjectCreationModal = ({ onClose, projectInfo }: ProjectCreationModalProps) => {
  const { t } = useTranslation();
  const [name, setName] = useState<string>(projectInfo?.name ?? '');
  const [nameError, setNameError] = useState<string | null>(null);
  const [description, setDescription] = useState<string>(projectInfo?.description ?? '');
  const [keywords, setKeywords] = useState<string[]>(projectInfo?.tags ?? []);

  const resetFields = () => {
    setName('');
    setDescription('');
    setKeywords([]);
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

  const validateFormInputs = () => {
    if (name?.length === 0 || !name?.trim()) {
      setNameError(t('projectModal.@requiredProject'));
      return false;
    }
    return true;
  };

  return (
    <RdsModal size="small">
      <RdsModal.Title onClose={onClose}>
        {projectInfo ? t('home.@update_project') : t('home.@new_project')}
      </RdsModal.Title>
      <RdsModal.Content>
        <div className="flex flex-col items-start gap-3">
          <FieldInFormation />
          <TextInput
            id="text-input-default"
            label={t('modal.@input_name')}
            required
            value={name}
            onChange={(value: string) => {
              nameError && setNameError('');
              setName(value ?? '');
            }}
            assistiveAppearance="error"
            error={!!nameError?.length}
            assistiveTextLabel={nameError ?? ''}
            maxLength={MAX_PROJECT_NAME_LENGTH}
            showCounter={true}
            rightIconAction="clean"
            onRightIconClick={resetNameField}
          />
          <div className="flex w-8/12">
            <Textarea
              label={t('modal.@input_description')}
              value={description}
              onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setDescription(event.target.value || '')}
              maxLength={MAX_PROJECT_DESCRIPTION_LENGTH}
              showCounter={true}
              rows={3}
              resizeable={false}
            />
            <KeywordsInput
              keywords={keywords}
              setKeywords={setKeywords}
              maxNbKeywords={MAX_KEYWORD_NUMBER}
              maxNbCharacters={MAX_KEYWORD_LENGTH}
              minNbCharacters={1}
            />
          </div>
        </div>
      </RdsModal.Content>
      <RdsModal.Footer>
        <Button label={t('components.quickAccess.@cancel')} onClick={onClose} variant="text" />
        <Button
          icon={projectInfo ? 'edit' : 'add'}
          label={projectInfo ? t('modal.@button_update') : t('modal.@button_create')}
          onClick={() => {
            if (validateFormInputs()) {
              const projectData = {
                name,
                tags: keywords,
                description,
              };
              void confirmCreation(projectData, projectInfo?.id);
            }
          }}
          variant="primary"
          color="primary"
        />
      </RdsModal.Footer>
    </RdsModal>
  );
};
