/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { notifyToast } from '@/shared/notification/notification';
import { PROJECT_AUTOCOMPLETE_ENDPOINT, PROJECT_ENDPOINT } from '@/shared/const/apiEndPoint';

export const deleteProjectById = async (projectId: string) => {
  const response = await fetch(`${PROJECT_ENDPOINT}/${projectId}`, {
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
};

/**
 * Retrieve details of a project
 *
 * @param {string} projectId - Project id
 * @return {Promise<ProjectInfo>} - Project details
 */
export const fetchProjectDetails = async (projectId: string) => {
  const response = await fetch(`${PROJECT_ENDPOINT}/${projectId}`);

  if (!response?.ok) {
    throw new Error('Failed to fetch project details');
  }

  return await response.json();
};

/**
 * Retrieve a project from a partial name of project
 *
 * @param {string} query - Partial name of a project
 * @return {Promise<string[]>} - List of project name
 */
export const fetchProjectsFromPartialName = async (query: string): Promise<string[]> => {
  const response = await fetch(`${PROJECT_AUTOCOMPLETE_ENDPOINT}?partialName=${query}`);
  if (!response.ok) {
    throw new Error('Failed to fetch projects');
  }
  const data = await response.json();
  return data.map((project: { name: string }) => project.name);
};
