/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { PaginatedResponse, StudyDTO } from '@/shared/types';
import { STUDY_SEARCH_ENDPOINT } from '@/shared/const/apiEndPoint';
import { STUDY_ENDPOINT, STUDY_KEYWORDS_SEARCH_ENDPOINT } from '@/shared/const/apiEndPoint.ts';
import { notifyToast } from '@/shared/notification/notification.tsx';
import { AuthService } from '@/shared/services/auth/authService';

/**
 * Retrieve a list of studies from a term
 *
 * @param {string} searchTerm - Search term (ex: a user name)
 * @param {string} projectId - Project id related to a study
 * @param {number} currentPage - Current page number
 * @param {number} intervalSize - Number of items per page
 * @param {{ [key: string]: 'asc' | 'desc' })} sortBy - Object that describes the sorting type (ascending or descending) of a column
 *
 * @returns {Promise<PaginatedResponse<StudyDTO>>} - Promise object that represents a list of studies
 */
export const fetchSearchStudies = async (
  searchTerm: string = '',
  projectId: string = '',
  currentPage: number = 0,
  intervalSize: number = 0,
  sortBy?: { [key: string]: 'asc' | 'desc' },
): Promise<PaginatedResponse<StudyDTO>> => {
  let entries: [string, 'asc' | 'desc'] | null = null;
  if (sortBy && JSON.stringify(sortBy) !== '{}') {
    entries = Object.entries(sortBy)[0];
  }

  const apiUrl = `${STUDY_SEARCH_ENDPOINT}?page=${currentPage + 1}&size=${intervalSize}&projectId=${projectId}&search=${searchTerm}&sortColumn=${entries?.[0] ?? ''}&sortDirection=${entries?.[1] ?? ''}`;

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
 * @param {string} query - Partial name of a study
 *
 * @returns {Promise<string[]>} - Promise object that represents a list of keywords
 */
export const fetchSuggestedKeywords = async (query: string): Promise<string[]> => {
  const response = await AuthService.authFetch(`${STUDY_KEYWORDS_SEARCH_ENDPOINT}?partialName=${query}`);
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
 * @param {function} toggleModal - Handle toggle of opening modal boolean
 */
export const saveStudy = async (
  studyData: Omit<StudyDTO, 'id' | 'status' | 'creationDate'>,
  toggleModal: () => void,
): Promise<void | Error> => {
  try {
    const response = await AuthService.authFetch(`${STUDY_ENDPOINT}`, {
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
    toggleModal();
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
 */
export const deleteStudy = async (id: number): Promise<void | Error> => {
  try {
    const response = await AuthService.authFetch(`${STUDY_ENDPOINT}/${id}`, {
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
