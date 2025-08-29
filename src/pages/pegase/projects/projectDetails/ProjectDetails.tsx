/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ProjectInfo } from '@/shared/types/Project.type.ts';
import ProjectDetailsHeader from './ProjectDetailsHeader';
import StudyTableDisplay from '@/pages/pegase/home/components/StudyTableDisplay';
import SearchBar from '@/pages/pegase/home/components/SearchBar';
import { useTranslation } from 'react-i18next';
import { RdsChip, RdsDivider } from 'rte-design-system-react';
import { fetchProjectDetails } from '@/shared/services/projectService.ts';
import DetailsContent from '@/components/banner/DetailsContent.tsx';
import { useUser } from '@/store/contexts/UserContext.tsx';
import { LocationProject } from '@/shared/types';
import { ProjectCreationModal } from '@common/modal/ProjectCreationModal.tsx';
import { useNewStudyModal } from '@/hooks/useNewStudyModal.ts';

const ProjectDetails = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState<string | undefined>('');
  const [activeChip, setActiveChip] = useState<boolean | null>(false);
  const { user } = useUser();
  const { isModalOpen, toggleModal } = useNewStudyModal();

  const searchStudy = (value?: string | undefined) => {
    setSearchTerm(value);
  };

  const handleChipClick = () => {
    if (activeChip) {
      setActiveChip(false);
      searchStudy('');
    } else {
      setActiveChip(true);
      searchStudy(user?.profile.sub);
    }
  };

  const [projectInfo, setProjectDetails] = useState<ProjectInfo>({} as ProjectInfo);
  const location = useLocation();
  const projectId = (location.state as LocationProject)?.projectId as string | null;

  useEffect(() => {
    const getProjectDetails = async (id: string) => {
      try {
        const data = await fetchProjectDetails(id);

        setProjectDetails({
          id: data.id,
          name: data.name,
          description: data.description,
          createdBy: data.createdBy,
          creationDate: data.creationDate,
          archived: false,
          pinned: false,
          path: '',
          tags: data.tags,
          studies: [],
        });
      } catch (error) {
        console.error(`Error retrieving project details: ${id}`, error);
      }
    };
    if (projectId && !projectInfo.id) {
      void getProjectDetails(projectId);
    }
  }, [projectId, projectInfo.id]);

  return !projectInfo.id ? (
    <div className="flex h-screen items-center justify-center">
      <p>{t('projectDetails.@loading')}</p>
    </div>
  ) : (
    <div className="flex flex-col">
      <ProjectDetailsHeader projectName={projectInfo.name} />
      <RdsDivider />
      <div className="flex flex-col">
        <DetailsContent content={projectInfo} onClickButton={toggleModal} />
      </div>
      <div className="flex flex-col gap-4 p-3">
        <div className="flex items-center gap-4">
          <SearchBar onSearch={searchStudy} />
          <RdsChip
            label={t('home.@my_studies')}
            onClick={handleChipClick}
            status={activeChip ? 'secondary' : 'primary'}
          />
        </div>
        <StudyTableDisplay searchStudy={searchTerm} projectId={projectInfo.id} projectInfoName={projectInfo.name} />
      </div>
      {isModalOpen && <ProjectCreationModal onClose={toggleModal} projectInfo={projectInfo} />}
    </div>
  );
};

export default ProjectDetails;
