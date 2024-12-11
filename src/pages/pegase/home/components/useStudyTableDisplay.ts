/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useEffect, useState } from 'react';
import { StudyDTO } from '@/shared/types/index';
import { getEnvVariables } from '@/envVariables';

const ITEMS_PER_PAGE = 5;
const BASE_URL = getEnvVariables('VITE_BACK_END_BASE_URL');
const PAGINATION_CURRENT = 0;
const PAGINATION_COUNT = 0;

interface UseStudyTableDisplayProps {
  searchStudy: string | undefined;
  projectId?: string;
  sortBy: { [key: string]: 'asc' | 'desc' };
}

interface UseStudyTableDisplayReturn {
  rows: StudyDTO[];
  count: number;
  intervalSize: number;
  current: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
}

const intervalSize = ITEMS_PER_PAGE; // pas dans la fontion
export const useStudyTableDisplay = ({
  searchStudy,
  projectId,
  sortBy,
}: UseStudyTableDisplayProps): UseStudyTableDisplayReturn => {
  const [rows, setRows] = useState<StudyDTO[]>([]);
  const [count, setCount] = useState(0);
  const [current, setCurrent] = useState(0);

  const intervalSize = ITEMS_PER_PAGE;

  useEffect(() => {
    setCurrent(PAGINATION_CURRENT);
    setCount(PAGINATION_COUNT);
  }, [searchStudy, projectId, sortBy]);

  useEffect(() => {
          searchStudy(...)
      .then((response) =>{
        setRows(response.rows);
        setCount(response.totalElements);

      }).catch((error) => console.error(error));
   
  }, [current, searchStudy, projectId, sortBy]);

  return { rows, count, intervalSize, current, setPage: setCurrent };
};
