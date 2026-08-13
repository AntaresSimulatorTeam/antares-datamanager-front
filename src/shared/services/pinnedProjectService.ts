/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { PROJECT_PIN_ENDPOINT, PROJECT_PINNED_ENDPOINT, PROJECT_UNPIN_ENDPOINT } from '@/shared/const/apiEndPoint';
import { ProjectInfo } from '@/shared/types/Project.type.ts';
import { AuthService } from '@/shared/services/authService.ts';
import { BackendError } from '@/shared/types';
import { DEFAULT_USER } from '@/shared/const/authConfig.ts';

/**
 * Retrieve pinned projects list by user id
 *
 * @param {string | undefined} userId - User id
 * @returns {Promise<ProjectInfo[]>} - Promise object that represents a list of projects
 */
export const fetchPinnedProjects = async (userId: string | undefined): Promise<ProjectInfo[]> => {
  const apiUrl = `${PROJECT_PINNED_ENDPOINT}?userId=${userId ?? DEFAULT_USER}`;
  try {
    const response = await AuthService.authFetch(apiUrl);
    const json = (await (response as Response).json()) as Partial<ProjectInfo>[];
    return json.map((project: Partial<ProjectInfo>) => ({
      ...project,
      pinned: project.pinned ?? true,
    })) as ProjectInfo[];
  } catch (error) {
    throw new Error(`${(error as BackendError)?.antaresErrorMessage}`);
  }
};

/**
 * Handles the pin action. Displays a toast if the API call is successful.
 * The API call to the /unpin endpoint is made only if the "Cancel" button
 * on the toast is not clicked.
 *
 * @param {number} projectId - Project id
 * @param {string | undefined} userId
 *
 * @return {Promise<ProjectInfo>} - Object that describes a project
 */

export const pinProject = async (projectId: number, userId: string | undefined): Promise<ProjectInfo> => {
  const apiUrl = `${PROJECT_PIN_ENDPOINT}?userId=${userId ?? DEFAULT_USER}&projectId=${projectId}`;
  try {
    const response = await AuthService.authFetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return (await (response as Response).json()) as ProjectInfo;
  } catch (error) {
    throw new Error(`${(error as BackendError)?.antaresErrorMessage}`);
  }
};

/**
 * Remove pinned project from the pinned project list
 *
 * @param {number} projectId
 * @param {string | undefined} userId
 */
export const unpinProject = async (projectId: number, userId: string | undefined): Promise<void> => {
  const apiUrl = `${PROJECT_UNPIN_ENDPOINT}?userId=${userId ?? DEFAULT_USER}&projectId=${projectId}`;

  try {
    await AuthService.authFetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    throw new Error(`${(error as BackendError)?.antaresErrorMessage}`);
  }
};
