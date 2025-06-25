import { beforeEach, describe, Mock, vi } from 'vitest';
import { useFetchAreas } from '@/hooks/useFetchAreas.ts';
import { useStudy, useStudyDispatch } from '@/store/contexts/StudyContext.tsx';
import { StudyState, TrajectoryLinkData } from '@/shared/types';
import { renderHook, waitFor } from '@testing-library/react';
import * as trajectoryService from '@/shared/services/trajectoryService.ts';
import * as studyService from '@/shared/services/studyService.ts';
import {
  mockDbTrajectory,
  mockDbTrajectoryArray,
  mockDefaultArea,
  mockTrajectoryAreaData,
} from '@/shared/services/test/mocks/trajectoryMock.tsx';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { STUDY_ACTION } from '@/shared/enum/study.ts';

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

describe('useFetchAreas', () => {
  const mockUseStudyDispatch = useStudyDispatch as Mock<typeof useStudyDispatch>;
  const mockUseStudy = useStudy as Mock<typeof useStudy>;
  const mockDispatch = vi.fn().mockImplementation(vi.fn());
  vi.mocked(trajectoryService.getDefaultLoadHypothesis).mockResolvedValueOnce(mockDefaultArea);
  vi.mocked(trajectoryService.getTrajectoryDataByTypeAndId).mockResolvedValueOnce(
    mockTrajectoryAreaData as unknown as TrajectoryLinkData[],
  );
  vi.mocked(studyService.getStudyTrajectories).mockResolvedValue(mockDbTrajectoryArray);
  mockUseStudyDispatch.mockReturnValue(mockDispatch);

  beforeEach(() => {
    global.fetch = vi.fn();
    mockUseStudy.mockImplementation(
      () => ({ ['AREA']: [mockDbTrajectory], ['LOAD']: mockDbTrajectoryArray }) as Partial<StudyState>,
    );
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should call all api', async () => {
    const { result } = renderHook(() => useFetchAreas(5, TRAJECTORY_TYPE.LOAD));

    await waitFor(() => {
      expect(trajectoryService.getDefaultLoadHypothesis).toHaveBeenCalledTimes(1);
      expect(result.current.areaDefault).toEqual([
        {
          name: 'FR',
          isDefault: true,
        },
      ]);
      expect(trajectoryService.getTrajectoryDataByTypeAndId).toHaveBeenCalledTimes(1);
      expect(trajectoryService.getTrajectoryDataByTypeAndId).toHaveBeenCalledWith(TRAJECTORY_TYPE.AREA, 1);
      expect(result.current.trajectoryAreas).toEqual(mockTrajectoryAreaData);
      expect(studyService.getStudyTrajectories).toHaveBeenCalledTimes(2);
      expect(studyService.getStudyTrajectories).toHaveBeenCalledWith(5, TRAJECTORY_TYPE.AREA);
      expect(studyService.getStudyTrajectories).toHaveBeenCalledWith(5, TRAJECTORY_TYPE.LOAD);
      expect(mockDispatch).toHaveBeenCalledTimes(1);
      expect(mockDispatch).toHaveBeenCalledWith({
        type: STUDY_ACTION.ADD_TRAJECTORIES_LOAD,
        payload: mockDbTrajectoryArray,
      });
      expect(result.current.trajectoryLinked).toEqual(mockDbTrajectoryArray);
      expect(result.current.emptyAreas).toEqual(mockDbTrajectoryArray);
    });
  });

  it('should not call "getStudyTrajectories" with type argument', async () => {
    const { result } = renderHook(() => useFetchAreas(5));

    await waitFor(() => {
      expect(studyService.getStudyTrajectories).toHaveBeenCalledTimes(1);
      expect(studyService.getStudyTrajectories).toHaveBeenCalledWith(5, TRAJECTORY_TYPE.AREA);
      expect(result.current.trajectoryLinked).toEqual([]);
      expect(result.current.emptyAreas).toEqual([]);
    });
  });

  it('should not call "getStudyTrajectories" at all', async () => {
    const { result } = renderHook(() => useFetchAreas(5));

    await waitFor(() => {
      expect(studyService.getStudyTrajectories).toHaveBeenCalledTimes(0);
      expect(result.current.trajectoryAreas).toEqual([]);
      expect(result.current.trajectoryLinked).toEqual([]);
      expect(result.current.emptyAreas).toEqual([]);
    });
  });
});
