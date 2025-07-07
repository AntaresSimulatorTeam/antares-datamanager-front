import { beforeEach, describe, Mock, vi } from 'vitest';
import { useStudy, useStudyDispatch } from '@/store/contexts/StudyContext.tsx';
import { StudyState } from '@/shared/types';
import { renderHook, waitFor } from '@testing-library/react';
import * as studyService from '@/shared/services/studyService.ts';
import {
  mockDbTrajectory,
  mockDbTrajectoryArray,
  mockTrajectoryWithWarnings,
} from '@/shared/services/test/mocks/trajectoryMock.tsx';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { STUDY_ACTION } from '@/shared/enum/study.ts';
import { useFetchTrajectoriesLinked } from '@/hooks/useFetchTrajectoriesLinked.ts';

vi.mock('@/shared/services/trajectoryService');
vi.mock('@/shared/services/studyService');
vi.mock('@/store/contexts/StudyContext', async (importOriginal) => {
  const actual: Mock = await importOriginal();
  return {
    ...actual,
    useStudy: vi.fn(),
    useStudyDispatch: vi.fn(() => ({
      dispatch: vi.fn(),
    })),
  };
});
vi.mock('@/shared/services/warningService', async (importOriginal) => {
  const actual: Mock = await importOriginal();
  return {
    ...actual,
    fetchWarningMessages: vi.fn(),
  };
});

describe('useFetchTrajectoriesLinked', () => {
  vi.mocked(studyService.getStudyTrajectoriesWithWarnings).mockResolvedValue(mockTrajectoryWithWarnings);
  const mockUseStudyDispatch = useStudyDispatch as Mock<typeof useStudyDispatch>;
  const mockUseStudy = useStudy as Mock<typeof useStudy>;
  const mockDispatch = vi.fn().mockImplementation(vi.fn());
  mockUseStudyDispatch.mockReturnValue(mockDispatch);

  beforeEach(() => {
    global.fetch = vi.fn();
    mockUseStudy.mockImplementation(
      () => ({ ['AREA']: [mockDbTrajectory], ['LOAD']: mockDbTrajectoryArray }) as Partial<StudyState>,
    );
  });
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should call all api', async () => {
    const { result } = renderHook(() => useFetchTrajectoriesLinked(5, TRAJECTORY_TYPE.LOAD));

    await waitFor(() => {
      expect(studyService.getStudyTrajectoriesWithWarnings).toHaveBeenCalledTimes(1);
      expect(studyService.getStudyTrajectoriesWithWarnings).toHaveBeenCalledWith(5, TRAJECTORY_TYPE.LOAD);
      expect(mockDispatch).toHaveBeenCalledTimes(1);
      expect(mockDispatch).toHaveBeenCalledWith({
        type: STUDY_ACTION.ADD_TRAJECTORIES_LOAD,
        payload: mockTrajectoryWithWarnings,
      });
      expect(result.current.trajectoryLinked).toEqual(mockTrajectoryWithWarnings);
      expect(result.current.emptyAreas).toEqual(mockTrajectoryWithWarnings);
    });
  });

  it('should not call api if only study id is provided', async () => {
    const { result } = renderHook(() => useFetchTrajectoriesLinked(5));

    await waitFor(() => {
      expect(studyService.getStudyTrajectoriesWithWarnings).toHaveBeenCalledTimes(0);
      expect(result.current.trajectoryLinked).toEqual([]);
      expect(result.current.emptyAreas).toEqual([]);
    });
  });

  it('should not call api when no arguments area provided', async () => {
    const { result } = renderHook(() => useFetchTrajectoriesLinked());

    await waitFor(() => {
      expect(studyService.getStudyTrajectoriesWithWarnings).toHaveBeenCalledTimes(0);
      expect(result.current.trajectoryLinked).toEqual([]);
      expect(result.current.emptyAreas).toEqual([]);
    });
  });
});
