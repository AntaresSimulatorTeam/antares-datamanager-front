/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useEffect, useState } from 'react';
import { getEnvVariables } from '@/envVariables';
import { ProjectInfo } from '@/shared/types/pegase/Project.type';

const useFetchProjects = (searchTerm: string, current: number, intervalSize: number) => {
  const [projects, setProjects] = useState<ProjectInfo[]>([]);
  const [count, setCount] = useState(0);
  const BASE_URL = getEnvVariables('VITE_BACK_END_BASE_URL');

  useEffect(() => {
    const fetchProjects = () => {
      const url = `${BASE_URL}/v1/project/search?page=${current + 1}&size=${intervalSize}&search=${searchTerm || ''}`;
      fetch(url)
        .then((response) => response.json())
        .then((json) => {
          setProjects(json.content);
          setCount(json.totalElements);
        })
        .catch((error) => console.error(error));
    };
    fetchProjects();
  }, [BASE_URL, current, searchTerm, intervalSize]);

  return { projects, count };
};

export default useFetchProjects;
