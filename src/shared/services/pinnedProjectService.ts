/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { PROJECT_PIN_ENDPOINT, PROJECT_PINNED_ENDPOINT, PROJECT_UNPIN_ENDPOINT } from '@/shared/const/apiEndPoint';
import { ProjectInfo } from '@/shared/types/Project.type.ts';
import { AuthService } from '@/shared/services/authService.ts';

/**
 * Retrieve pinned projects list by user id
 *
 * @param {string} userId - User id
 * @returns {Promise<ProjectInfo[] | Error>} - Promise object that represents a list of projects
 */
export const fetchPinnedProjects = async (userId: string): Promise<ProjectInfo[] | Error> => {
  const apiUrl = `${PROJECT_PINNED_ENDPOINT}?userId=${userId}`;

  const response = await AuthService.authFetch(apiUrl);

  if (!response?.ok) {
    throw new Error('Failed to fetch project details');
  }

  const json = (await response.json()) as Partial<ProjectInfo>[];
  return json.map((project: Partial<ProjectInfo>) => ({
    ...project,
    projectId: project.id?.toString(),
    pinned: project.pinned ?? true,
  })) as ProjectInfo[];
};

/**
 * Handles the pin action. Displays a toast if the API call is successful.
 * The API call to the /unpin endpoint is made only if the "Cancel" button
 * on the toast is not clicked.
 *
 * @param {string} projectId - Project id
 * @return {Promise<ProjectInfo | Error>} - Object that describes a project
 */

export const pinProject = async (projectId: string): Promise<ProjectInfo | Error> => {
  const userId = 'me00247';
  const apiUrl = `${PROJECT_PIN_ENDPOINT}?userId=${userId}&projectId=${projectId}`;

  const response = await AuthService.authFetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`${errorText}`);
  }

  return (await response.json()) as ProjectInfo;
};

/**
 * Remove pinned project from the pinned project list
 *
 * @param {string} userId
 * @param {string} projectId
 */
export const unpinProject = async (userId: string, projectId: string) => {
  const apiUrl = `${PROJECT_UNPIN_ENDPOINT}?userId=${userId}&projectId=${projectId}`;

  const response = await AuthService.authFetch(apiUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`${errorText}`);
  }
};
