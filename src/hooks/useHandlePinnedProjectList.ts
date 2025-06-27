/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect } from 'react';
import { ProjectActionType } from '@/shared/types/Project.type';
import { fetchPinnedProjects, pinProject, unpinProject } from '@/shared/services/pinnedProjectService';
import { v4 as uuidv4 } from 'uuid';
import { notifyToast } from '@/shared/notification/notification.tsx';
import { useTranslation } from 'react-i18next';
import { useProjectDispatch } from '@/store/contexts/ProjectContext';
import { PROJECT_ACTION } from '@/shared/enum/project.ts';
import { useUser } from '@/store/contexts/UserContext.tsx';

export const useHandlePinnedProjectList = () => {
  const { user } = useUser();
  const dispatch = useProjectDispatch();
  const { t } = useTranslation();

  const getPinnedProjects = useCallback(async () => {
    try {
      const projects = await fetchPinnedProjects(user?.profile.sub);
      if (projects?.length) {
        dispatch?.({
          type: PROJECT_ACTION.INIT_PINNED_PROJECT_LIST,
          payload: projects,
        } as ProjectActionType);
      }
    } catch (error) {
      // silent handler
    }
  }, []);

  useEffect(() => {
    void getPinnedProjects();
  }, []);

  /**
   * Handles the pin action. Displays a toast if the API call is successful.
   *
   * @param {string} projectId - Project id
   */
  const handlePinProject = useCallback(async (projectId: string) => {
    const toastId = uuidv4();
    try {
      const newProject = await pinProject(projectId, user?.profile.sub);
      if (newProject) {
        dispatch?.({
          type: PROJECT_ACTION.ADD_PINNED_PROJECT,
          payload: newProject,
        } as ProjectActionType);
      }

      notifyToast({
        id: toastId,
        type: 'success',
        message: t('pinnedProject.@pinSuccess'),
      });
    } catch (error: unknown) {
      notifyToast({
        id: toastId,
        type: 'error',
        message: (error as Error).message,
      });
    }
  }, []);

  /**
   * Handles the unpin action. Displays a toast if the API call is successful.
   * The API call to the /unpin endpoint is made only if the "Cancel" button
   * on the toast is not clicked.
   *
   * @param {string} projectId - Project id
   */
  const handleUnpinProject = useCallback(async (projectId: string) => {
    const toastId = uuidv4();

    try {
      await unpinProject(projectId, user?.profile.sub);
      dispatch?.({
        type: PROJECT_ACTION.UNPIN_PINNED_PROJECT,
        payload: projectId,
      } as ProjectActionType);
      notifyToast({
        id: toastId,
        type: 'success',
        message: t('pinnedProject.@unpinSuccess'),
      });
    } catch (error) {
      notifyToast({
        id: toastId,
        type: 'error',
        message: `${(error as Error).message}`,
      });
    }
  }, []);

  return { getPinnedProjects, handlePinProject, handleUnpinProject };
};
