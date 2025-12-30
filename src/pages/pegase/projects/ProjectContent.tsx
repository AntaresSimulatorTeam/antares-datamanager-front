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
import { RdsChip, RdsTagList } from 'rte-design-system-react';
import { useFetchProjectList } from '@/hooks/useFetchProjectList';
import { useHandlePinnedProjectList } from '@/hooks/useHandlePinnedProjectList.ts';
import { useDeleteProject } from '@/hooks/useDeleteProject.ts';
import { useUser } from '@/store/contexts/UserContext.tsx';
import { useProject } from '@/store/contexts/ProjectContext.tsx';
import { ProjectInfo, ProjectResponse } from '@/shared/types';
import { useNewStudyModal } from '@/hooks/useNewStudyModal.ts';
import { ProjectCreationModal } from '@common/modal/ProjectCreationModal.tsx';
import { StdDropdownOption } from '@common/layout/stdDropdown/StdDropdown.tsx';

const ProjectContent = () => {
  const { t } = useTranslation();
  const intervalSize = 9;
  const { user } = useUser();
  const [searchTerm, setSearchTerm] = useState<string | undefined>();
  const [activeChip, setActiveChip] = useState<boolean | null>(false);
  const [current, setCurrent] = useState(0);
  const { projects, pinnedProjects } = useProject();
  const { count, refetch } = useFetchProjectList(current, intervalSize, searchTerm, projects.length);
  const { navigateToProject } = useProjectNavigation();
  const { handlePinProject } = useHandlePinnedProjectList();
  const { deleteProject } = useDeleteProject();
  const { editOption, deleteOption, pinOption } = useDropdownOptions();
  const { isModalOpen, toggleModal } = useNewStudyModal();
  const [selectedProject, setSelectedProject] = useState<ProjectResponse | null>(null);

  const handleChipClick = () => {
    if (activeChip) {
      setActiveChip(false);
      setSearchTerm('');
    } else {
      setActiveChip(true);
      setSearchTerm(user?.profile.sub);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    await deleteProject(projectId);
    try {
      await refetch(current, intervalSize, searchTerm ?? '');
    } catch (error) {
      // silent handler
    }
  };

  const openModalProject = (project: ProjectInfo) => {
    setSelectedProject(project);
    toggleModal();
  };

  return (
    <div className="flex w-full flex-1 flex-col gap-3">
      <div className="flex gap-4 py-2">
        <SearchBar onSearch={(value?: string) => setSearchTerm(value)} />
        <RdsChip
          label={t('home.@my_projects')}
          onClick={handleChipClick}
          status={activeChip ? 'secondary' : 'primary'}
        />
      </div>
      <div className="grid w-full grid-cols-3 gap-3">
        {(projects.length > intervalSize ? projects.splice(0, 9) : projects || []).map((project) => {
          const dropdownItems: StdDropdownOption[] = [
            pinOption(false, () => void handlePinProject(project.id), pinnedProjects?.length >= 3),
            editOption(() => void openModalProject(project), t('project.@edit')),
            deleteOption(() => void handleDeleteProject(project.id), t('project.@delete'), project.studies?.length > 0),
          ];
          return (
            <PegaseCard
              key={project.id}
              title={project.name}
              dropdownOptions={dropdownItems}
              onClick={() => void navigateToProject(project.id)}
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
        {isModalOpen && <ProjectCreationModal onClose={toggleModal} projectInfo={selectedProject} />}
      </div>
      <div className="flex h-[60px] items-center justify-between bg-gray-200 px-[32px]">
        <StudiesPagination count={count} intervalSize={intervalSize} current={current} onChange={setCurrent} />
      </div>
    </div>
  );
};

export default ProjectContent;
