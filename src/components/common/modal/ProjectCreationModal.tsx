/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { RdsButton, RdsIconId, RdsInputText, RdsInputTextArea, RdsModal } from 'rte-design-system-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import KeywordsInput from '@/pages/pegase/studies/KeywordsInput';
import { createProject } from '@/shared/services/projectService';
import { notifyToast } from '@/shared/notification/notification.tsx';
import { PROJECT_ACTION } from '@/shared/enum/project.ts';
import { ProjectActionType } from '@/shared/types/pegase/Project.type.ts';
import { useProjectDispatch } from '@/store/contexts/ProjectContext.tsx';

interface ProjectCreationModalProps {
  onClose: () => void;
}

export const ProjectCreationModal = ({ onClose }: ProjectCreationModalProps) => {
  const { t } = useTranslation();
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [isFormValid, setIsFormValid] = useState(false);
  const dispatch = useProjectDispatch();

  const validateForm = () => {
    if (name) {
      setIsFormValid(true);
    } else {
      setIsFormValid(false);
    }
  };

  useEffect(() => {
    validateForm();
  }, [name]);

  const handleCreateProject = async () => {
    try {
      const projectData = {
        name: name,
        tags: keywords,
        description: description,
      };

      const newProject = await createProject(projectData);
      if (newProject) {
        dispatch?.({
          type: PROJECT_ACTION.ADD_PROJECT,
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
      if (error instanceof Error) {
        notifyToast({
          type: 'error',
          message: `${error.message}`,
        });
      }
    }
  };

  return (
    <RdsModal size="medium">
      <RdsModal.Title onClose={onClose}>{t('home.@new_project')}</RdsModal.Title>
      <RdsModal.Content>
        <div className="flex w-1/2 flex-col items-start gap-4">
          <RdsInputText
            label="Name"
            value={name}
            onChange={(t) => {
              if (t.length < 40) setName(t || '');
            }}
            variant="outlined"
            placeHolder="Name your project..."
            required
            maxLength={40}
            autoFocus={true}
          />
          <RdsInputTextArea
            label="Description"
            value={description}
            onChange={(t) => {
              if (t.length < 500) setDescription(t || '');
            }}
            maxLength={500}
            placeHolder="Add a few lines to describe your project..."
          />
          <KeywordsInput keywords={keywords} setKeywords={setKeywords} maxNbKeywords={6} maxNbCharacters={15} />
        </div>
      </RdsModal.Content>
      <RdsModal.Footer>
        <RdsButton label="Cancel" onClick={onClose} color="secondary" />
        <RdsButton
          icon={RdsIconId.Add}
          label="Create"
          onClick={handleCreateProject}
          variant="contained"
          color="primary"
          disabled={!isFormValid}
        />
      </RdsModal.Footer>
    </RdsModal>
  );
};
