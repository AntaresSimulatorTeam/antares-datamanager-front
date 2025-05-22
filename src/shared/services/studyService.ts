/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { DbTrajectory, PaginatedResponse, StudyDTO } from '@/shared/types';
import { STUDY_GENERATE_ENDPOINT, STUDY_SEARCH_ENDPOINT, TRAJECTORY_ENDPOINT } from '@/shared/const/apiEndPoint';
import { STUDY_ENDPOINT, STUDY_KEYWORDS_SEARCH_ENDPOINT } from '@/shared/const/apiEndPoint.ts';
import { notifyToast } from '@/shared/notification/notification.tsx';
import { AuthService } from '@/shared/services/authService.ts';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { handleBackendErrorToast } from '../utils/errrorHandler';

/**
 * Retrieve a list of studies from a term
 *
 * @param {string} searchTerm - Search term (ex: a user name)
 * @param {string} projectId - Project id related to a study
 * @param {number} currentPage - Current page number
 * @param {number} intervalSize - Number of items per page
 * @param {{ [key: string]: 'asc' | 'desc' })} sortBy - Object that describes the sorting type (ascending or descending) of a column
 *
 * @return {Promise<PaginatedResponse<StudyDTO> | Error>} - Promise object that represents a list of studies
 */
export const fetchSearchStudies = async (
  searchTerm: string = '',
  projectId: string = '',
  currentPage: number = 0,
  intervalSize: number = 0,
  sortBy?: { [key: string]: 'asc' | 'desc' },
): Promise<PaginatedResponse<StudyDTO> | Error> => {
  let entries: [string, 'asc' | 'desc'] | null = null;
  if (sortBy && JSON.stringify(sortBy) !== '{}') {
    entries = Object.entries(sortBy)[0];
  }

  const queryString = new URLSearchParams({
    page: currentPage != null ? (currentPage + 1).toString() : '',
    size: intervalSize.toString(),
    projectId: projectId.toString(),
    search: searchTerm.toString(),
    sortColumn: entries?.[0] ? entries[0].toString() : '',
    sortDirection: entries?.[1] ? entries[1].toString() : '',
  }).toString();
  const apiUrl = `${STUDY_SEARCH_ENDPOINT}?${queryString}`;

  const response = await AuthService.authFetch(apiUrl);
  if (!response.ok) {
    throw new Error('Failed to fetch user studies');
  }
  const json = (await response.json()) as PaginatedResponse<StudyDTO>;

  return { content: json.content, totalElements: json.totalElements };
};

/**
 * Retrieve a list of suggested keywords from a partial name of a study
 *
 * @param {string} partialName - Partial name of a study
 * @return {Promise<string[] | Error>} - Promise object that represents a list of keywords
 */
export const fetchSuggestedKeywords = async (partialName: string): Promise<string[] | Error> => {
  const queryString = new URLSearchParams({
    partialName: partialName ?? '',
  }).toString();

  const response = await AuthService.authFetch(`${STUDY_KEYWORDS_SEARCH_ENDPOINT}?${queryString}`);
  if (!response.ok) {
    throw new Error('Failed to fetch suggested keywords');
  }
  return (await response.json()) as string[];
};

/**
 * Create a study
 * Display toast if creation succeeds or fails
 *
 * @param {Omit<StudyDTO, 'id' | 'status' | 'creationDate'>} studyData - Partial study data
 * @return {Promise<void>}
 */
export const saveStudy = async (
  studyData: Omit<StudyDTO, 'id' | 'status' | 'creationDate'>
): Promise<void> => {
  const response = await AuthService.authFetch(`${STUDY_ENDPOINT}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(studyData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    const errorMessage = handleBackendErrorToast(errorText);
    throw new Error(errorMessage);
  }

  notifyToast({
    type: 'success',
    message: 'Study created successfully',
  });
};
/**
 * Delete a study
 * Display toast if deletion succeeds or fails
 *
 * @param {number} id - Study id
 * @return {Promise<void | Error>}
 */
export const deleteStudy = async (id: number): Promise<void | Error> => {
  try {
    const response = await AuthService.authFetch(`${STUDY_ENDPOINT}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const errorText = await response.text();
      const errorMessage = handleBackendErrorToast(errorText);
      throw new Error(errorMessage);
    }
    notifyToast({
      type: 'success',
      message: 'Study deleted successfully',
    });
  } catch (error: unknown) {
    notifyToast({
      type: 'error',
      message: `${(error as Error).message}`,
    });
  }
};

/**
 * Generate a study
 *
 * @param {number} id - Study id
 */
export const createStudy = async (id: number) => {
  const urlApi = `${STUDY_GENERATE_ENDPOINT}?id=${id}`;
  const response = await AuthService.authFetch(urlApi, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error('Failed to generate a study');
  }
};

/**
 * Fetch trajectories linked to a study
 * @param {number} studyId - Study id
 * @param {TRAJECTORY_TYPE} trajectoryType - Trajectory type
 *
 * @return {Promise<DbTrajectory[] | Error>} Array of trajectories (data base trajectories)
 */

export const getStudyTrajectories = async (
  studyId: number,
  trajectoryType?: TRAJECTORY_TYPE,
): Promise<DbTrajectory[] | Error> => {
  const urlApi = `${TRAJECTORY_ENDPOINT}?studyId=${studyId}&trajectoryType=${trajectoryType ?? ''}`;

  const response = await AuthService.authFetch(urlApi);
  if (!response.ok) {
    throw new Error('Failed to fetch trajectories linked to studies');
  }

  return (await response.json()) as DbTrajectory[];
};

/**
 * Retrieve study data by id
 *
 * @param {number} studyId - Study id
 * @return {Promise<StudyDTO | Error>} Study object
 */
export const getStudyById = async (studyId: number): Promise<StudyDTO | Error> => {
  const urlApi = `${STUDY_ENDPOINT}/${studyId}`;
  const response = await AuthService.authFetch(urlApi);
  if (!response.ok) {
    throw new Error('Failed to fetch study');
  }

  return (await response.json()) as StudyDTO;
};
