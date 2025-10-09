/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { BackendError, DbTrajectory, PaginatedResponse, StudyDTO } from '@/shared/types';
import { STUDY_GENERATE_ENDPOINT, STUDY_SEARCH_ENDPOINT, TRAJECTORY_ENDPOINT } from '@/shared/const/apiEndPoint';
import { STUDY_ENDPOINT, STUDY_KEYWORDS_SEARCH_ENDPOINT } from '@/shared/const/apiEndPoint.ts';
import { notifyToast } from '@/shared/notification/notification.tsx';
import { AuthService } from '@/shared/services/authService.ts';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';

/**
 * Retrieve a list of studies from a term
 *
 * @param {string} searchTerm - Search term (ex: a user name)
 * @param {string} projectId - Project id related to a study
 * @param {number} currentPage - Current page number
 * @param {number} intervalSize - Number of items per page
 * @param {{ [key: string]: 'asc' | 'desc' })} sortBy - Object that describes the sorting type (ascending or descending) of a column
 *
 * @return {Promise<PaginatedResponse<StudyDTO>>} - Promise object that represents a list of studies
 * @throws {Error}
 */
export const fetchSearchStudies = async (
  searchTerm: string = '',
  projectId: string = '',
  currentPage: number = 0,
  intervalSize: number = 0,
  sortBy?: { [key: string]: 'asc' | 'desc' },
): Promise<PaginatedResponse<StudyDTO>> => {
  try {
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

    if (!(response as Response).ok) {
      throw new Error('Failed to fetch user studies');
    }
    const json = (await (response as Response).json()) as PaginatedResponse<StudyDTO>;

    return { content: json.content, totalElements: json.totalElements };
  } catch (error) {
    throw new Error('Failed to fetch user studies');
  }
};

/**
 * Retrieve a list of suggested keywords from a partial name of a study
 *
 * @param {string} partialName - Partial name of a study
 * @return {Promise<string[]>} - Promise object that represents a list of keywords
 * @throws {Error}
 */
export const fetchSuggestedKeywords = async (partialName: string): Promise<string[]> => {
  const queryString = new URLSearchParams({
    partialName: partialName ?? '',
  }).toString();

  try {
    const response = await AuthService.authFetch(`${STUDY_KEYWORDS_SEARCH_ENDPOINT}?${queryString}`);
    return (await (response as Response).json()) as string[];
  } catch {
    throw new Error('Failed to fetch suggested keywords');
  }
};

/**
 * Create a study
 * Display toast if creation succeeds or fails
 *
 * @param {Omit<StudyDTO, 'id' | 'status' | 'creationDate'>} studyData - Partial study data
 * @return {Promise<void>}
 */
export const saveStudy = async (
  studyData: Omit<StudyDTO, 'id' | 'status' | 'creationDate' | 'projectId'> & { id: number | undefined },
): Promise<void> => {
  try {
    await AuthService.authFetch(`${STUDY_ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(studyData),
    });
  } catch (error) {
    throw new Error((error as BackendError).antaresErrorMessage);
  }
};

/**
 * A function to update an existing study by making an asynchronous HTTP PUT request to the server.
 * It sends the updated study data as JSON and displays a notification upon success or failure.
 *
 * @param {StudyDTO} studyData - The updated study data to be sent to the server.
 * @param {number} studyId - The unique identifier of the study to be updated.
 * @returns {Promise<void>} A promise that resolves when the update operation is completed.
 * @throws {BackendError} Throws an error if the update fails on the server-side.
 */
export const updateStudy = async (studyData: StudyDTO, studyId: number): Promise<void> => {
  try {
    await AuthService.authFetch(`${STUDY_ENDPOINT}/${studyId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(studyData),
    });
  } catch (error) {
    throw new Error((error as BackendError).antaresErrorMessage);
  }
};

/**
 * Delete a study
 * Display toast if deletion succeeds or fails
 *
 * @param {number} id - Study id
 * @return {Promise<void>}
 */
export const deleteStudy = async (id: number): Promise<void> => {
  try {
    await AuthService.authFetch(`${STUDY_ENDPOINT}/${id}`, {
      method: 'DELETE',
    });
    notifyToast({
      type: 'success',
      message: 'Study deleted successfully',
    });
  } catch (error: unknown) {
    notifyToast({
      type: 'error',
      message: `${(error as BackendError).antaresErrorMessage}`,
    });
  }
};

/**
 * Generate a study
 *
 * @param {number} id - Study id
 * @throws {Error}
 */
export const createStudy = async (id: number): Promise<void> => {
  const urlApi = `${STUDY_GENERATE_ENDPOINT}?id=${id}`;
  try {
    await AuthService.authFetch(urlApi, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    throw new Error((error as BackendError).antaresErrorMessage);
  }
};

/**
 * Fetch trajectories linked to a study
 * @param {number} studyId - Study id
 * @param {TRAJECTORY_TYPE} trajectoryType - Trajectory type
 *
 * @return {Promise<DbTrajectory[]>} Array of trajectories (data base trajectories)
 * @throws {Error}
 */

export const getStudyTrajectories = async (
  studyId: number,
  trajectoryType?: TRAJECTORY_TYPE,
): Promise<DbTrajectory[]> => {
  const urlApi = `${TRAJECTORY_ENDPOINT}?studyId=${studyId}&trajectoryType=${trajectoryType ?? ''}`;

  try {
    const response = await AuthService.authFetch(urlApi);

    return (await (response as Response).json()) as DbTrajectory[];
  } catch (error) {
    throw new Error((error as BackendError).antaresErrorMessage);
  }
};

/**
 * Retrieve study data by id
 *
 * @param {number} studyId - Study id
 * @return {Promise<StudyDTO>} Study object
 * @throws {Error}
 */
export const getStudyById = async (studyId: number): Promise<StudyDTO> => {
  const urlApi = `${STUDY_ENDPOINT}/${studyId}`;
  try {
    const response = await AuthService.authFetch(urlApi);
    return (await (response as Response).json()) as StudyDTO;
  } catch (error) {
    throw new Error((error as BackendError).antaresErrorMessage);
  }
};

/**
 * Duplicate a study
 * Throws error if duplication fails, displays success toast if successful
 *
 * @param {Omit<StudyDTO, 'id' | 'status' | 'creationDate' | 'projectId'>} studyData - Partial study data
 * @return {Promise<void>}
 * @throws {Error} If duplication fails
 */
export const duplicateStudy = async (
  studyData: Omit<StudyDTO, 'id' | 'status' | 'creationDate' | 'projectId'>,
): Promise<void> => {
  try {
    await AuthService.authFetch(`${STUDY_ENDPOINT}/duplicate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(studyData),
    });
  } catch (error) {
    throw new Error((error as BackendError).antaresErrorMessage);
  }
};
