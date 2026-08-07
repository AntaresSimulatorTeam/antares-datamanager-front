import { act, renderHook } from '@testing-library/react';
import { useProjectCreation } from '@/hooks/useProjectCreation.ts';
import { PROJECT_ACTION } from '@/shared/enum/project.ts';
import { createProject, updateProject } from '@/shared/services/projectService.ts';
import * as projectService from '@/shared/services/projectService';
import { ProjectDataCreation, ProjectResponse } from '@/shared/types';
import { Mock, vi } from 'vitest';
import { useProjectDispatch } from '@/store/contexts/ProjectContext.tsx';

vi.mock('@/shared/services/projectService');
vi.mock('@/store/contexts/ProjectContext');

const mockCreateProject = vi.mocked(projectService.createProject);
const mockUpdateProject = vi.mocked(projectService.updateProject);

describe('useProjectCreation', () => {
  const mockUseProjectDispatch = useProjectDispatch as Mock<typeof useProjectDispatch>;
  const mockDispatch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseProjectDispatch.mockReturnValue(mockDispatch);
  });

  it('creates a project and dispatches ADD_PROJECT, then calls onSuccess', async () => {
    const mockProject = { id: 1, name: 'New Project' } as unknown as ProjectResponse;
    mockCreateProject.mockResolvedValue(mockProject);

    const onSuccess = vi.fn();
    const onError = vi.fn();

    const { result } = renderHook(() => useProjectCreation(onSuccess, onError));

    await act(async () => {
      await result.current.confirmCreation({ name: 'New Project' } as ProjectDataCreation);
    });

    expect(createProject).toHaveBeenCalledWith({ name: 'New Project' });

    expect(mockDispatch).toHaveBeenCalledWith({
      type: PROJECT_ACTION.ADD_PROJECT,
      payload: mockProject,
    });

    expect(onSuccess).toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();
  });

  it('updates a project and dispatches UPDATE_PROJECT, then calls onSuccess', async () => {
    const mockProject = { id: 2, name: 'Updated Project' } as unknown as ProjectResponse;
    mockUpdateProject.mockResolvedValue(mockProject);

    const onSuccess = vi.fn();

    const { result } = renderHook(() => useProjectCreation(onSuccess));

    await act(async () => {
      await result.current.confirmCreation({ name: 'Updated Project' } as ProjectDataCreation, 2);
    });

    expect(updateProject).toHaveBeenCalledWith(2, { name: 'Updated Project' });

    expect(mockDispatch).toHaveBeenCalledWith({
      type: PROJECT_ACTION.UPDATE_PROJECT,
      payload: mockProject,
    });

    expect(onSuccess).toHaveBeenCalled();
  });

  it('calls onError when creation fails', async () => {
    mockCreateProject.mockRejectedValue(new Error('Creation failed'));

    const onError = vi.fn();

    const { result } = renderHook(() => useProjectCreation(undefined, onError));

    await act(async () => {
      await result.current.confirmCreation({ name: 'Bad Project' } as ProjectDataCreation);
    });

    expect(onError).toHaveBeenCalledWith('Creation failed');
  });

  it('calls onError when update fails', async () => {
    mockUpdateProject.mockRejectedValue(new Error('Update failed'));

    const onError = vi.fn();

    const { result } = renderHook(() => useProjectCreation(undefined, onError));

    await act(async () => {
      await result.current.confirmCreation({ name: 'Bad Update' } as ProjectDataCreation, 10);
    });

    expect(onError).toHaveBeenCalledWith('Update failed');
  });
});
