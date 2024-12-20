/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { notifyToast } from '@/shared/notification/notification';
import { useEffect, useState } from 'react';
import { ProjectInfo } from '@/shared/types/pegase/Project.type';
import { getEnvVariables } from '@/envVariables';

export const pinProject = async (projectId: string, isReloadPinnedProject: (value: boolean) => void) => {
  const userId = 'me00247';
  const BASE_URL = getEnvVariables('VITE_BACK_END_BASE_URL');

  try {
    const response = await fetch(`${BASE_URL}/v1/project/pin?userId=${userId}&projectId=${projectId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      const errorData = JSON.parse(errorText);
      throw new Error(`${errorData.message || errorText}`);
    }
    notifyToast({
      type: 'success',
      message: 'Project pinned successfully',
    });
    isReloadPinnedProject(true);
  } catch (error: any) {
    notifyToast({
      type: 'error',
      message: `${error.message}`,
    });
  }
};

export const useFetchProjects = (searchTerm: string, current: number, intervalSize: number) => {
  const [projects, setProjects] = useState<ProjectInfo[]>([]);
  const [count, setCount] = useState(0);
  const BASE_URL = getEnvVariables('VITE_BACK_END_BASE_URL');

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

  useEffect(() => {
    fetchProjects();
  }, [BASE_URL, current, searchTerm, intervalSize]);

  return { projects, count, refetch: fetchProjects };
};

export const deleteProjectById = async (projectId: string, isReloadProjects: (value: boolean) => void) => {
  const BASE_URL = getEnvVariables('VITE_BACK_END_BASE_URL');

  try {
    const response = await fetch(`${BASE_URL}/v1/project/${projectId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      const errorData = JSON.parse(errorText);
      throw new Error(`${errorData.message || errorText}`);
    }
    notifyToast({
      type: 'success',
      message: 'Project deleted successfully',
    });
    isReloadProjects(true);
  } catch (error: any) {
    notifyToast({
      type: 'error',
      message: `${error.message}`,
    });
  }
};
