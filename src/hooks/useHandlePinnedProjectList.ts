/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect } from 'react';
import { PinnedProjectActionType } from '@/shared/types/pegase/Project.type';
import { fetchPinnedProjects, pinProject, removeProjectFromPinnedList } from '@/shared/services/projectService';
import { useTranslation } from 'react-i18next';
import { usePinnedProjectDispatch } from '@/store/contexts/ProjectContext';
import { PINNED_PROJECT_ACTION } from '@/shared/enum/project';
import { v4 as uuidv4 } from 'uuid';
import { dismissToast, notifyToast, NotifyWithActionProps } from '@/shared/notification/notification';

export const useHandlePinnedProjectList = () => {
  const { t } = useTranslation();
  const userId = 'me00247';
  const dispatch = usePinnedProjectDispatch();

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

  /**
   * Handles the unpin action. Displays a toast if the API call is successful.
   * The API call to the /unpin endpoint is made only if the "Cancel" button
   * on the toast is not clicked.
   *
   * @param {string} projectId - Project id
   */
  const handleUnpinProject = useCallback(
    async (projectId: string) => {
      let apiCallTimeout: number | null = null;
      const toastId = uuidv4();
      const currentPinnedProjects = await fetchPinnedProjects(userId);

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
              payload: currentPinnedProjects,
            } as PinnedProjectActionType);
          },
        },
      } as NotifyWithActionProps);

      apiCallTimeout = setTimeout(() => {
        removeProjectFromPinnedList(userId, projectId).catch(() => {
          dispatch?.({
            type: PINNED_PROJECT_ACTION.INIT_LIST,
            payload: currentPinnedProjects,
          } as PinnedProjectActionType);
        });
      }, 4000) as unknown as number;
    },
    [userId],
  );

  /**
   * Handles the pin action. Displays a toast if the API call is successful.
   * The API call to the /unpin endpoint is made only if the "Cancel" button
   * on the toast is not clicked.
   *
   * @param {string} projectId - Project id
   */
  const handlePinProject = useCallback(async (projectId: string) => {
    try {
      const newProject = await pinProject(projectId);
      if (newProject) {
        dispatch?.({
          type: PINNED_PROJECT_ACTION.ADD_ITEM,
          payload: newProject,
        } as PinnedProjectActionType);
      }
    } catch (error) {}
  }, []);

  return { getPinnedProjects, handleUnpinProject, handlePinProject };
};
