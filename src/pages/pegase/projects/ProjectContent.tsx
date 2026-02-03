import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import SearchBar from '@/pages/pegase/home/components/SearchBar';
import PegaseCard from '@/components/pegase/pegaseCard/PegaseCard';
import StudiesPagination from '@/pages/pegase/home/components/StudiesPagination';
import { useDropdownOptions } from '@/hooks/useDropdownOptions';
import { useProjectNavigation } from '@/hooks/useProjectNavigation';
import { RdsChip } from 'rte-design-system-react';
import { useFetchProjectList } from '@/hooks/useFetchProjectList';
import { useHandlePinnedProjectList } from '@/hooks/useHandlePinnedProjectList.ts';
import { useDeleteProject } from '@/hooks/useDeleteProject.ts';
import { useUser } from '@/store/contexts/UserContext.tsx';
import { useProject } from '@/store/contexts/ProjectContext.tsx';
import { ProjectResponse } from '@/shared/types';
import { useNewStudyModal } from '@/hooks/useNewStudyModal.ts';
import { ProjectCreationModal } from '@common/modal/ProjectCreationModal.tsx';
import { StdDropdownOption } from '@common/layout/stdDropdown/StdDropdown.tsx';
import { PegaseCardContent } from '@/components/pegase/pegaseCard/pegaseCardContent/PegaseCardContent.tsx';

const ProjectContent = () => {
  const { t } = useTranslation();
  const intervalSize = 9;
  const { user } = useUser();

  const [searchTerm, setSearchTerm] = useState<string | undefined>();
  const [activeChip, setActiveChip] = useState(false);
  const [current, setCurrent] = useState(0);

  const { projects, pinnedProjects } = useProject();

  const { count, refetch } = useFetchProjectList(current, intervalSize, searchTerm);

  const { navigateToProject } = useProjectNavigation();
  const { handlePinProject } = useHandlePinnedProjectList();
  const { deleteProject } = useDeleteProject();
  const { editOption, deleteOption, pinOption } = useDropdownOptions();
  const { isModalOpen, toggleModal } = useNewStudyModal();
  const [selectedProject, setSelectedProject] = useState<ProjectResponse | null>(null);

  const handleChipClick = () => {
    setActiveChip((prev) => {
      const next = !prev;
      setSearchTerm(next ? user?.profile.sub : undefined);
      setCurrent(0);
      return next;
    });
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      await deleteProject(projectId);
      await refetch(current, intervalSize, searchTerm ?? '');
    } catch {
      // silent handler
    }
  };

  const openModalProject = (project: ProjectResponse) => {
    setSelectedProject(project);
    toggleModal();
  };

  return (
    <div className="flex w-full flex-1 flex-col gap-3">
      <div className="flex gap-4 py-2">
        <SearchBar
          onSearch={(value?: string) => {
            setSearchTerm(value);
            setActiveChip(false);
            setCurrent(0);
          }}
        />
        <RdsChip
          label={t('home.@my_projects')}
          onClick={handleChipClick}
          status={activeChip ? 'secondary' : 'primary'}
        />
      </div>

      <div className="grid w-full grid-cols-3 gap-3">
        {(projects.length > intervalSize ? projects.slice(0, intervalSize) : projects || []).map((project) => {
          const dropdownItems: StdDropdownOption[] = [
            pinOption(false, () => void handlePinProject(project.id), (pinnedProjects?.length ?? 0) >= 3),
            editOption(() => void openModalProject(project), t('project.@edit')),
            deleteOption(
              () => void handleDeleteProject(project.id),
              t('project.@delete'),
              (project.studies?.length ?? 0) > 0,
            ),
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
