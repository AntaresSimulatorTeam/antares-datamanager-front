import { beforeEach, describe, Mock, vi } from 'vitest';
import { useStudy, useStudyDispatch } from '@/store/contexts/StudyContext.tsx';
import { StudyState } from '@/shared/types';
import { renderHook, waitFor } from '@testing-library/react';
import * as studyService from '@/shared/services/studyService.ts';
import * as trajectoryService from '@/shared/services/trajectoryService.ts';
import {
  mockDbTrajectory,
  mockDbTrajectoryArrayLoad,
  mockEmptyDbTrajectoryArrayLoad,
  mockEmptyDbTrajectoryLoadFR,
  mockEmptyDbTrajectoryLoadOthers,
} from '@/mocks/data/tests/trajectory.mock.ts';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { STUDY_ACTION } from '@/shared/enum/study.ts';
import { useFetchHypothesisTrajectories } from '@/hooks/useFetchHypothesisTrajectories.ts';
import * as trajectoryUtils from '@/shared/utils/trajectoryUtils.ts';

vi.mock('@/shared/services/trajectoryService');
vi.mock('@/shared/services/studyService');
vi.mock('@/shared/utils/trajectoryUtils', async (importOriginal) => {
  const actual: Mock = await importOriginal();
  return {
    ...actual,
    buildEmptyTrajectory: vi.fn(),
  };
});
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

describe.skip('useFetchTrajectoriesLinked', () => {
  const mockUseStudyDispatch = useStudyDispatch as Mock<typeof useStudyDispatch>;
  const mockUseStudy = useStudy as Mock<typeof useStudy>;
  const mockDispatch = vi.fn().mockImplementation(vi.fn());
  mockUseStudyDispatch.mockReturnValue(mockDispatch);

  beforeEach(() => {
    global.fetch = vi.fn();
  });
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should call all api and return correct hypothesis trajectory array', async () => {
    mockUseStudy.mockImplementation(
      () =>
        ({
          ['AREA']: { trajectories: [mockDbTrajectory], warningMessages: [] },
          ['LOAD']: { trajectories: mockEmptyDbTrajectoryArrayLoad, warningMessages: [] },
        }) as Partial<StudyState>,
    );
    vi.mocked(trajectoryService.getStudyTrajectoriesWithWarnings).mockResolvedValue({
      trajectories: mockDbTrajectoryArrayLoad,
      warningMessages: [],
    });
    vi.mocked(trajectoryUtils.buildEmptyTrajectory).mockImplementation(() => mockEmptyDbTrajectoryLoadOthers);
    const { result } = renderHook(() => useFetchHypothesisTrajectories(5, TRAJECTORY_TYPE.LOAD));

    await waitFor(() => {
      expect(trajectoryService.getStudyTrajectoriesWithWarnings).toHaveBeenCalledWith(5, TRAJECTORY_TYPE.LOAD);
      expect(mockDispatch).toHaveBeenCalledTimes(1);
      expect(mockDispatch).toHaveBeenCalledWith({
        type: STUDY_ACTION.ADD_TRAJECTORIES,
        payload: {
          [TRAJECTORY_TYPE.LOAD]: {
            trajectories: [
              ...mockDbTrajectoryArrayLoad,
              ...mockEmptyDbTrajectoryArrayLoad,
              mockEmptyDbTrajectoryLoadOthers,
            ],
            warningMessages: [],
          },
        },
      });
      expect(result.current.hypothesisTrajectories).toEqual([
        ...mockDbTrajectoryArrayLoad,
        ...mockEmptyDbTrajectoryArrayLoad,
        mockEmptyDbTrajectoryLoadOthers,
      ]);
    });
  });

  it('should return correct hypothesis trajectory array if empty default trajectories not linked to study', async () => {
    mockUseStudy.mockImplementation(
      () =>
        ({
          ['AREA']: { trajectories: [mockDbTrajectory], warningMessages: [] },
          ['LOAD']: { trajectories: mockEmptyDbTrajectoryArrayLoad, warningMessages: [] },
        }) as Partial<StudyState>,
    );
    vi.mocked(trajectoryService.getStudyTrajectoriesWithWarnings).mockResolvedValue({
      trajectories: mockDbTrajectoryArrayLoad,
      warningMessages: [],
    });
    vi.mocked(trajectoryUtils.buildEmptyTrajectory).mockImplementationOnce(() => mockEmptyDbTrajectoryLoadOthers);
    vi.mocked(trajectoryUtils.buildEmptyTrajectory).mockImplementationOnce(() => mockEmptyDbTrajectoryLoadFR);
    const { result } = renderHook(() => useFetchHypothesisTrajectories(5, TRAJECTORY_TYPE.LOAD, [{ name: 'FR' }]));

    await waitFor(() => {
      expect(trajectoryService.getStudyTrajectoriesWithWarnings).toHaveBeenCalledWith(5, TRAJECTORY_TYPE.LOAD);
      expect(mockDispatch).toHaveBeenCalledTimes(1);
      expect(mockDispatch).toHaveBeenCalledWith({
        type: STUDY_ACTION.ADD_TRAJECTORIES,
        payload: {
          [TRAJECTORY_TYPE.LOAD]: {
            trajectories: [
              ...mockDbTrajectoryArrayLoad,
              ...mockEmptyDbTrajectoryArrayLoad,
              mockEmptyDbTrajectoryLoadOthers,
              mockEmptyDbTrajectoryLoadFR,
            ],
            warningMessages: [],
          },
        },
      });
      expect(result.current.hypothesisTrajectories).toEqual([
        ...mockDbTrajectoryArrayLoad,
        ...mockEmptyDbTrajectoryArrayLoad,
        mockEmptyDbTrajectoryLoadOthers,
        mockEmptyDbTrajectoryLoadFR,
      ]);
    });
  });

  it('should return correct hypothesis trajectory array if no empty trajectory in context', async () => {
    mockUseStudy.mockImplementation(
      () =>
        ({
          ['AREA']: { trajectories: [mockDbTrajectory], warningMessages: [] },
          ['LOAD']: { trajectories: [], warningMessages: [] },
        }) as Partial<StudyState>,
    );
    vi.mocked(trajectoryService.getStudyTrajectoriesWithWarnings).mockResolvedValue({
      trajectories: mockDbTrajectoryArrayLoad,
      warningMessages: [],
    });
    vi.mocked(trajectoryUtils.buildEmptyTrajectory).mockImplementationOnce(() => mockEmptyDbTrajectoryLoadOthers);
    vi.mocked(trajectoryUtils.buildEmptyTrajectory).mockImplementationOnce(() => mockEmptyDbTrajectoryLoadFR);
    const { result } = renderHook(() => useFetchHypothesisTrajectories(5, TRAJECTORY_TYPE.LOAD, [{ name: 'FR' }]));

    await waitFor(() => {
      expect(trajectoryService.getStudyTrajectoriesWithWarnings).toHaveBeenCalledWith(5, TRAJECTORY_TYPE.LOAD);
      expect(mockDispatch).toHaveBeenCalledTimes(1);
      expect(mockDispatch).toHaveBeenCalledWith({
        type: STUDY_ACTION.ADD_TRAJECTORIES,
        payload: {
          [TRAJECTORY_TYPE.LOAD]: {
            trajectories: [...mockDbTrajectoryArrayLoad, mockEmptyDbTrajectoryLoadOthers, mockEmptyDbTrajectoryLoadFR],
            warningMessages: [],
          },
        },
      });
      expect(result.current.hypothesisTrajectories).toEqual([
        ...mockDbTrajectoryArrayLoad,
        mockEmptyDbTrajectoryLoadOthers,
        mockEmptyDbTrajectoryLoadFR,
      ]);
    });
  });

  it('should return correct hypothesis trajectory array if empty one default trajectory not linked to study', async () => {
    vi.mocked(trajectoryService.getStudyTrajectoriesWithWarnings).mockResolvedValue({
      trajectories: mockDbTrajectoryArrayLoad,
      warningMessages: [],
    });
    vi.mocked(trajectoryUtils.buildEmptyTrajectory).mockImplementationOnce(() => mockEmptyDbTrajectoryLoadOthers);
    vi.mocked(trajectoryUtils.buildEmptyTrajectory).mockImplementationOnce(() => mockEmptyDbTrajectoryLoadFR);
    const { result } = renderHook(() =>
      useFetchHypothesisTrajectories(5, TRAJECTORY_TYPE.LOAD, [{ name: 'FR' }, { name: 'BE' }]),
    );

    await waitFor(() => {
      expect(trajectoryService.getStudyTrajectoriesWithWarnings).toHaveBeenCalledWith(5, TRAJECTORY_TYPE.LOAD);
      expect(mockDispatch).toHaveBeenCalledTimes(1);
      expect(mockDispatch).toHaveBeenCalledWith({
        type: STUDY_ACTION.ADD_TRAJECTORIES,
        payload: {
          [TRAJECTORY_TYPE.LOAD]: {
            trajectories: [...mockDbTrajectoryArrayLoad, mockEmptyDbTrajectoryLoadOthers, mockEmptyDbTrajectoryLoadFR],
            warningMessages: [],
          },
        },
      });
      expect(result.current.hypothesisTrajectories).toEqual([
        ...mockDbTrajectoryArrayLoad,
        mockEmptyDbTrajectoryLoadOthers,
        mockEmptyDbTrajectoryLoadFR,
      ]);
    });
  });

  it('should not call api if only study id is provided', async () => {
    const { result } = renderHook(() => useFetchHypothesisTrajectories(5));

    await waitFor(() => {
      expect(studyService.getStudyTrajectories).toHaveBeenCalledTimes(0);
      expect(result.current.hypothesisTrajectories).toEqual([]);
    });
  });

  it('should not call api when no arguments area provided', async () => {
    const { result } = renderHook(() => useFetchHypothesisTrajectories());

    await waitFor(() => {
      expect(studyService.getStudyTrajectories).toHaveBeenCalledTimes(0);
      expect(result.current.hypothesisTrajectories).toEqual([]);
    });
  });
});
