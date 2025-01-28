/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect, useState } from 'react';
import { ProjectInfo } from '@/shared/types/pegase/Project.type.ts';
import { fetchProjectFromSearchTerm } from '@/shared/services/projectService.ts';

export const useFetchProjectList = (
  searchTerm: string,
  current: number,
  intervalSize: number,
  shouldRefetch: boolean,
) => {
  const [projects, setProjects] = useState<ProjectInfo[]>([]);
  const [count, setCount] = useState(0);

  const fetchProjects = useCallback(
    async (searchTerm, current, intervalSize) => {
      fetchProjectFromSearchTerm(searchTerm, current, intervalSize)
        .then((json) => {
          setProjects(json.content);
          setCount(json.totalElements);
        })
        .catch((error) => console.error(error));
    },
    [current, intervalSize, searchTerm],
  );

  useEffect(() => {
    void fetchProjects(searchTerm, current, intervalSize);
  }, [current, searchTerm, intervalSize, shouldRefetch]);

  return { projects, count, refetch: fetchProjects };
};
