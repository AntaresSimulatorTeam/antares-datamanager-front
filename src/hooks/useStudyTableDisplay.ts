/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import { StudyDTO } from '@/shared/types';
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
  const [error, setError] = useState(null);

  const searchTermRef = useRef(searchTerm);
  useEffect(() => {
    searchTermRef.current = searchTerm;
  }, [searchTerm]);

  const projectIdRef = useRef(projectId);
  useEffect(() => {
    projectIdRef.current = projectId;
  }, [projectId]);

  const sortByRef = useRef(sortBy);
  useEffect(() => {
    sortByRef.current = sortBy;
  }, [sortBy]);

  const reloadStudiesRef = useRef(reloadStudies);
  useEffect(() => {
    reloadStudiesRef.current = reloadStudies;
  }, [reloadStudies]);

  useEffect(() => {
    setCurrentPage(PAGINATION_CURRENT);
  }, []);

  useEffect(() => {
    fetchSearchStudies(searchTermRef.current, projectIdRef.current, currentPage, intervalSize, sortByRef.current)
      .then(({ content, totalElements }) => {
        setRows(content);
        setCount(totalElements);
      })
      .catch((error) => setError(error));
  }, [currentPage, searchTermRef.current, projectIdRef.current, sortByRef.current, reloadStudiesRef.current]);

  return { rows, count, intervalSize, currentPage, setPage: setCurrentPage, error };
};
