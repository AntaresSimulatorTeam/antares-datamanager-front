/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { notifyToast } from '@/shared/notification/notification';
import { getEnvVariables } from '@/envVariables';
import { ProjectInfo } from '@/shared/types/pegase/Project.type';
import { PROJECT_PINNED_ENDPOINT, PROJECT_UNPIN_ENDPOINT } from '@/shared/const/apiEndPoint';

export const pinProject = async (projectId: string): Promise<ProjectInfo | Error> => {
  const userId = 'me00247';
  const BASE_URL = getEnvVariables('VITE_BACK_END_BASE_URL');

  try {
    const response = await fetch(`${BASE_URL}/v1/project/pin?userId=${userId}&projectId=${projectId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      const errorData = JSON.parse(errorText);
      throw new Error(`${errorData.message || errorText}`);
    }
    notifyToast({
      type: 'success',
      message: 'Project pinned successfully',
    });

    return await response.json();
  } catch (error: any) {
    notifyToast({
      type: 'error',
      message: `${error.message}`,
    });
  }
};

export const deleteProjectById = async (projectId: string) => {
  const BASE_URL = getEnvVariables('VITE_BACK_END_BASE_URL');

  try {
    const response = await fetch(`${BASE_URL}/v1/project/${projectId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      const errorData = JSON.parse(errorText);
      throw new Error(`${errorData.message || errorText}`);
    }
    notifyToast({
      type: 'success',
      message: 'Project deleted successfully',
    });
  } catch (error: any) {
    notifyToast({
      type: 'error',
      message: `${error.message}`,
    });
  }
};

/**
 * Retrieve pinned projects list by user id
 *
 * @param {string} userId - User id
 *
 * @returns {Promise<ProjectInfo[]>} - Promise object that represents a list of projects
 */
export const fetchPinnedProjects = async (userId: string): Promise<ProjectInfo[]> => {
  const apiUrl = `${PROJECT_PINNED_ENDPOINT}?userId=${userId}`;

  const response = await fetch(apiUrl);
  const json = await response.json();
  return json.map((project: any) => ({
    ...project,
    projectId: project.id.toString(),
    pinned: project.pinned ?? true,
  }));
};

/**
 * Remove pinned project from the pinned project list
 *
 * @param {string} userId
 * @param {string} projectId
 */
export const removeProjectFromPinnedList = async (userId: string, projectId: string) => {
  const apiUrl = `${PROJECT_UNPIN_ENDPOINT}?userId=${userId}&projectId=${projectId}`;
  await fetch(apiUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export const fetchProjectDetails = async (projectId: string) => {
  const BASE_URL = getEnvVariables('VITE_BACK_END_BASE_URL');

  const response = await fetch(`${BASE_URL}/v1/project/${projectId}`);

  if (!response?.ok) {
    throw new Error('Failed to fetch project details');
  }

  return await response.json();
};
