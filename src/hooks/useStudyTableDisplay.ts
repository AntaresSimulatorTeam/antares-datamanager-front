/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useEffect, useState } from 'react';
import { ProjectInfo, StudyDTO } from '@/shared/types';
import { fetchSearchStudies } from '@/shared/services/studyService.ts';

const ITEMS_PER_PAGE = 12;
const PAGINATION_CURRENT = 0;
const intervalSize = ITEMS_PER_PAGE;

interface UseStudyTableDisplayProps {
  searchTerm: string | undefined;
  projectInfo?: ProjectInfo;
  sortBy: { [key: string]: 'asc' | 'desc' };
  page: number;
  reloadStudies: number;
}

interface UseStudyTableDisplayReturn {
  rows: StudyDTO[];
  totalPagesNb: number;
  error: unknown;
}

export const useStudyTableDisplay = ({
  searchTerm,
  projectInfo,
  sortBy,
  reloadStudies,
  page
}: UseStudyTableDisplayProps): UseStudyTableDisplayReturn => {
  const [rows, setRows] = useState<StudyDTO[]>([]);
  const [totalPagesNb, setTotalPagesNb] = useState(0);
  const [errorValue, setErrorValue] = useState<Error | null>(null);

  useEffect(() => {
    const fetchStudyList = async () => {
      try {
        const { content, totalPages } = await fetchSearchStudies(
          searchTerm,
          projectInfo?.id,
          page ?? PAGINATION_CURRENT,
          intervalSize,
          sortBy,
        );
        setRows(content);
        setTotalPagesNb(totalPages);
      } catch (error: unknown) {
        setErrorValue(error as Error);
      }
    };
    void fetchStudyList();
  }, [page, searchTerm, reloadStudies, projectInfo, sortBy]);

  return { rows, totalPagesNb, error: errorValue };
};
