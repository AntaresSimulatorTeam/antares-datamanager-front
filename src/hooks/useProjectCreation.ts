import { useCallback } from 'react';
import { createProject, updateProject } from '@/shared/services/projectService.ts';
import { ProjectActionType, ProjectDataCreation } from '@/shared/types';
import { PROJECT_ACTION } from '@/shared/enum/project.ts';
import { useProjectDispatch } from '@/store/contexts/ProjectContext.tsx';

export const useProjectCreation = (onSuccess?: () => void, onError?: (message: string) => void) => {
  const dispatch = useProjectDispatch();

  const confirmCreation = useCallback(
    async (projectData: ProjectDataCreation, projectId?: number) => {
      try {
        const newProject = projectId
          ? await updateProject(Number(projectId), projectData)
          : await createProject(projectData);

        if (newProject) {
          dispatch?.({
            type: projectId ? PROJECT_ACTION.UPDATE_PROJECT : PROJECT_ACTION.ADD_PROJECT,
            payload: newProject,
          } as ProjectActionType);
        }
        onSuccess?.();
      } catch (error: unknown) {
        const errorMessages = (error as Error)?.message;
        onError?.(errorMessages);
      }
    },
    [dispatch, onError, onSuccess],
  );

  return { confirmCreation };
};
