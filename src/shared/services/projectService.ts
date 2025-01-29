/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { PROJECT_AUTOCOMPLETE_ENDPOINT, PROJECT_ENDPOINT, PROJECT_SEARCH_ENDPOINT } from '@/shared/const/apiEndPoint';
import { AuthService } from '@/shared/services/auth/authService';
import { ProjectInfo, ProjectResponse } from '@/shared/types/pegase/Project.type.ts';

/**
 * Delete project from project list
 *
 * @param {string} projectId - Project id
 * @return {Promise<void | Error>}
 */
export const deleteProjectById = async (projectId: string): Promise<void | Error> => {
  const response = await AuthService.authFetch(`${PROJECT_ENDPOINT}/${projectId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    const errorData = JSON.parse(errorText) as Error;
    throw new Error(`${errorData.message || errorText}`);
  }
};

/**
 * Retrieve details of a project
 *
 * @param {string} projectId - Project id
 * @return {Promise<ProjectInfo | Error>} - Project details
 */
export const fetchProjectDetails = async (projectId: string): Promise<ProjectInfo | Error> => {
  const response = await AuthService.authFetch(`${PROJECT_ENDPOINT}/${projectId}`);

  if (!response?.ok) {
    throw new Error('Failed to fetch project details');
  }

  return (await response.json()) as ProjectInfo;
};

/**
 * Retrieve a project from a partial name of project
 *
 * @param {string} query - Partial name of a project
 * @return {Promise<string[] | Error>} - List of project name
 */
export const fetchProjectsFromPartialName = async (query: string): Promise<string[] | Error> => {
  const response = await AuthService.authFetch(`${PROJECT_AUTOCOMPLETE_ENDPOINT}?partialName=${query}`);
  if (!response.ok) {
    throw new Error('Failed to fetch projects');
  }
  const data = (await response.json()) as ProjectInfo[];
  return data.map((project: { name: string }) => project.name);
};

/**
 * Retrieve a list of project from a user name
 *
 * @param {string} searchTerm
 * @param {number} current
 * @param {number} intervalSize
 * @retuns{Promise<ProjectInfo[] | Error>}
 */
export const fetchProjectFromSearchTerm = async (
  searchTerm: string,
  current: number,
  intervalSize: number,
): Promise<ProjectInfo[] | Error> => {
  const response = await AuthService.authFetch(
    `${PROJECT_SEARCH_ENDPOINT}?page=${current + 1}&size=${intervalSize}&search=${searchTerm || ''}`,
  );

  return (await response.json()) as ProjectInfo[];
};

/**
 * Create a new project
 *
 * @param {Pick<ProjectInfo, 'name' | 'description' | 'tags'>} projectData - Body data request
 * @return {Promise<ProjectResponse | Error>}
 */
export const createProject = async (
  projectData: Pick<ProjectInfo, 'name' | 'description' | 'tags'>,
): Promise<ProjectResponse | Error> => {
  const apiUrl = `${PROJECT_ENDPOINT}`;

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(projectData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    const errorData = JSON.parse(errorText);
    throw new Error(`${errorData.message}`);
  }
  return await response.json();
};
