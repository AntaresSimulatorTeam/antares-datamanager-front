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

export const PinnedProjectCards = () => {
  const BASE_URL = getEnvVariables('VITE_BACK_END_BASE_URL');
  const [projects, setProjects] = useState<ProjectInfo[]>([]);
  const { t } = useTranslation();
  // const user = useContext(UserContext);
  //const userId = user?.profile.nni ? user.profile.nni : 'mo0023';

  const handleUnpin = (projectId: string) => {
    // Save the current state of projects for potential undo
    const oldProjects = [...projects];

    // Remove the unpinned project
    setProjects((prevProjects) => prevProjects.filter((project) => project.projectId !== projectId));

    // Show a toast notification with an undo option
    const toastId = uuidv4();
    notifyToast({
      id: toastId,
      type: 'info',
      message: t('components.quickAccess.@confirmUnpin', { name: projectId }),
      action: {
        label: t('components.quickAccess.@cancel'),
        onClick: () => {
          dismissToast(toastId);

          // Restore the old projects state
          setProjects(oldProjects);
        },
      },
    });
  };

  const fetchPinnedProjects = async (baseUrl: string): Promise<ProjectInfo[]> => {
    try {
      const response = await fetch(`${baseUrl}/v1/project/pinned?userId=me00247`);
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

  useEffect(() => {
    const loadPinnedProjects = async () => {
      try {
        const projects = await fetchPinnedProjects(BASE_URL);
        setProjects(projects);
      } catch (error) {
        console.error('Error loading pinned projects:', error);
      }
    };

    loadPinnedProjects();
  }, [BASE_URL]);

  const { settingOption, duplicateOption, deleteOption, pinOption } = useDropdownOptions();

  return projects.map((project, index) => {
    const dropdownItems = [
      pinOption(project.pinned ?? false, () => handleUnpin(project.projectId)), // Toggle pin/unpin
      settingOption(() => {}, t('project.@setting')),
      duplicateOption(() => {}, t('project.@duplicate')),
      deleteOption(() => {}, t('project.@delete')), // Empty function for delete - does nothing
    ];

    return (
      <div key={`${project.projectId}-${index}`} className="flex w-1/3">
        <PegaseCard
          title={project.name}
          dropdownOptions={dropdownItems}
          id={project.projectId}
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
                  <StdTagList id={`${project.projectId}-tag-list`} tags={project.tags} />
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
