/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ProjectInfo } from '@/shared/types/pegase/Project.type';
import { getEnvVariables } from '@/envVariables';
import ProjectDetailsHeader from './ProjectDetailsHeader';
import StdDivider from '@/components/common/layout/stdDivider/StdDivider';
import ProjectDetailsContent from './ProjectDetailsContent';
import StudyTableDisplay from '@/pages/pegase/home/components/StudyTableDisplay';
import SearchBar from '@/pages/pegase/home/components/SearchBar';
import StdChip from '@common/base/stdChip/StdChip';
import { useTranslation } from 'react-i18next';

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
  const BASE_URL = getEnvVariables('VITE_BACK_END_BASE_URL');
  const [projectInfo, setProjectDetails] = useState<ProjectInfo>({} as ProjectInfo);
  const location = useLocation();
  const { projectId } = location.state || {};

  useEffect(() => {
    if (projectId && !projectInfo.id) {
      const fetchProjectDetails = async () => {
        try {
          const response = await fetch(`${BASE_URL}/v1/project/${projectId}`);

          if (!response.ok) {
            throw new Error('Failed to fetch project details');
          }

          const data = await response.json();
          console.log('Fetched Data:', data);

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
          });
        } catch (error) {
          console.error(`Error retrieving project details: ${projectId}`, error);
        }
      };

      fetchProjectDetails();
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
      <StdDivider />
      <div className="flex flex-col">
        <ProjectDetailsContent
          description={projectInfo.description}
          createdBy={projectInfo.createdBy}
          creationDate={projectInfo.creationDate}
        />
      </div>
      <div className="flex gap-4 px-3 py-2">
        <SearchBar onSearch={searchStudy} chipLabels={['']} />
        <StdChip
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
