/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import PegaseCard from '@/components/pegase/pegaseCard/PegaseCard';
import StudiesPagination from '@/pages/pegase/home/components/StudiesPagination';
import { useDropdownOptions } from '@/hooks/useDropdownOptions';
import { useProjectNavigation } from '@/hooks/useProjectNavigation';
import { useFetchProjectList } from '@/hooks/useFetchProjectList';
import { useHandlePinnedProjectList } from '@/hooks/useHandlePinnedProjectList.ts';
import { useDeleteProject } from '@/hooks/useDeleteProject.ts';
import { useUser } from '@/store/contexts/UserContext.tsx';
import { useProject } from '@/store/contexts/ProjectContext.tsx';
import { DropdownItemOption, ProjectInfo, ProjectResponse } from '@/shared/types';
import { useNewStudyModal } from '@/hooks/useNewStudyModal.ts';
import { ProjectCreationModal } from '@common/modal/ProjectCreationModal.tsx';
import { PegaseCardContent } from '@/components/pegase/pegaseCard/pegaseCardContent/PegaseCardContent.tsx';
import { Chip, Searchbar } from '@design-system-rte/react';

const ProjectContent = () => {
  const { t } = useTranslation();
  const intervalSize = 9;
  const { user } = useUser();
  const [searchTerm, setSearchTerm] = useState<string | undefined>();
  const [activeChip, setActiveChip] = useState<boolean>(false);
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

  const handleDeleteProject = async (projectId: number) => {
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
    <div className="m-0 flex w-full flex-1 flex-col gap-3">
      <div className="flex w-2/5 items-center gap-4">
        <div className="flex w-3/4">
          <Searchbar
            onSearch={(value?: string) => setSearchTerm(value)}
            onChange={(value?: string) => setSearchTerm(value)}
            label={t('home.@search_placeholder_project')}
          />
        </div>
        <div className="flex w-1/4">
          <Chip id="chip-project-page" label={t('home.@my_projects')} onClick={handleChipClick} selected={activeChip} />
        </div>
      </div>
      <div
        className="grid w-full gap-3"
        style={{
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          margin: 0,
          padding: 0,
        }}
      >
        {(projects.length > intervalSize ? projects.splice(0, 9) : projects || []).map((project) => {
          const dropdownItems: DropdownItemOption[] = [
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
              <PegaseCardContent project={project} />
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
