/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { PaginatedResponse, StudyDTO } from '@/shared/types';
import { STUDY_GENERATE_ENDPOINT, STUDY_SEARCH_ENDPOINT } from '@/shared/const/apiEndPoint';
import { STUDY_ENDPOINT, STUDY_KEYWORDS_SEARCH_ENDPOINT } from '@/shared/const/apiEndPoint.ts';
import { notifyToast } from '@/shared/notification/notification.tsx';
import { authFetch } from '@/shared/services/authService.ts';

/**
 * Retrieve a list of studies from a term
 *
 * @param {string} searchTerm - Search term (ex: a user name)
 * @param {string} projectId - Project id related to a study
 * @param {number} currentPage - Current page number
 * @param {number} intervalSize - Number of items per page
 * @param {string | undefined} accessToken - Access token of the user
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
  accessToken?: string,
): Promise<PaginatedResponse<StudyDTO> | Error> => {
  let entries: [string, 'asc' | 'desc'] | null = null;
  if (sortBy && JSON.stringify(sortBy) !== '{}') {
    entries = Object.entries(sortBy)[0];
  }

  const apiUrl = `${STUDY_SEARCH_ENDPOINT}?page=${currentPage + 1}&size=${intervalSize}&projectId=${projectId}&search=${searchTerm}&sortColumn=${entries?.[0] ?? ''}&sortDirection=${entries?.[1] ?? ''}`;

  const response = await authFetch(apiUrl, accessToken);
  if (!response.ok) {
    throw new Error('Failed to fetch user studies');
  }
  const json = (await response.json()) as PaginatedResponse<StudyDTO>;

  return { content: json.content, totalElements: json.totalElements };
};

/**
 * Retrieve a list of suggested keywords from a partial name of a study
 *
 * @param {string} query - Partial name of a study
 * @param {string | undefined} accessToken - Access token of the user
 * @return {Promise<string[] | Error>} - Promise object that represents a list of keywords
 */
export const fetchSuggestedKeywords = async (query: string, accessToken?: string): Promise<string[] | Error> => {
  const response = await authFetch(`${STUDY_KEYWORDS_SEARCH_ENDPOINT}?partialName=${query}`, accessToken);
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
 * @param {string | undefined} accessToken - Access token of the user
 * @return {Promise<void | Error>}
 */
export const saveStudy = async (
  studyData: Omit<StudyDTO, 'id' | 'status' | 'creationDate'>,
  accessToken?: string,
): Promise<void | Error> => {
  try {
    const response = await authFetch(`${STUDY_ENDPOINT}`, accessToken, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(studyData),
    });
    if (!response.ok) {
      const errorText = await response.text();
      const errorData = JSON.parse(errorText) as Error;
      throw new Error(`${errorData.message || errorText}`);
    }
    notifyToast({
      type: 'success',
      message: 'Study created successfully',
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      notifyToast({
        type: 'error',
        message: `${error.message}`,
      });
    }
  }
};

/**
 * Delete a study
 * Display toast if deletion succeeds or fails
 *
 * @param {number} id - Study id
 * @param {string | undefined} accessToken - Access token of the user
 * @return {Promise<void | Error>}
 */
export const deleteStudy = async (id: number, accessToken?: string): Promise<void | Error> => {
  try {
    const response = await authFetch(`${STUDY_ENDPOINT}/${id}`, accessToken, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText);
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
 * @param {string | undefined} accessToken - Access token of the user
 */
export const createStudy = async (id: number, accessToken?: string) => {
  const urlApi = `${STUDY_GENERATE_ENDPOINT}?id=${id}`;
  const response = await authFetch(urlApi, accessToken, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error('Failed to generate a study');
  }
};
