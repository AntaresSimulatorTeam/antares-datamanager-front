import { PROJECT_ACTION } from '@/shared/enum/project.ts';
import { ProjectActionType } from '@/shared/types';
import { notifyToast } from '@/shared/notification/notification.tsx';
import { deleteProjectById } from '@/shared/services/projectService.ts';
import { useProjectDispatch } from '@/store/contexts/ProjectContext.tsx';

export const useDeleteProject = () => {
  const dispatch = useProjectDispatch();

  const deleteProject = async (projectId: number) => {
    try {
      await deleteProjectById(projectId);
      // Update pinned project list
      dispatch?.({
        type: PROJECT_ACTION.REMOVE_PROJECT,
        payload: projectId,
      } as ProjectActionType);
      notifyToast({
        type: 'success',
        message: 'Project deleted successfully',
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        notifyToast({
          type: 'error',
          message: `${error.message}`,
        });
      }
    }
  };

  return { deleteProject };
};
