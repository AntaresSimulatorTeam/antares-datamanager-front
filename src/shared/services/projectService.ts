/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { PROJECT_AUTOCOMPLETE_ENDPOINT, PROJECT_ENDPOINT, PROJECT_SEARCH_ENDPOINT } from '@/shared/const/apiEndPoint';
import { AuthService } from '@/shared/services/authService.ts';
import { BackendError, PaginatedResponse, ProjectInfo, ProjectResponse } from '@/shared/types';

/**
 * Delete project
 *
 * @param {string} projectId
 * @return {Promise<void>}
 */
export const deleteProjectById = async (projectId: string): Promise<void> => {
  try {
    await AuthService.authFetch(`${PROJECT_ENDPOINT}/${projectId}`, {
      method: 'DELETE',
    });
  } catch (error) {
    throw new Error(`${(error as BackendError)?.antaresErrorMessage}`);
  }
};

/**
 * Retrieve details of a project
 *
 * @param {string} projectId - Project id
 * @return {Promise<ProjectInfo>} - Project details
 */
export const fetchProjectDetails = async (projectId: string): Promise<ProjectInfo> => {
  try {
    const response = await AuthService.authFetch(`${PROJECT_ENDPOINT}/${projectId}`);

    return (await (response as Response).json()) as ProjectInfo;
  } catch (error) {
    throw new Error((error as BackendError).antaresErrorMessage);
  }
};

/**
 * Retrieve a project from a partial name of project
 *
 * @param {string} partialName - Partial name of a project
 * @return {Promise<ProjectInfo[]>} - List of project DTO
 */
export const fetchProjectsFromPartialName = async (partialName: string): Promise<ProjectInfo[]> => {
  const queryString = new URLSearchParams({
    partialName: partialName ?? '',
  }).toString();

  try {
    const response = await AuthService.authFetch(`${PROJECT_AUTOCOMPLETE_ENDPOINT}?${queryString}`);
    return (await (response as Response).json()) as ProjectInfo[];
  } catch (error) {
    throw new Error(`${(error as BackendError)?.antaresErrorMessage}`);
  }
};

/**
 * Retrieve a list of project from a user name
 *
 * @param {number} page
 * @param {number} size
 * @param {string | undefined} search - Text entered by a user or user id
 * @return {Promise<PaginatedResponse<ProjectResponse>>}
 */
export const fetchProjectFromSearchTerm = async (
  page: number,
  size: number,
  search: string,
): Promise<PaginatedResponse<ProjectResponse>> => {
  const queryString = new URLSearchParams({
    search: search ?? '',
    page: page != null ? (page + 1).toString() : '',
    size: size != null ? size.toString() : '',
  }).toString();
  const urlApi = `${PROJECT_SEARCH_ENDPOINT}?${queryString}`;
  try {
    const response = await AuthService.authFetch(urlApi);

    return (await (response as Response).json()) as PaginatedResponse<ProjectResponse>;
  } catch (error) {
    throw new Error(`${(error as BackendError).antaresErrorMessage}`);
  }
};

/**
 * Create a new project
 *
 * @param {Pick<ProjectInfo, 'name' | 'description' | 'tags'>} projectData - Body data request
 * @return {Promise<ProjectResponse>}
 */
export const createProject = async (
  projectData: Pick<ProjectInfo, 'name' | 'description' | 'tags'>,
): Promise<ProjectResponse> => {
  try {
    const response = await AuthService.authFetch(`${PROJECT_ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(projectData),
    });

    return (await (response as Response).json()) as ProjectResponse;
  } catch (error) {
    throw new Error(`${(error as BackendError)?.antaresErrorMessage}`);
  }
};

/**
 * Modify a project
 * @param {number} projectId
 * @param {Pick<ProjectResponse, 'name' | description' | 'tags'>} projectInfos
 * @return {ProjectResponse}
 */
export const updateProject = async (
  projectId: number,
  projectInfos: Pick<ProjectInfo, 'name' | 'description' | 'tags'>,
): Promise<ProjectResponse> => {
  try {
    const response = await AuthService.authFetch(`${PROJECT_ENDPOINT}?projectId=${projectId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(projectInfos),
    });
    return (await (response as Response).json()) as ProjectResponse;
  } catch (error) {
    throw new Error(`${(error as BackendError)?.antaresErrorMessage}`);
  }
};
