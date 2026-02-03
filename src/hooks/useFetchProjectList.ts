import { useCallback, useEffect, useState } from 'react';
import { fetchProjectFromSearchTerm } from '@/shared/services/projectService';
import { useProjectDispatch } from '@/store/contexts/ProjectContext';
import { PROJECT_ACTION } from '@/shared/enum/project';
import { ProjectActionType, ProjectResponse } from '@/shared/types';

export const useFetchProjectList = (current: number, intervalSize: number, searchTerm?: string) => {
  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  const [count, setCount] = useState(0);
  const [error, setError] = useState<unknown>(null);
  const dispatch = useProjectDispatch();

  const fetchProjects = useCallback(
    async (currentPage: number, size: number, term: string) => {
      setError(null);

      const response = await fetchProjectFromSearchTerm(currentPage, size, term);

      dispatch?.({
        type: PROJECT_ACTION.INIT_PROJECT_LIST,
        payload: response?.content,
      } as ProjectActionType);

      setProjects(response?.content ?? []);
      setCount(response?.totalElements ?? 0);
    },
    [dispatch],
  );

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        await fetchProjects(current, intervalSize, searchTerm ?? '');
      } catch (e) {
        if (!cancelled) setError(e);
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [current, intervalSize, searchTerm, fetchProjects]);

  return { projects, count, refetch: fetchProjects, error };
};
