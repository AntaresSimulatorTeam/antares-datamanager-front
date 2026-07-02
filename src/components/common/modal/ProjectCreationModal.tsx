/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { RdsModal } from 'rte-design-system-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import KeywordsInput from '@/components/input/KeywordsInput.tsx';
import { createProject, updateProject } from '@/shared/services/projectService';
import { notifyToast } from '@/shared/notification/notification.tsx';
import { PROJECT_ACTION } from '@/shared/enum/project.ts';
import { ProjectActionType, ProjectResponse } from '@/shared/types/Project.type.ts';
import { useProjectDispatch } from '@/store/contexts/ProjectContext.tsx';
import { validateMaxLength } from '@/shared/utils/validateMaxTextLength.ts';
import {
  MAX_KEYWORD_LENGTH,
  MAX_KEYWORD_NUMBER,
  MAX_PROJECT_DESCRIPTION_LENGTH,
  MAX_PROJECT_DESCRIPTION_ROWS_NB,
  MAX_PROJECT_NAME_LENGTH,
  MIN_KEYWORD_LENGTH,
} from '@/shared/const/studyConfig.ts';
import { Button, Textarea, TextInput } from '@design-system-rte/react';
import { FieldInFormation } from '@common/base/FieldInFormation.tsx';

interface ProjectCreationModalProps {
  onClose: () => void;
  projectInfo?: ProjectResponse | null;
}

export const ProjectCreationModal = ({ onClose, projectInfo }: ProjectCreationModalProps) => {
  const { t } = useTranslation();
  const [name, setName] = useState<string>(projectInfo?.name ?? '');
  const [description, setDescription] = useState<string>(projectInfo?.description ?? '');
  const [keywords, setKeywords] = useState<string[]>(projectInfo?.tags ?? []);
  const [isFormValid, setIsFormValid] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const dispatch = useProjectDispatch();

  const handleCreateProject = async () => {
    try {
      const projectData = {
        name,
        tags: keywords,
        description,
      };

      const newProject = projectInfo
        ? await updateProject(Number(projectInfo.id), projectData)
        : await createProject(projectData);

      if (newProject) {
        dispatch?.({
          type: projectInfo ? PROJECT_ACTION.UPDATE_PROJECT : PROJECT_ACTION.ADD_PROJECT,
          payload: newProject,
        } as ProjectActionType);
      }
      notifyToast({
        type: 'success',
        message: 'Successful project save',
      });
      setName('');
      setDescription('');
      setKeywords([]);
      onClose();
    } catch (error: unknown) {
      const errorMessages = (error as Error)?.message;
      if (errorMessages?.includes('already exists')) {
        setNameError(errorMessages);
        setIsFormValid(false);
      } else {
        notifyToast({
          type: 'error',
          message: `${errorMessages ?? 'An error occurred'}`,
        });
        onClose();
      }
    }
  };

  return (
    <RdsModal size="small">
      <RdsModal.Title onClose={onClose}>
        {projectInfo ? t('home.@update_project') : t('home.@new_project')}
      </RdsModal.Title>
      <RdsModal.Content>
        <div className="flex flex-col items-start gap-4">
          <FieldInFormation />
          <div className="flex w-1/2 flex-col items-start gap-4">
            <TextInput
              aria-required
              assistiveAppearance="error"
              autoComplete="off"
              error={!!nameError}
              id="text-input-default"
              label={t('modal.@input_name')}
              labelPosition="top"
              rightIconAction="clean"
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
            />
            <Textarea
              label={t('modal.@input_description')}
              value={description}
              onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => {
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
      </RdsModal.Content>
      <RdsModal.Footer>
        <Button label={t('components.quickAccess.@cancel')} onClick={onClose} variant="text" />
        <Button
          icon={projectInfo ? 'edit' : 'add'}
          label={projectInfo ? t('modal.@button_update') : t('modal.@button_create')}
          onClick={() => void handleCreateProject()}
          variant="primary"
          color="primary"
          disabled={!isFormValid}
        />
      </RdsModal.Footer>
    </RdsModal>
  );
};
