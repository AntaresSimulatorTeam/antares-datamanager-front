/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import SearchBar from '@/pages/pegase/home/components/SearchBar';
import PegaseCard from '@/components/pegase/pegaseCard/pegaseCard';
import { formatDateToDDMMYYYY } from '@/shared/utils/dateFormatter';
import StdAvatar from '@common/layout/stdAvatar/StdAvatar';
import StudiesPagination from '@/pages/pegase/home/components/StudiesPagination';
import { useDropdownOptions } from '@/hooks/useDropdownOptions';
import { useProjectNavigation } from '@/hooks/useProjectNavigation';
import { deleteProjectById } from '@/shared/services/projectService.ts';
import { RdsChip, RdsTagList } from 'rte-design-system-react';
import { useFetchProjectList } from '@/hooks/useFetchProjectList';
import { useHandlePinnedProjectList } from '@/hooks/useHandlePinnedProjectList.ts';
import { ProjectActionType } from '@/shared/types/Project.type.ts';
import { useProject, useProjectDispatch } from '@/store/contexts/ProjectContext.tsx';
import { PROJECT_ACTION } from '@/shared/enum/project.ts';

const ProjectContent = () => {
  const { t } = useTranslation();
  const intervalSize = 9;
  const userName = 'mouad'; // Replace with actual user name
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeChip, setActiveChip] = useState<boolean | null>(false);
  const [current, setCurrent] = useState(0);
  const { count } = useFetchProjectList(searchTerm || '', current, intervalSize);
  const { navigateToProject } = useProjectNavigation();
  const { handlePinProject } = useHandlePinnedProjectList();
  const { projects } = useProject();
  const dispatch = useProjectDispatch();

  const searchProject = (value?: string | undefined) => {
    value && setSearchTerm(value);
  };

  const handleChipClick = () => {
    if (activeChip) {
      setActiveChip(false);
      setSearchTerm('');
    } else {
      setActiveChip(true);
      setSearchTerm(userName);
    }
  };

  const deleteProject = async (projectId: string) => {
    await deleteProjectById(projectId);
    // Met à jour la liste des projets (et les projets épinglés)
    dispatch?.({
      type: PROJECT_ACTION.REMOVE_PROJECT,
      payload: projectId,
    } as ProjectActionType);
  };

  const handleCardClick = (projectId: string, projectName: string) => {
    navigateToProject(projectId, projectName);
  };

  const { settingOption, deleteOption, pinOption } = useDropdownOptions();

  return (
    <div className="flex w-full flex-1 flex-col gap-3">
      <div className="flex gap-4 py-2">
        <SearchBar onSearch={searchProject} chipLabels={['']} />
        <RdsChip
          label={t('home.@my_projects')}
          onClick={handleChipClick}
          status={activeChip ? 'secondary' : 'primary'}
        />
      </div>
      <div className="grid w-full grid-cols-3 gap-3">
        {(projects || []).map((project) => {
          const dropdownItems = [
            pinOption(false, async () => handlePinProject(project.id)),
            settingOption(() => {}, t('project.@setting')),
            deleteOption(() => deleteProject(project.id), t('project.@delete'), project.studies?.length > 0),
          ];
          return (
            <PegaseCard
              key={project.id}
              title={project.name}
              dropdownOptions={dropdownItems}
              onClick={() => handleCardClick(project.id, project.name)}
              id={project.id}
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
                    <span className="text-body-xs font-bold">{formatDateToDDMMYYYY(project.creationDate)} </span>{' '}
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
          );
        })}
      </div>
      <div className="flex h-[60px] items-center justify-between bg-gray-200 px-[32px]">
        <StudiesPagination count={count} intervalSize={intervalSize} current={current} onChange={setCurrent} />
      </div>
    </div>
  );
};

export default ProjectContent;
