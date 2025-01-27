/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ProjectInfo } from '@/shared/types/pegase/Project.type';
import ProjectDetailsHeader from './ProjectDetailsHeader';
import ProjectDetailsContent from './ProjectDetailsContent';
import StudyTableDisplay from '@/pages/pegase/home/components/StudyTableDisplay';
import SearchBar from '@/pages/pegase/home/components/SearchBar';
import { useTranslation } from 'react-i18next';
import { RdsChip, RdsDivider } from 'rte-design-system-react';
import { fetchProjectDetails } from '@/shared/services/projectService.ts';

const ProjectDetails = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState<string | undefined>('');
  const [activeChip, setActiveChip] = useState<boolean | null>(false);
  const userName = 'mouad'; // Replace with actual user name

  const searchStudy = (value?: string | undefined) => {
    setSearchTerm(value);
  };

  const handleChipClick = () => {
    if (activeChip) {
      setActiveChip(false);
      searchStudy('');
    } else {
      setActiveChip(true);
      searchStudy(userName);
    }
  };

  const [projectInfo, setProjectDetails] = useState<ProjectInfo>({} as ProjectInfo);
  const location = useLocation();
  const { projectId } = location.state || {};

  useEffect(() => {
    const getProjectDetails = async (projectId: string) => {
      try {
        const data = await fetchProjectDetails(projectId);

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
        console.error(`Error retrieving project details: ${projectId}`, error);
      }
    };
    if (projectId && !projectInfo.id) {
      void getProjectDetails(projectId);
    }
  }, [projectId, projectInfo.id]);

  /**
   * Check if projectInfo is available before rendering the page
   */
  return !projectInfo.id ? (
    <div className="flex h-screen items-center justify-center">
      <p>Loading project details...</p>
    </div>
  ) : (
    <div className="flex flex-col">
      <ProjectDetailsHeader projectName={projectInfo.name} createdBy={projectInfo.createdBy} />
      <RdsDivider />
      <div className="flex flex-col">
        <ProjectDetailsContent
          description={projectInfo.description}
          createdBy={projectInfo.createdBy}
          creationDate={projectInfo.creationDate}
        />
      </div>
      <div className="flex gap-4 px-3 py-2">
        <SearchBar onSearch={searchStudy} chipLabels={['']} />
        <RdsChip
          label={t('home.@my_studies')}
          onClick={handleChipClick}
          status={activeChip ? 'secondary' : 'primary'}
        />
      </div>
      <StudyTableDisplay searchStudy={searchTerm} projectId={projectInfo.id} />
    </div>
  );
};

export default ProjectDetails;
