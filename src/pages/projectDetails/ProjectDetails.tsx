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

const ProjectDetails = () => {
  const BASE_URL = getEnvVariables('VITE_BACK_END_BASE_URL');
  const [projectDetails, setProjectDetails] = useState<ProjectInfo>({} as ProjectInfo);
  const location = useLocation();
  const { projectId } = location.state || {};

  useEffect(() => {
    if (projectId) {
      const fetchProjectDetails = async () => {
        try {
          const response = await fetch(`${BASE_URL}/v1/project/findProjectById?projectId=${projectId}`);

          if (!response.ok) {
            throw new Error('Failed to fetch project details');
          }

          const data = await response.json();
          setProjectDetails(data);
        } catch (error) {
          console.error(`Error retrieving project details: ${projectId}`, error);
        }
      };

      fetchProjectDetails();
    }
  }, [projectId]);

  return (
    <div className="flex flex-col px-3 py-2">
      <ProjectDetailsHeader name={projectDetails.name} createdBy={projectDetails.createdBy} />
      <StdDivider />
    </div>
  );
};

export default ProjectDetails;
