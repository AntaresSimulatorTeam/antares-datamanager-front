/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import PegaseCard from '@/components/pegase/pegaseCard/pegaseCard';
import StdAvatar from '@common/layout/stdAvatar/StdAvatar';
import { formatDateToDDMMYYYY } from '@/shared/utils/dateFormatter';
import { useTranslation } from 'react-i18next';
import { useDropdownOptions } from '@/hooks/useDropdownOptions';
import { useProjectNavigation } from '@/hooks/useProjectNavigation';
import { RdsIcon, RdsIconId, RdsTagList } from 'rte-design-system-react';
import { deleteProjectById } from '@/shared/services/projectService';
import { useHandlePinnedProjectList } from '@/hooks/useHandlePinnedProjectList.ts';
import { notifyToast } from '@/shared/notification/notification.tsx';
import { useProject, useProjectDispatch } from '@/store/contexts/ProjectContext.tsx';
import { ProjectActionType } from '@/shared/types/Project.type.ts';
import { PROJECT_ACTION } from '@/shared/enum/project.ts';
import { useAuth } from 'react-oidc-context';

const PinnedProjectCards = () => {
  const { t } = useTranslation();
  const { navigateToProject } = useProjectNavigation();
  const { settingOption, deleteOption, pinOption } = useDropdownOptions();
  const { pinnedProjects } = useProject();
  const dispatch = useProjectDispatch();
  const { handleUnpinProject } = useHandlePinnedProjectList();
  const authContext = useAuth();

  const handleCardClick = (projectId: string, projectName: string) => {
    navigateToProject(projectId, projectName);
  };

  const deleteProject = async (projectId: string) => {
    try {
      await deleteProjectById(projectId, authContext?.user?.access_token);
      // Update pinned project list
      dispatch?.({
        type: PROJECT_ACTION.REMOVE_PROJECT,
        payload: projectId,
      } as ProjectActionType);
      notifyToast({
        type: 'success',
        message: 'Project deleted successfully',
      });
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
    <>
      {pinnedProjects?.map((project, index) => (
        <div key={`${project.id}-${index}`} className="flex w-1/3">
          <PegaseCard
            title={project.name}
            dropdownOptions={[
              pinOption(project.pinned ?? false, () => handleUnpinProject(project.id)), // Toggle pin/unpin
              settingOption(() => {}, t('project.@setting')),
              deleteOption(() => deleteProject(project.id), t('project.@delete'), project.studies?.length > 0),
            ]}
            id={project.id}
            onClick={() => handleCardClick(project.id, project.name)}
            icons={
              <div className="text-primary-600">
                <RdsIcon name={RdsIconId.PushPin} />{' '}
              </div>
            }
          >
            <div className="flex flex-col items-start justify-between">
              <div className="flex items-center gap-1">
                {project.tags && (
                  <div className="flex h-3 w-32">
                    <RdsTagList id={`${project.id}-tag-list`} tags={project.tags} />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-x-0.5 pt-2.5">
                <div className="font-sans text-body-xs font-light">
                  {t('project.@created')} :{' '}
                  <span className="text-body-xs font-bold">{formatDateToDDMMYYYY(project.creationDate, false)} </span>{' '}
                  <span className="ml-2">{t('project.@by')}</span> :
                </div>

                <StdAvatar
                  size="es"
                  backgroundColor="gray"
                  fullname={project.createdBy}
                  initials={project.createdBy.substring(0, 2)}
                />
                <span className="font-sans text-body-xs font-light">{project.createdBy}</span>
              </div>
            </div>
          </PegaseCard>
        </div>
      ))}
    </>
  );
};

export default PinnedProjectCards;
