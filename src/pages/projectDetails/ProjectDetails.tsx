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

const ProjectDetails = () => {
  const BASE_URL = getEnvVariables('VITE_BACK_END_BASE_URL');
  const [projectInfo, setProjectDetails] = useState<ProjectInfo>({} as ProjectInfo);
  const location = useLocation();
  const { projectId } = location.state || {};

  useEffect(() => {
    console.log('Running useEffect for projectId:', projectId);
    if (projectId && !projectInfo.id) {
      const fetchProjectDetails = async () => {
        try {
          const response = await fetch(`${BASE_URL}/v1/project/findProjectById?projectId=${projectId}`);

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
    </div>
  );
};

export default ProjectDetails;
