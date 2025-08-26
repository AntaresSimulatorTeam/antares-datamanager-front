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
import { TRAJECTORY_SELECTION_STATUS, TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { STUDY_ACTION } from '@/shared/enum/study.ts';
import { useFetchHypothesisTrajectories } from '@/hooks/useFetchHypothesisTrajectories.ts';
import * as trajectoryUtils from '@/shared/utils/trajectoryUtils.ts';
import { OTHER_AREAS_LABEL } from '@/shared/const/studyConfig.ts';

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

describe('useFetchTrajectoriesLinked', () => {
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
        {
          hypothesis: 'AT',
          isDefault: false,
          status: TRAJECTORY_SELECTION_STATUS.OK,
          subRows: undefined,
          trajectory: {
            id: 1,
            trajectoryName: 'area_PB_2024',
            type: TRAJECTORY_TYPE.LOAD,
            version: 3,
            userName: 'mouad',
            creationDate: '2024-07-22 15:13:56.860045' as unknown as Date,
            area: 'AT',
            technology: '',
          },
        },
        {
          hypothesis: 'BE',
          isDefault: false,
          status: TRAJECTORY_SELECTION_STATUS.OK,
          subRows: undefined,
          trajectory: {
            id: 2,
            trajectoryName: 'area_PB_2026',
            type: TRAJECTORY_TYPE.LOAD,
            version: 3,
            userName: 'mouad',
            creationDate: '2026-08-22 15:13:56.860045' as unknown as Date,
            area: 'BE',
            technology: '',
          },
        },
        {
          hypothesis: 'DEkf',
          isDefault: false,
          status: TRAJECTORY_SELECTION_STATUS.MISSING,
          subRows: undefined,
          trajectory: null,
        },
        {
          hypothesis: 'ES',
          isDefault: false,
          status: TRAJECTORY_SELECTION_STATUS.MISSING,
          subRows: undefined,
          trajectory: null,
        },
        {
          hypothesis: OTHER_AREAS_LABEL,
          isDefault: true,
          status: TRAJECTORY_SELECTION_STATUS.MISSING,
          subRows: null,
          trajectory: null,
        },
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
        {
          hypothesis: 'FR',
          isDefault: true,
          status: TRAJECTORY_SELECTION_STATUS.MISSING,
          subRows: null,
          trajectory: null,
        },
        {
          hypothesis: 'AT',
          isDefault: false,
          status: TRAJECTORY_SELECTION_STATUS.OK,
          subRows: undefined,
          trajectory: {
            id: 1,
            trajectoryName: 'area_PB_2024',
            type: TRAJECTORY_TYPE.LOAD,
            version: 3,
            userName: 'mouad',
            creationDate: '2024-07-22 15:13:56.860045' as unknown as Date,
            area: 'AT',
            technology: '',
          },
        },
        {
          hypothesis: 'BE',
          isDefault: false,
          status: TRAJECTORY_SELECTION_STATUS.OK,
          subRows: undefined,
          trajectory: {
            id: 2,
            trajectoryName: 'area_PB_2026',
            type: TRAJECTORY_TYPE.LOAD,
            version: 3,
            userName: 'mouad',
            creationDate: '2026-08-22 15:13:56.860045' as unknown as Date,
            area: 'BE',
            technology: '',
          },
        },
        {
          hypothesis: 'DEkf',
          isDefault: false,
          status: TRAJECTORY_SELECTION_STATUS.MISSING,
          subRows: undefined,
          trajectory: null,
        },
        {
          hypothesis: 'ES',
          isDefault: false,
          status: TRAJECTORY_SELECTION_STATUS.MISSING,
          subRows: undefined,
          trajectory: null,
        },
        {
          hypothesis: OTHER_AREAS_LABEL,
          isDefault: true,
          status: TRAJECTORY_SELECTION_STATUS.MISSING,
          subRows: null,
          trajectory: null,
        },
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
        {
          hypothesis: 'FR',
          isDefault: true,
          status: TRAJECTORY_SELECTION_STATUS.MISSING,
          subRows: null,
          trajectory: null,
        },
        {
          hypothesis: 'AT',
          isDefault: false,
          status: TRAJECTORY_SELECTION_STATUS.OK,
          subRows: undefined,
          trajectory: {
            id: 1,
            trajectoryName: 'area_PB_2024',
            type: TRAJECTORY_TYPE.LOAD,
            version: 3,
            userName: 'mouad',
            creationDate: '2024-07-22 15:13:56.860045' as unknown as Date,
            area: 'AT',
            technology: '',
          },
        },
        {
          hypothesis: 'BE',
          isDefault: false,
          status: TRAJECTORY_SELECTION_STATUS.OK,
          subRows: undefined,
          trajectory: {
            id: 2,
            trajectoryName: 'area_PB_2026',
            type: TRAJECTORY_TYPE.LOAD,
            version: 3,
            userName: 'mouad',
            creationDate: '2026-08-22 15:13:56.860045' as unknown as Date,
            area: 'BE',
            technology: '',
          },
        },
        {
          hypothesis: OTHER_AREAS_LABEL,
          isDefault: true,
          status: TRAJECTORY_SELECTION_STATUS.MISSING,
          subRows: null,
          trajectory: null,
        },
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
        {
          hypothesis: 'BE',
          isDefault: true,
          status: TRAJECTORY_SELECTION_STATUS.OK,
          subRows: null,
          trajectory: {
            id: 2,
            trajectoryName: 'area_PB_2026',
            type: TRAJECTORY_TYPE.LOAD,
            version: 3,
            userName: 'mouad',
            creationDate: '2026-08-22 15:13:56.860045' as unknown as Date,
            area: 'BE',
            technology: '',
          },
        },
        {
          hypothesis: 'FR',
          isDefault: true,
          status: TRAJECTORY_SELECTION_STATUS.MISSING,
          subRows: null,
          trajectory: null,
        },
        {
          hypothesis: 'AT',
          isDefault: false,
          status: TRAJECTORY_SELECTION_STATUS.OK,
          subRows: undefined,
          trajectory: {
            id: 1,
            trajectoryName: 'area_PB_2024',
            type: TRAJECTORY_TYPE.LOAD,
            version: 3,
            userName: 'mouad',
            creationDate: '2024-07-22 15:13:56.860045' as unknown as Date,
            area: 'AT',
            technology: '',
          },
        },
        {
          hypothesis: OTHER_AREAS_LABEL,
          isDefault: true,
          status: TRAJECTORY_SELECTION_STATUS.MISSING,
          subRows: null,
          trajectory: null,
        },
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
