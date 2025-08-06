import { beforeEach, describe, Mock, vi } from 'vitest';
import { useFetchAreas } from '@/hooks/useFetchAreas.ts';
import { useStudy } from '@/store/contexts/StudyContext.tsx';
import { StudyState, TrajectoryLinkData } from '@/shared/types';
import { renderHook, waitFor } from '@testing-library/react';
import * as trajectoryService from '@/shared/services/trajectoryService.ts';
import {
  mockDbTrajectory,
  mockDbTrajectoryArray,
  mockDefaultArea,
  mockTrajectoryAreaData,
} from '@/mocks/data/tests/trajectory.mock.ts';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';

vi.mock('@/shared/services/trajectoryService');
vi.mock('@/shared/services/studyService');
vi.mock('@/store/contexts/StudyContext', async (importOriginal) => {
  const actual: Mock = await importOriginal();
  return {
    ...actual,
    useStudy: vi.fn(),
  };
});

describe('useFetchAreas', () => {
  const mockUseStudy = useStudy as Mock<typeof useStudy>;
  vi.mocked(trajectoryService.getDefaultLoadHypothesis).mockResolvedValueOnce(mockDefaultArea);
  vi.mocked(trajectoryService.getTrajectoryDataByTypeAndId).mockResolvedValueOnce(
    mockTrajectoryAreaData as unknown as TrajectoryLinkData[],
  );

  beforeEach(() => {
    global.fetch = vi.fn();
    mockUseStudy.mockImplementation(
      () =>
        ({
          ['AREA']: { trajectories: [mockDbTrajectory], warningMessages: [] },
          ['LOAD']: { trajectories: mockDbTrajectoryArray, warningMessages: [] },
        }) as Partial<StudyState>,
    );
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should call all api', async () => {
    const { result } = renderHook(() => useFetchAreas(mockDbTrajectory));

    await waitFor(() => {
      expect(trajectoryService.getDefaultLoadHypothesis).toHaveBeenCalledTimes(1);
      expect(trajectoryService.getTrajectoryDataByTypeAndId).toHaveBeenCalledTimes(1);
      expect(trajectoryService.getTrajectoryDataByTypeAndId).toHaveBeenCalledWith(TRAJECTORY_TYPE.AREA, 1);
      expect(result.current.areaDefault).toEqual([
        {
          name: 'FR',
        },
      ]);
      expect(result.current.trajectoryAreas).toEqual(mockTrajectoryAreaData);
    });
  });

  it('should not call "getTrajectoryDataByTypeAndId" when no trajectory of AREA type isn\'t provided', async () => {
    const { result } = renderHook(() => useFetchAreas());

    await waitFor(() => {
      expect(trajectoryService.getTrajectoryDataByTypeAndId).toHaveBeenCalledTimes(0);
      expect(result.current.trajectoryAreas).toEqual([]);
    });
  });
});
