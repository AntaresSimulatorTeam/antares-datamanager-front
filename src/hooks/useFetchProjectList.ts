/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect, useState } from 'react';
import { ProjectActionType, ProjectResponse } from '@/shared/types/Project.type.ts';
import { fetchProjectFromSearchTerm } from '@/shared/services/projectService.ts';
import { PROJECT_ACTION } from '@/shared/enum/project.ts';
import { useProjectDispatch } from '@/store/contexts/ProjectContext.tsx';

export const useFetchProjectList = (current: number, intervalSize: number, searchTerm?: string) => {
  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  const [count, setCount] = useState(0);
  const dispatch = useProjectDispatch();

  const fetchProjects = useCallback(
    async (currentPage: number, size: number, term: string) => {
      try {
        const response = await fetchProjectFromSearchTerm(currentPage, size, term);

        dispatch?.({
          type: PROJECT_ACTION.INIT_PROJECT_LIST,
          payload: response?.content,
        } as ProjectActionType);
        setProjects(response?.content);
        setCount(response?.totalElements);
      } catch (error) {
        console.error(error);
      }
    },
    [current, intervalSize, searchTerm],
  );

  useEffect(() => {
    void fetchProjects(current, intervalSize, searchTerm ?? '');
  }, [current, searchTerm, intervalSize]);

  return { projects, count, refetch: fetchProjects };
};
