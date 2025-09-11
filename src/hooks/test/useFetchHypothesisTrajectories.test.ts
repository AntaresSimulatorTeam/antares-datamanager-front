import { beforeEach, describe, Mock, vi } from 'vitest';
import { useStudy, useStudyDispatch } from '@/store/contexts/StudyContext.tsx';
import { StudyState, TrajectoryAreaData } from '@/shared/types';
import { renderHook, waitFor } from '@testing-library/react';
import * as studyService from '@/shared/services/studyService.ts';
import * as trajectoryService from '@/shared/services/trajectoryService.ts';
import {
  mockDbTrajectory,
  mockDbTrajectoryArrayLoad,
  mockDbTrajectoryArrayThermal,
  mockEmptyDbTrajectoryArrayLoad,
  mockEmptyDbTrajectoryLoadFR,
  mockEmptyDbTrajectoryLoadOthers,
} from '@/mocks/data/tests/trajectory.mock.ts';
import { TRAJECTORY_SELECTION_STATUS, TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { STUDY_ACTION } from '@/shared/enum/study.ts';
import { useFetchHypothesisTrajectories } from '@/hooks/useFetchHypothesisTrajectories.ts';
import * as trajectoryUtils from '@/shared/utils/trajectoryUtils.ts';
import { OTHER_AREAS_LABEL } from '@/shared/const/studyConfig.ts';
import { ThermalOptions } from '@/mocks/data/list/names.ts';

vi.mock('@/shared/services/trajectoryService');
vi.mock('@/shared/services/studyService');
vi.mock('@/shared/utils/trajectoryUtils', async (importOriginal) => {
  const actual: Mock = await importOriginal();
  return {
    ...actual,
    buildEmptyTrajectory: vi.fn(),
    buildDefaultEmptyTrajectoryList: vi.fn(),
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
    vi.mocked(trajectoryUtils.buildDefaultEmptyTrajectoryList).mockImplementation(() => [
      mockEmptyDbTrajectoryLoadOthers,
    ]);
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
          isDeletable: true,
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
          isDeletable: true,
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
          isDeletable: true,
          status: TRAJECTORY_SELECTION_STATUS.MISSING,
          subRows: undefined,
          trajectory: null,
        },
        {
          hypothesis: 'ES',
          isDefault: false,
          isDeletable: true,
          status: TRAJECTORY_SELECTION_STATUS.MISSING,
          subRows: undefined,
          trajectory: null,
        },
        {
          hypothesis: OTHER_AREAS_LABEL,
          isDefault: true,
          isDeletable: false,
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
    vi.mocked(trajectoryUtils.buildDefaultEmptyTrajectoryList).mockImplementationOnce(() => [
      mockEmptyDbTrajectoryLoadFR,
      mockEmptyDbTrajectoryLoadOthers,
    ]);
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
              mockEmptyDbTrajectoryLoadFR,
              mockEmptyDbTrajectoryLoadOthers,
            ],
            warningMessages: [],
          },
        },
      });
      expect(result.current.hypothesisTrajectories).toEqual([
        {
          hypothesis: 'FR (Default)',
          isDefault: true,
          isDeletable: false,
          status: TRAJECTORY_SELECTION_STATUS.MISSING,
          subRows: null,
          trajectory: null,
        },
        {
          hypothesis: 'AT',
          isDefault: false,
          isDeletable: true,
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
          isDeletable: true,
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
          isDeletable: true,
          status: TRAJECTORY_SELECTION_STATUS.MISSING,
          subRows: undefined,
          trajectory: null,
        },
        {
          hypothesis: 'ES',
          isDefault: false,
          isDeletable: true,
          status: TRAJECTORY_SELECTION_STATUS.MISSING,
          subRows: undefined,
          trajectory: null,
        },
        {
          hypothesis: OTHER_AREAS_LABEL,
          isDefault: true,
          isDeletable: false,
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
    vi.mocked(trajectoryUtils.buildDefaultEmptyTrajectoryList).mockImplementationOnce(() => [
      mockEmptyDbTrajectoryLoadFR,
      mockEmptyDbTrajectoryLoadOthers,
    ]);
    const { result } = renderHook(() => useFetchHypothesisTrajectories(5, TRAJECTORY_TYPE.LOAD, [{ name: 'FR' }]));

    await waitFor(() => {
      expect(trajectoryService.getStudyTrajectoriesWithWarnings).toHaveBeenCalledWith(5, TRAJECTORY_TYPE.LOAD);
      expect(mockDispatch).toHaveBeenCalledTimes(1);
      expect(mockDispatch).toHaveBeenCalledWith({
        type: STUDY_ACTION.ADD_TRAJECTORIES,
        payload: {
          [TRAJECTORY_TYPE.LOAD]: {
            trajectories: [...mockDbTrajectoryArrayLoad, mockEmptyDbTrajectoryLoadFR, mockEmptyDbTrajectoryLoadOthers],
            warningMessages: [],
          },
        },
      });
      expect(result.current.hypothesisTrajectories).toEqual([
        {
          hypothesis: 'FR (Default)',
          isDefault: true,
          isDeletable: false,
          status: TRAJECTORY_SELECTION_STATUS.MISSING,
          subRows: null,
          trajectory: null,
        },
        {
          hypothesis: 'AT',
          isDefault: false,
          isDeletable: true,
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
          isDeletable: true,
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
          isDeletable: false,
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
    vi.mocked(trajectoryUtils.buildDefaultEmptyTrajectoryList).mockImplementationOnce(() => [
      mockEmptyDbTrajectoryLoadFR,
      mockEmptyDbTrajectoryLoadOthers,
    ]);
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
            trajectories: [...mockDbTrajectoryArrayLoad, mockEmptyDbTrajectoryLoadFR, mockEmptyDbTrajectoryLoadOthers],
            warningMessages: [],
          },
        },
      });
      expect(result.current.hypothesisTrajectories).toEqual([
        {
          hypothesis: 'BE (Default)',
          isDefault: true,
          isDeletable: false,
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
          hypothesis: 'FR (Default)',
          isDefault: true,
          isDeletable: false,
          status: TRAJECTORY_SELECTION_STATUS.MISSING,
          subRows: null,
          trajectory: null,
        },
        {
          hypothesis: 'AT',
          isDefault: false,
          isDeletable: true,
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
          isDeletable: false,
          status: TRAJECTORY_SELECTION_STATUS.MISSING,
          subRows: null,
          trajectory: null,
        },
      ]);
    });
  });

  it('should exclude default areas already present in areas from checklist', async () => {
    const defaultAreas = [{ name: 'FR' }, { name: 'BE' }];
    const areas = [{ areaName: 'FR' }, { areaName: 'AT' }] as TrajectoryAreaData[];

    vi.mocked(trajectoryService.getStudyTrajectoriesWithWarnings).mockResolvedValue({
      trajectories: mockDbTrajectoryArrayLoad,
      warningMessages: [],
    });

    const { result } = renderHook(() => useFetchHypothesisTrajectories(5, TRAJECTORY_TYPE.LOAD, defaultAreas, areas));

    await waitFor(() => {
      expect(result.current.areasTrajectoryOptions).toEqual([
        { name: 'FR', isDefault: true },
        { name: 'BE', isDefault: true },
        { name: 'AT', isDefault: false },
      ]);
    });
  });

  it('should build correct dropDownListOptions from default and fetched trajectories', async () => {
    const defaultAreas = [{ name: 'FR' }];
    vi.mocked(trajectoryService.getStudyTrajectoriesWithWarnings).mockResolvedValue({
      trajectories: mockDbTrajectoryArrayLoad,
      warningMessages: [],
    });

    const { result } = renderHook(() => useFetchHypothesisTrajectories(5, TRAJECTORY_TYPE.LOAD, defaultAreas));

    await waitFor(() => {
      expect(result.current.dropDownListOptions).toEqual(expect.arrayContaining(['FR', 'AT', 'BE']));
    });
  });

  it('should build read only object from trajectories linked to study when study is generated', async () => {
    const defaultAreas = [{ name: 'FR' }];
    const areas = [{ areaName: 'AT' }] as TrajectoryAreaData[];
    mockUseStudy.mockImplementation(
      () =>
        ({
          ['LOAD']: { trajectories: mockEmptyDbTrajectoryArrayLoad, warningMessages: [] },
        }) as Partial<StudyState>,
    );
    vi.mocked(trajectoryService.getStudyTrajectoriesWithWarnings).mockResolvedValue({
      trajectories: mockDbTrajectoryArrayLoad,
      warningMessages: [],
    });

    const { result } = renderHook(() =>
      useFetchHypothesisTrajectories(5, TRAJECTORY_TYPE.LOAD, defaultAreas, areas, true),
    );

    await waitFor(() => {
      expect(result.current.readOnlyRow).toEqual({ '2': true, '3': true, '4': true });
    });
  });

  it('should include ThermalOptions when trajectoryType is THERMAL_CAPACITY', async () => {
    vi.mocked(trajectoryService.getStudyTrajectoriesWithWarnings).mockResolvedValue({
      trajectories: mockDbTrajectoryArrayThermal,
      warningMessages: [],
    });
    const technologiesHypothesis = ThermalOptions.map((option) => ({
      hypothesis: option,
      isDefault: true,
      status: TRAJECTORY_SELECTION_STATUS.MISSING,
      subRows: null,
      trajectory: null,
    }));

    const { result } = renderHook(() => useFetchHypothesisTrajectories(5, TRAJECTORY_TYPE.THERMAL_CAPACITY));

    await waitFor(() => expect(result.current.hypothesisTrajectories[0].subRows).toEqual(technologiesHypothesis));
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

  it('should throw error when api call throw an exception', async () => {
    const { result } = renderHook(() => useFetchHypothesisTrajectories());

    await waitFor(() => {
      expect(studyService.getStudyTrajectories).toHaveBeenCalledTimes(0);
      expect(result.current.hypothesisTrajectories).toEqual([]);
    });
  });
});
