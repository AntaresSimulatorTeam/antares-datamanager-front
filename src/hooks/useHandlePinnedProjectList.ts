/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect } from 'react';
import { ProjectActionType, ProjectInfo } from '@/shared/types/Project.type';
import { fetchPinnedProjects, pinProject, unpinProject } from '@/shared/services/pinnedProjectService';
import { v4 as uuidv4 } from 'uuid';
import { dismissToast, notifyToast, NotifyWithActionProps } from '@/shared/notification/notification.tsx';
import { useTranslation } from 'react-i18next';
import { useProjectDispatch } from '@/store/contexts/ProjectContext';
import { PROJECT_ACTION } from '@/shared/enum/project.ts';
import { useAuth } from 'react-oidc-context';

export const useHandlePinnedProjectList = () => {
  const userId = 'me00247';
  const dispatch = useProjectDispatch();
  const { t } = useTranslation();
  const { user } = useAuth();

  const getPinnedProjects = useCallback(async () => {
    try {
      const projects = (await fetchPinnedProjects(userId, user?.access_token)) as ProjectInfo[];
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
      const newProject = await pinProject(projectId, user?.access_token);
      if (newProject) {
        dispatch?.({
          type: PROJECT_ACTION.ADD_PINNED_PROJECT,
          payload: newProject,
        } as ProjectActionType);
      }

      notifyToast({
        id: toastId,
        type: 'success',
        message: 'Project pinned successfully',
      });
    } catch (error: unknown) {
      notifyToast({
        id: toastId,
        type: 'error',
        message: 'Project already pinned',
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
    let apiCallTimeout: number | null = null;
    const toastId = uuidv4();
    const userId = 'me00247';
    const currentPinnedProjects = await fetchPinnedProjects(userId, user?.access_token);

    dispatch?.({
      type: PROJECT_ACTION.UNPIN_PINNED_PROJECT,
      payload: projectId,
    } as ProjectActionType);

    notifyToast({
      id: toastId,
      type: 'info',
      message: t('components.quickAccess.@confirmUnpin', { name: projectId }),
      action: {
        label: t('components.quickAccess.@cancel'),
        onClick: () => {
          dismissToast(toastId);
          clearTimeout(apiCallTimeout!);
          dispatch?.({
            type: PROJECT_ACTION.INIT_PINNED_PROJECT_LIST,
            payload: currentPinnedProjects,
          } as ProjectActionType);
        },
      },
    } as NotifyWithActionProps);

    apiCallTimeout = setTimeout(() => {
      unpinProject(userId, projectId, user?.access_token).catch((error) => {
        dispatch?.({
          type: PROJECT_ACTION.INIT_PINNED_PROJECT_LIST,
          payload: currentPinnedProjects,
        } as ProjectActionType);

        notifyToast({
          id: toastId,
          type: 'error',
          message: `${error.message}`,
        });
      });
    }, 4000) as unknown as number;
  }, []);

  return { getPinnedProjects, handlePinProject, handleUnpinProject };
};
