import { beforeEach, describe, expectTypeOf, Mock, vi } from 'vitest';
import { useFetchAreas } from '@/hooks/useFetchAreas.ts';
import { useStudy, useStudyDispatch } from '@/store/contexts/StudyContext.tsx';
import { DbTrajectory, StudyState, TrajectoryAreaData } from '@/shared/types';
import { act, renderHook, waitFor } from '@testing-library/react';
import * as trajectoryService from '@/shared/services/trajectoryService.ts';
import * as defaultConfigService from '@/shared/services/defaultConfigService.ts';
import {
  mockDbTrajectory,
  mockDbTrajectoryArray,
  mockDefaultArea,
  mockTrajectoryAreaData,
} from '@/mocks/data/tests/trajectory.mock.ts';
import * as trajectoryUtils from '@/shared/utils/trajectoryUtils';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';

vi.mock('@/shared/services/trajectoryService');
vi.mock('@/shared/services/defaultConfigService');
vi.mock('@/shared/services/studyService');
vi.mock('@/store/contexts/StudyContext', async (importOriginal) => {
  const actual: Mock = await importOriginal();
  return {
    ...actual,
    useStudy: vi.fn(),
    useStudyDispatch: vi.fn(),
  };
});

vi.mock('@/shared/utils/trajectoryUtils', async (importOriginal) => {
  const actual: Mock = await importOriginal();
  return {
    ...actual,
    areAllFlowbasedAreasPresent: vi.fn()
  };
});

describe('useFetchAreas', () => {
  const mockUseStudy = useStudy as Mock<typeof useStudy>;
  vi.mocked(defaultConfigService.getDefaultAreas).mockResolvedValueOnce(mockDefaultArea);
  vi.mocked(trajectoryService.getTrajectoryDataByTypeAndId).mockResolvedValueOnce(
    mockTrajectoryAreaData as unknown as TrajectoryAreaData[],
  );
  const mockUseStudyDispatch = useStudyDispatch as Mock<typeof useStudyDispatch>;
  const mockDispatch = vi.fn().mockImplementation(vi.fn());
  mockUseStudyDispatch.mockReturnValue(mockDispatch);

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

  it('should call all api when isFlowbasedAllowed is used', async () => {
    const { result } = renderHook(() => useFetchAreas());
    const areasName = mockTrajectoryAreaData.map((area) => area.areaName);

    await waitFor(() => {
      expectTypeOf(result.current.isFlowbasedAllowed).toBeFunction();
    });

    await act(async () => result.current.isFlowbasedAllowed(1));

    await waitFor(() => {
      expect(trajectoryService.getTrajectoryDataByTypeAndId).toHaveBeenCalledTimes(1);
      expect(trajectoryService.getTrajectoryDataByTypeAndId).toHaveBeenCalledWith(TRAJECTORY_TYPE.AREA, 1);
      expect(trajectoryUtils.areAllFlowbasedAreasPresent).toHaveBeenCalledWith(areasName);
    });
  });

  it('should not call all api when useFetchAreas is initialized with AREA tableType and areas in context', async () => {
    const trajectoryData = [
      {
        areaName: 'B',
        spilledEnergyCost: '',
        unsuppliedEnergyCost: '300.256',
      },
    ];
    mockUseStudy.mockImplementationOnce(
      () =>
        ({
          ['AREA']: { trajectories: [mockDbTrajectory], warningMessages: [] },
          ['LOAD']: { trajectories: mockDbTrajectoryArray, warningMessages: [] },
          ['areas']: trajectoryData
        }) as Partial<StudyState>,
    );
    renderHook(() => useFetchAreas(TRAJECTORY_TYPE.AREA, {id: 1} as DbTrajectory));

    await waitFor(() => {
      expect(defaultConfigService.getDefaultAreas).toHaveBeenCalled();
      expect(trajectoryService.getTrajectoryDataByTypeAndId).toHaveBeenCalled();
    });
  });

  it('should all api when useFetchAreas is initialized with LOAD tableType and no areas in context', async () => {
    mockUseStudy.mockImplementationOnce(
      () =>
        ({
          ['AREA']: { trajectories: [mockDbTrajectory], warningMessages: [] },
          ['LOAD']: { trajectories: mockDbTrajectoryArray, warningMessages: [] },
        }) as Partial<StudyState>,
    );
    renderHook(() => useFetchAreas(TRAJECTORY_TYPE.LOAD, {id: 1} as DbTrajectory));

    await waitFor(() => {
      expect(defaultConfigService.getDefaultAreas).toHaveBeenCalled();
      expect(trajectoryService.getTrajectoryDataByTypeAndId).toHaveBeenCalled();
      expect(trajectoryService.getTrajectoryDataByTypeAndId).toHaveBeenCalledWith(TRAJECTORY_TYPE.AREA, 1);
    });
  });
});
