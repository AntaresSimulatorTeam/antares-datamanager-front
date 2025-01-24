/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { PaginatedResponse, StudyDTO } from '@/shared/types';
import { STUDY_SEARCH_ENDPOINT } from '@/shared/const/apiEndPoint';

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
  searchTerm = '',
  projectId = '',
  currentPage = 0,
  intervalSize = 0,
  sortBy?: { [key: string]: 'asc' | 'desc' },
): Promise<PaginatedResponse<StudyDTO>> => {
  let entries: [string, 'asc' | 'desc'] | null = null;
  if (sortBy && JSON.stringify(sortBy) !== '{}') {
    entries = Object.entries(sortBy)[0];
  }

  const apiUrl = `${STUDY_SEARCH_ENDPOINT}?page=${currentPage + 1}&size=${intervalSize}&projectId=${projectId}&search=${searchTerm}&sortColumn=${entries?.[0] ?? ''}&sortDirection=${entries?.[1] ?? ''}`;

  const response = await fetch(apiUrl);
  if (!response.ok) {
    throw new Error('Failed to fetch user studies');
  }
  const json: PaginatedResponse<StudyDTO> = await response.json();

  return { content: json.content, totalElements: json.totalElements };
};
