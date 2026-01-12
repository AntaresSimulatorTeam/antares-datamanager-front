/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import PegaseCard from '@/components/pegase/pegaseCard/PegaseCard';
import { useTranslation } from 'react-i18next';
import { useDropdownOptions } from '@/hooks/useDropdownOptions';
import { useProjectNavigation } from '@/hooks/useProjectNavigation';
import { useHandlePinnedProjectList } from '@/hooks/useHandlePinnedProjectList.ts';
import { useProject } from '@/store/contexts/ProjectContext.tsx';
import { useDeleteProject } from '@/hooks/useDeleteProject.ts';
import { useNewStudyModal } from '@/hooks/useNewStudyModal.ts';
import { ProjectCreationModal } from '@common/modal/ProjectCreationModal.tsx';
import { useState } from 'react';
import { ProjectInfo, ProjectResponse } from '@/shared/types';
import StdIcon from '@common/base/stdIcon/StdIcon.tsx';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps.ts';
import { PegaseCardContent } from '@/components/pegase/pegaseCard/pegaseCardContent/PegaseCardContent.tsx';

const PinnedProjectCards = () => {
  const { t } = useTranslation();
  const { navigateToProject } = useProjectNavigation();
  const { editOption, deleteOption, pinOption } = useDropdownOptions();
  const { pinnedProjects } = useProject();
  const { handleUnpinProject } = useHandlePinnedProjectList();
  const { deleteProject } = useDeleteProject();
  const { isModalOpen, toggleModal } = useNewStudyModal();
  const [selectedProject, setSelectedProject] = useState<ProjectResponse | null>(null);

  const openModalProject = (project: ProjectInfo) => {
    setSelectedProject(project);
    toggleModal();
  };

  return (
    <>
      {pinnedProjects?.map((project, index) => (
        <div key={`${project.id}-${index}`} className="flex w-1/3">
          <PegaseCard
            title={project.name}
            dropdownOptions={[
              pinOption(project.pinned ?? false, () => void handleUnpinProject(project.id)),
              editOption(() => void openModalProject(project), t('project.@edit')),
              deleteOption(() => void deleteProject(project.id), t('project.@delete'), project.studies?.length > 0),
            ]}
            id={project.id}
            onClick={() => void navigateToProject(project.id)}
            icons={<StdIcon name={StdIconId.PushPin} color="text-primary-600" />}
          >
            <PegaseCardContent project={project} />
          </PegaseCard>
        </div>
      ))}
      {isModalOpen && <ProjectCreationModal onClose={toggleModal} projectInfo={selectedProject} />}
    </>
  );
};

export default PinnedProjectCards;
