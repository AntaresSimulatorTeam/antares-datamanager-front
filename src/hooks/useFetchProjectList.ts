/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect, useState } from 'react';
import { ProjectActionType, ProjectInfo } from '@/shared/types/pegase/Project.type.ts';
import { fetchProjectFromSearchTerm } from '@/shared/services/projectService.ts';
import { PROJECT_ACTION } from '@/shared/enum/project.ts';
import { useProjectDispatch } from '@/store/contexts/ProjectContext.tsx';
import { PaginatedResponse } from '@/shared/types';

export const useFetchProjectList = (searchTerm: string, current: number, intervalSize: number) => {
  const [projects, setProjects] = useState<ProjectInfo[]>([]);
  const [count, setCount] = useState(0);
  const dispatch = useProjectDispatch();

  const fetchProjects = useCallback(
    async (term: string, currentPage: number, size: number) => {
      try {
        const { content, totalElements } = (await fetchProjectFromSearchTerm(
          term,
          currentPage,
          size,
        )) as PaginatedResponse<ProjectInfo>;

        dispatch?.({
          type: PROJECT_ACTION.INIT_PROJECT_LIST,
          payload: content,
        } as ProjectActionType);
        setProjects(content);
        setCount(totalElements);
      } catch (error) {
        console.error(error);
      }
    },
    [current, intervalSize, searchTerm],
  );

  useEffect(() => {
    void fetchProjects(searchTerm, current, intervalSize);
  }, [current, searchTerm, intervalSize]);

  return { projects, count, refetch: fetchProjects };
};
