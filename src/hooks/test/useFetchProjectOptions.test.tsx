import { renderHook, waitFor } from '@testing-library/react';
import { fetchProjectsFromPartialName } from '@/shared/services/projectService.ts';
import { useFetchProjectOptions } from '@/hooks/useFetchProjectOptions.ts';
import { notifyAlert } from '@/shared/notification/notification.tsx';
import { vi } from 'vitest';
import * as projectService from '@/shared/services/projectService';
import { ProjectInfo } from '@/shared/types';

vi.mock('@/shared/services/projectService');
vi.mock('@/shared/notification/notification');
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe('useFetchProjectOptions', () => {
  const mockFetchProjectsFromPartialName = vi.mocked(projectService.fetchProjectsFromPartialName);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches project options on mount and sets projects', async () => {
    mockFetchProjectsFromPartialName.mockResolvedValue([
      { id: 1, name: 'Project A' },
      { id: 2, name: 'Project B' },
    ] as ProjectInfo[]);

    const { result } = renderHook(() => useFetchProjectOptions('Proj'));

    await waitFor(() => {
      expect(result.current.projects).toHaveLength(2);
    });

    expect(fetchProjectsFromPartialName).toHaveBeenCalledWith('Proj');
    expect(result.current.projects).toEqual([
      { id: 1, label: 'Project A', value: 'Project A' },
      { id: 2, label: 'Project B', value: 'Project B' },
    ]);
  });

  it('updates projects when searchTerm changes', async () => {
    mockFetchProjectsFromPartialName.mockResolvedValue([{ id: 3, name: 'New Project' }] as ProjectInfo[]);

    const { result, rerender } = renderHook(({ term }) => useFetchProjectOptions(term), {
      initialProps: { term: 'Old' },
    });

    rerender({ term: 'New' });

    await waitFor(() => {
      expect(fetchProjectsFromPartialName).toHaveBeenCalledWith('New');
      expect(result.current.projects).toEqual([{ id: 3, label: 'New Project', value: 'New Project' }]);
    });
  });

  it('calls notifyAlert on error', async () => {
    mockFetchProjectsFromPartialName.mockRejectedValue(new Error('Network error'));

    renderHook(() => useFetchProjectOptions('Err'));

    await waitFor(() => {
      expect(notifyAlert).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'error',
          content: 'Network error',
          message: 'project.@fetch_failed',
        }),
      );
    });
  });
});
