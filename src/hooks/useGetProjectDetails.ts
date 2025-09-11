import { useCallback, useEffect, useState } from 'react';
import { fetchProjectDetails } from '@/shared/services/projectService.ts';
import { ProjectInfo } from '@/shared/types';
import { notifyToast } from '@/shared/notification/notification.tsx';

export const useGetProjectDetails = (projectId: string | null, reFetch: number) => {
  const [projectDetails, setProjectDetails] = useState<ProjectInfo>({} as ProjectInfo);

  const getProjectDetails = useCallback(async (id: string) => {
    try {
      const projectInfo = await fetchProjectDetails(id);
      setProjectDetails({
        id: projectInfo.id,
        name: projectInfo.name,
        description: projectInfo.description,
        createdBy: projectInfo.createdBy,
        creationDate: projectInfo.creationDate,
        archived: false,
        pinned: false,
        path: '',
        tags: projectInfo.tags,
        studies: [],
      });
    } catch (error) {
      notifyToast({
        type: 'error',
        message: `Error retrieving project details: ${id}`,
      });
    }
  }, []);

  useEffect(() => {
    if (projectId) {
      void getProjectDetails(projectId);
    }
  }, [getProjectDetails, projectId, reFetch]);

  return { projectDetails, getProjectDetails };
};
