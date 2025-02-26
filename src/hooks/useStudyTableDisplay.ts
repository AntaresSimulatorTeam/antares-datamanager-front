/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { PaginatedResponse, StudyDTO } from '@/shared/types';
import { fetchSearchStudies } from '@/shared/services/studyService.ts';

const ITEMS_PER_PAGE = 9;
const PAGINATION_CURRENT = 0;
const intervalSize = ITEMS_PER_PAGE;

interface UseStudyTableDisplayProps {
  searchTerm: string | undefined;
  projectId?: string;
  sortBy: { [key: string]: 'asc' | 'desc' };
  reloadStudies: boolean;
}

interface UseStudyTableDisplayReturn {
  rows: StudyDTO[];
  count: number;
  intervalSize: number;
  currentPage: number;
  setPage: Dispatch<SetStateAction<number>>;
  error: unknown;
}

export const useStudyTableDisplay = ({
  searchTerm,
  projectId,
  sortBy,
  reloadStudies,
}: UseStudyTableDisplayProps): UseStudyTableDisplayReturn => {
  const [rows, setRows] = useState<StudyDTO[]>([]);
  const [count, setCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [errorValue, setErrorValue] = useState<Error | null>(null);

  useEffect(() => {
    setCurrentPage(PAGINATION_CURRENT);
  }, []);

  useEffect(() => {
    fetchSearchStudies(searchTerm, projectId, currentPage, intervalSize, sortBy)
      .then((json) => {
        const { content, totalElements } = json as PaginatedResponse<StudyDTO>;
        setRows(content);
        setCount(totalElements);
      })
      .catch((error: unknown) => setErrorValue(error as Error));
  }, [currentPage, searchTerm, projectId, sortBy, reloadStudies]);

  return { rows, count, intervalSize, currentPage, setPage: setCurrentPage, error: errorValue };
};
