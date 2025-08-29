/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { RdsInputText, RdsInputTextArea, RdsModal } from 'rte-design-system-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import KeywordsInput from '@/components/input/KeywordsInput.tsx';
import { createProject, updateProject } from '@/shared/services/projectService';
import { notifyToast } from '@/shared/notification/notification.tsx';
import { PROJECT_ACTION } from '@/shared/enum/project.ts';
import { ProjectActionType, ProjectResponse } from '@/shared/types/Project.type.ts';
import { useProjectDispatch } from '@/store/contexts/ProjectContext.tsx';
import StdButton from '@common/base/stdButton/StdButton';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps.ts';

interface ProjectCreationModalProps {
  onClose: () => void;
  projectInfo?: ProjectResponse | null;
}

export const ProjectCreationModal = ({ onClose, projectInfo }: ProjectCreationModalProps) => {
  const { t } = useTranslation();
  const [name, setName] = useState<string>(projectInfo?.name ?? '');
  const [description, setDescription] = useState<string>(projectInfo?.description ?? '');
  const [keywords, setKeywords] = useState<string[]>(projectInfo?.tags.length ? projectInfo?.tags : []);
  const [isFormValid, setIsFormValid] = useState(false);
  const dispatch = useProjectDispatch();

  useEffect(() => {
    setIsFormValid(name.length > 0);
  }, [name]);

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
      if (error instanceof Error) {
        notifyToast({
          type: 'error',
          message: `${error.message}`,
        });
      }
    }
  };

  return (
    <RdsModal size="small">
      <RdsModal.Title onClose={onClose}>
        {projectInfo ? t('home.@update_project') : t('home.@new_project')}
      </RdsModal.Title>
      <RdsModal.Content>
        <div className="flex flex-col items-start gap-2">
          <div className="flex w-8/12 flex-col items-start gap-2">
            <RdsInputText
              label="Name"
              value={name}
              onChange={(text: string) => {
                if (text.length <= 40) setName(text || '');
              }}
              variant="outlined"
              placeHolder={t('projectModal.@placeholder_name_input')}
              required
              maxLength={40}
              autoFocus={true}
            />
            <div className="flex w-full [&_textarea]:min-h-[300px] [&_textarea]:resize-none">
              <RdsInputTextArea
                label="Description"
                value={description}
                onChange={(text) => {
                  if (text.length <= 500) setDescription(text || '');
                }}
                maxLength={500}
                placeHolder={t('projectModal.@placeholder_description_input')}
              />
            </div>
          </div>
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
        <StdButton label="Cancel" onClick={onClose} color="secondary" />
        <StdButton
          icon={projectInfo ? StdIconId.Edit : StdIconId.Add}
          label={projectInfo ? t('studyModal.@button_update') : t('studyModal.@button_create')}
          onClick={() => void handleCreateProject()}
          variant="contained"
          color="primary"
          disabled={!projectInfo || !isFormValid}
        />
      </RdsModal.Footer>
    </RdsModal>
  );
};
