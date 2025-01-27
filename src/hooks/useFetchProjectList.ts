/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect, useState } from 'react';
import { ProjectInfo } from '@/shared/types/pegase/Project.type.ts';
import { getEnvVariables } from '@/envVariables.ts';

export const useFetchProjectList = (
  searchTerm: string,
  current: number,
  intervalSize: number,
  shouldRefetch: boolean,
) => {
  const [projects, setProjects] = useState<ProjectInfo[]>([]);
  const [count, setCount] = useState(0);
  const BASE_URL = getEnvVariables('VITE_BACK_END_BASE_URL');

  const fetchProjects = useCallback(async () => {
    const url = `${BASE_URL}/v1/project/search?page=${current + 1}&size=${intervalSize}&search=${searchTerm || ''}`;
    fetch(url)
      .then((response) => response.json())
      .then((json) => {
        setProjects(json.content);
        setCount(json.totalElements);
      })
      .catch((error) => console.error(error));
  }, [current, intervalSize, searchTerm]);

  useEffect(() => {
    void fetchProjects();
  }, [BASE_URL, current, searchTerm, intervalSize, shouldRefetch]);

  return { projects, count, refetch: fetchProjects };
};
