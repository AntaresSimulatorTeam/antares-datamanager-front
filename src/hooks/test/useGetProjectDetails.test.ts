import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useGetProjectDetails } from '../useGetProjectDetails';
import * as projectService from '@/shared/services/projectService.ts';
import { notifyToast } from '@/shared/notification/notification.tsx';

vi.mock('@/shared/services/projectService', async (importOriginal) => {
  const actual: Mock = await importOriginal();
  return {
    ...actual,
    fetchProjectDetails: vi.fn(),
  };
});

vi.mock('@/shared/notification/notification');

const mockProject = {
  id: 123,
  name: 'Test Project',
  description: 'A test project',
  createdBy: 'user1',
  creationDate: '2025-09-05' as unknown as Date,
  tags: ['tag1', 'tag2'],
};

describe('useGetProjectDetails', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches and sets project details correctly', async () => {
    vi.mocked(projectService.fetchProjectDetails, { partial: true }).mockResolvedValue(mockProject);

    const { result } = renderHook(() => useGetProjectDetails(123, 0));

    await waitFor(() => {
      expect(projectService.fetchProjectDetails).toHaveBeenCalledWith(123);
      expect(result.current.projectDetails.name).toBe('Test Project');
      expect(result.current.projectDetails.description).toBe('A test project');
      expect(result.current.projectDetails.createdBy).toBe('user1');
      expect(result.current.projectDetails.creationDate).toBe('2025-09-05');
      expect(result.current.projectDetails.tags).toStrictEqual(['tag1', 'tag2']);
    });
  });

  it('shows error toast on fetch failure', async () => {
    (projectService.fetchProjectDetails as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('fail'));

    renderHook(() => useGetProjectDetails(123, 0));

    await waitFor(() => {
      expect(notifyToast).toHaveBeenCalledWith({
        type: 'error',
        message: 'Error retrieving project details: 123',
      });
    });
  });

  it('does not fetch if projectId is null', async () => {
    renderHook(() => useGetProjectDetails(null, 0));
    await waitFor(() => {
      expect(projectService.fetchProjectDetails).not.toHaveBeenCalled();
    });
  });
});
