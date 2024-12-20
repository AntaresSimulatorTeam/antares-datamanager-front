/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { ProjectInfo } from '@/shared/types/pegase/Project.type';
import PegaseCard from '@/components/pegase/pegaseCard/pegaseCard';
import StdIcon from '@common/base/stdIcon/StdIcon';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps';
import StdTagList from '@common/base/StdTagList/StdTagList';
import StdAvatar from '@common/layout/stdAvatar/StdAvatar';
import { formatDateToDDMMYYYY } from '@/shared/utils/dateFormatter';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getEnvVariables } from '@/envVariables';
import { useDropdownOptions } from '@/components/pegase/pegaseCard/useDropdownOptions';
import { dismissToast, notifyToast } from '@/shared/notification/notification';
import { v4 as uuidv4 } from 'uuid';
import { useProjectNavigation } from '@/hooks/useProjectNavigation';
import { deleteProjectById } from '@/pages/pegase/projects/projectService';

export const PinnedProjectCards = ({
  reloadPinnedProject,
  isReloadPinnedProject,
}: {
  reloadPinnedProject: boolean;
  isReloadPinnedProject: (value: boolean) => void;
}) => {
  const BASE_URL = getEnvVariables('VITE_BACK_END_BASE_URL');
  const [projects, setProjects] = useState<ProjectInfo[]>([]);
  const { t } = useTranslation();
  const { navigateToProject } = useProjectNavigation();

  const userId = 'me00247';

  /**
   * Handles the unpin action. Displays a toast if the API call is successful.
   * The API call to the /unpin endpoint is made only if the "Cancel" button
   * on the toast is not clicked.
   */
  const handleUnpin = (projectId: string) => {
    const oldProjects = [...projects];
    let apiCallTimeout: number | null = null;
    const toastId = uuidv4();

    setProjects((prevProjects) => prevProjects.filter((project) => project.id !== projectId));

    const unpinApiCall = async () => {
      try {
        await fetch(`${BASE_URL}/v1/project/unpin?userId=${userId}&projectId=${projectId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
        });
      } catch (error) {
        console.error(`Error unpinning project ${projectId}:`, error);
      }
    };

    notifyToast({
      id: toastId,
      type: 'info',
      message: t('components.quickAccess.@confirmUnpin', { name: projectId }),
      action: {
        label: t('components.quickAccess.@cancel'),
        onClick: () => {
          dismissToast(toastId);
          clearTimeout(apiCallTimeout!);
          setProjects(oldProjects);
        },
      },
    });
    apiCallTimeout = setTimeout(() => {
      unpinApiCall();
    }, 5000) as unknown as number;
  };

  const fetchPinnedProjects = async (baseUrl: string): Promise<ProjectInfo[]> => {
    try {
      const response = await fetch(`${baseUrl}/v1/project/pinned?userId=${userId}`);
      const json = await response.json();

      return json.map((project: any) => ({
        ...project,
        projectId: project.id.toString(),
        //Projects in homepage should have pinned to TRUE
        pinned: project.pinned ?? true,
      }));
    } catch (error) {
      console.error('Failed to fetch pinned projects:', error);
      throw error;
    }
  };

  const loadPinnedProjects = async () => {
    try {
      const projects = await fetchPinnedProjects(BASE_URL);
      setProjects(projects);
      isReloadPinnedProject(false);
    } catch (error) {
      console.error('Error loading pinned projects:', error);
    }
  };

  useEffect(() => {
    if (reloadPinnedProject) {
      loadPinnedProjects();
    }
  }, [BASE_URL, reloadPinnedProject]);

  const { settingOption, deleteOption, pinOption } = useDropdownOptions();

  const handleCardClick = (projectId: string, projectName: string) => {
    navigateToProject(projectId, projectName);
  };
  const deleteProject = async (projectId: string) => {
    await deleteProjectById(projectId, isReloadPinnedProject);
    await loadPinnedProjects();
  };

  return projects.map((project, index) => {
    const dropdownItems = [
      pinOption(project.pinned ?? false, () => handleUnpin(project.id)), // Toggle pin/unpin
      settingOption(() => {}, t('project.@setting')),
      deleteOption(() => deleteProject(project.id), t('project.@delete'), project.studies?.length > 0),
    ];

    return (
      <div key={`${project.id}-${index}`} className="flex w-1/3">
        <PegaseCard
          title={project.name}
          dropdownOptions={dropdownItems}
          id={project.id}
          onClick={() => handleCardClick(project.id, project.name)}
          icons={
            <div className="text-primary-600">
              <StdIcon name={StdIconId.PushPin} />{' '}
            </div>
          }
        >
          <div className="flex flex-col items-start justify-between">
            <div className="flex items-center gap-1">
              {project.tags && (
                <div className="flex h-3 w-32">
                  <StdTagList id={`${project.id}-tag-list`} tags={project.tags} />
                </div>
              )}
            </div>

            <div className="flex items-center gap-x-0.5 pt-2.5">
              <div className="font-sans text-body-xs font-light">
                {t('project.@created')} :{' '}
                <span className="text-body-xs font-bold">{formatDateToDDMMYYYY(project.creationDate)} </span>{' '}
                {t('project.@by')} :
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
    );
  });
};

export default PinnedProjectCards;
