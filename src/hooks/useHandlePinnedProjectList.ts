/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect } from 'react';
import { PinnedProjectActionType } from '@/shared/types/pegase/Project.type';
import { fetchPinnedProjects, pinProject, unpinProject } from '@/shared/services/pinnedProjectService';
import { PINNED_PROJECT_ACTION } from '@/shared/enum/project';
import { usePinnedProjectDispatch } from '@/store/contexts/ProjectContext.tsx';
import { v4 as uuidv4 } from 'uuid';
import { dismissToast, notifyToast, NotifyWithActionProps } from '@/shared/notification/notification.tsx';
import { useTranslation } from 'react-i18next';

export const useHandlePinnedProjectList = () => {
  const userId = 'me00247';
  const dispatch = usePinnedProjectDispatch();
  const { t } = useTranslation();

  const getPinnedProjects = useCallback(async () => {
    try {
      const projects = await fetchPinnedProjects(userId);
      if (projects?.length) {
        dispatch?.({
          type: PINNED_PROJECT_ACTION.INIT_LIST,
          payload: projects,
        } as PinnedProjectActionType);
      }
    } catch (error) {
      console.error('Error loading pinned projects:', error);
    }
  }, []);

  useEffect(() => {
    void getPinnedProjects();
  }, []);

  const handlePinProject = useCallback(async (projectId) => {
    const toastId = uuidv4();
    try {
      const newProject = await pinProject(projectId);

      if (newProject) {
        dispatch?.({
          type: PINNED_PROJECT_ACTION.ADD_ITEM,
          payload: newProject,
        } as PinnedProjectActionType);
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
        message: `${error.message}`,
      });
    }
  }, []);

  /**
   * Handles the unpin action. Displays a toast if the API call is successful.
   * The API call to the /unpin endpoint is made only if the "Cancel" button
   * on the toast is not clicked.
   *
   * @param {string} projectId - Project id
   * @param {ProjectInfo[]} pinnedProjects - Pinned project currently in BDD
   */
  const handleUnpinProject = useCallback(async (projectId, pinnedProjects) => {
    let apiCallTimeout: number | null = null;
    const toastId = uuidv4();
    const userId = 'me00247';

    dispatch?.({
      type: PINNED_PROJECT_ACTION.REMOVE_ITEM,
      payload: projectId,
    } as PinnedProjectActionType);

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
            type: PINNED_PROJECT_ACTION.INIT_LIST,
            payload: pinnedProjects,
          } as PinnedProjectActionType);
        },
      },
    } as NotifyWithActionProps);

    apiCallTimeout = setTimeout(() => {
      unpinProject(userId, projectId).catch((error) => {
        dispatch?.({
          type: PINNED_PROJECT_ACTION.INIT_LIST,
          payload: pinnedProjects,
        } as PinnedProjectActionType);

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
