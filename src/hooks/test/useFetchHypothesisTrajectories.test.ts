import { beforeEach, describe, Mock, vi } from 'vitest';
import { useStudy, useStudyDispatch } from '@/store/contexts/StudyContext.tsx';
import { StudyState, TrajectoryAreaData } from '@/shared/types';
import { renderHook, waitFor } from '@testing-library/react';
import * as studyService from '@/shared/services/studyService.ts';
import * as hypothesisTableService from '@/shared/services/hypothesisTableService';
import {
  mockDbTrajectory,
  mockDbTrajectoryArrayCommonThermal,
  mockDbTrajectoryArrayLoad,
  mockDbTrajectoryArraySpecificThermal,
  mockDbTrajectoryArrayThermal,
  mockEmptyDbTrajectoryArrayLoad,
  mockEmptyDbTrajectoryLoadFR,
  mockEmptyDbTrajectoryLoadOthers,
  mockEmptyDbTrajectorySPECIFICAT,
  mockEmptyDbTrajectorySPECIFICBE,
  mockEmptyDbTrajectorySPECIFICCZ,
  mockEmptyDbTrajectorySPECIFICFR,
  mockEmptyDbTrajectorySpecificOthers,
} from '@/mocks/data/tests/trajectory.mock.ts';
import { TRAJECTORY_SELECTION_STATUS, TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { STUDY_ACTION } from '@/shared/enum/study.ts';
import { useFetchHypothesisTrajectories } from '@/hooks/useFetchHypothesisTrajectories.ts';
import * as trajectoryUtils from '@/shared/utils/trajectoryUtils.ts';
import { OTHER_AREAS_LABEL } from '@/shared/const/studyConfig.ts';
import { ThermalOptions } from '@/mocks/data/list/names.ts';

vi.mock('@/shared/services/trajectoryService');
vi.mock('@/shared/services/hypothesisTableService');
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

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'thermal.@specific': 'Specific',
        'thermal.@paramModulation': 'Modulation',
        'thermal.@common': 'Common',
      };
      return translations[key] || key;
    },
  }),
}));

describe('useFetchHypothesisTrajectories', () => {
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
    vi.mocked(studyService.getStudyTrajectories).mockResolvedValue(mockDbTrajectoryArrayLoad);
    vi.mocked(trajectoryUtils.buildDefaultEmptyTrajectoryList).mockImplementation(() => [
      mockEmptyDbTrajectoryLoadOthers,
    ]);
    const { result } = renderHook(() => useFetchHypothesisTrajectories(5, TRAJECTORY_TYPE.LOAD));

    await waitFor(() => {
      expect(studyService.getStudyTrajectories).toHaveBeenCalledWith(5, TRAJECTORY_TYPE.LOAD);
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
          },
        },
      });
      expect(result.current.hypothesisTrajectories).toEqual([
        {
          hypothesis: 'AT',
          isDefault: false,
          isDeletable: true,
          status: TRAJECTORY_SELECTION_STATUS.OK,
          subRows: null,
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
          hypothesis: 'DEkf',
          isDefault: false,
          isDeletable: true,
          status: TRAJECTORY_SELECTION_STATUS.MISSING,
          subRows: null,
          trajectory: null,
        },
        {
          hypothesis: 'ES',
          isDefault: false,
          isDeletable: true,
          status: TRAJECTORY_SELECTION_STATUS.MISSING,
          subRows: null,
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
    vi.mocked(studyService.getStudyTrajectories).mockResolvedValue(mockDbTrajectoryArrayLoad);
    vi.mocked(trajectoryUtils.buildDefaultEmptyTrajectoryList).mockImplementationOnce(() => [
      mockEmptyDbTrajectoryLoadFR,
      mockEmptyDbTrajectoryLoadOthers,
    ]);
    const { result } = renderHook(() => useFetchHypothesisTrajectories(5, TRAJECTORY_TYPE.LOAD, [{ name: 'FR' }]));

    await waitFor(() => {
      expect(studyService.getStudyTrajectories).toHaveBeenCalledWith(5, TRAJECTORY_TYPE.LOAD);
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
            //warningMessages: [],
          },
        },
      });
      expect(result.current.hypothesisTrajectories).toEqual([
        {
          hypothesis: 'FR',
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
          subRows: null,
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
          hypothesis: 'DEkf',
          isDefault: false,
          isDeletable: true,
          status: TRAJECTORY_SELECTION_STATUS.MISSING,
          subRows: null,
          trajectory: null,
        },
        {
          hypothesis: 'ES',
          isDefault: false,
          isDeletable: true,
          status: TRAJECTORY_SELECTION_STATUS.MISSING,
          subRows: null,
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
    vi.mocked(studyService.getStudyTrajectories).mockResolvedValue(mockDbTrajectoryArrayLoad);
    vi.mocked(trajectoryUtils.buildDefaultEmptyTrajectoryList).mockImplementationOnce(() => [
      mockEmptyDbTrajectoryLoadFR,
      mockEmptyDbTrajectoryLoadOthers,
    ]);
    const { result } = renderHook(() => useFetchHypothesisTrajectories(5, TRAJECTORY_TYPE.LOAD, [{ name: 'FR' }]));

    await waitFor(() => {
      expect(studyService.getStudyTrajectories).toHaveBeenCalledWith(5, TRAJECTORY_TYPE.LOAD);
      expect(mockDispatch).toHaveBeenCalledTimes(1);
      expect(mockDispatch).toHaveBeenCalledWith({
        type: STUDY_ACTION.ADD_TRAJECTORIES,
        payload: {
          [TRAJECTORY_TYPE.LOAD]: {
            trajectories: [...mockDbTrajectoryArrayLoad, mockEmptyDbTrajectoryLoadFR, mockEmptyDbTrajectoryLoadOthers],
          },
        },
      });
      expect(result.current.hypothesisTrajectories).toEqual([
        {
          hypothesis: 'FR',
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
          subRows: null,
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
    vi.mocked(studyService.getStudyTrajectories).mockResolvedValue(mockDbTrajectoryArrayLoad);
    vi.mocked(trajectoryUtils.buildDefaultEmptyTrajectoryList).mockImplementationOnce(() => [
      mockEmptyDbTrajectoryLoadFR,
      mockEmptyDbTrajectoryLoadOthers,
    ]);
    const { result } = renderHook(() =>
      useFetchHypothesisTrajectories(5, TRAJECTORY_TYPE.LOAD, [{ name: 'FR' }, { name: 'BE' }]),
    );

    await waitFor(() => {
      expect(studyService.getStudyTrajectories).toHaveBeenCalledWith(5, TRAJECTORY_TYPE.LOAD);
      expect(mockDispatch).toHaveBeenCalledTimes(1);
      expect(mockDispatch).toHaveBeenCalledWith({
        type: STUDY_ACTION.ADD_TRAJECTORIES,
        payload: {
          [TRAJECTORY_TYPE.LOAD]: {
            trajectories: [...mockDbTrajectoryArrayLoad, mockEmptyDbTrajectoryLoadFR, mockEmptyDbTrajectoryLoadOthers],
          },
        },
      });
      expect(result.current.hypothesisTrajectories).toEqual([
        {
          hypothesis: 'BE',
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
          hypothesis: 'FR',
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
          subRows: null,
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

    vi.mocked(studyService.getStudyTrajectories).mockResolvedValue(mockDbTrajectoryArrayLoad);

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
    vi.mocked(studyService.getStudyTrajectories).mockResolvedValue(mockDbTrajectoryArrayLoad);

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
    vi.mocked(studyService.getStudyTrajectories).mockResolvedValue(mockDbTrajectoryArrayLoad);

    const { result } = renderHook(() =>
      useFetchHypothesisTrajectories(5, TRAJECTORY_TYPE.LOAD, defaultAreas, areas, true),
    );

    await waitFor(() => {
      expect(result.current.readOnlyRow).toEqual({ '2': true, '3': true, '4': true });
    });
  });

  it('should include ThermalOptions when trajectoryType is THERMAL_CAPACITY', async () => {
    vi.mocked(studyService.getStudyTrajectories).mockResolvedValue(mockDbTrajectoryArrayThermal);
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

  it('should include SPECIFIC, MODULATION and COMMON lines when trajectoryType is THERMAL_PARAMETER', async () => {
    vi.mocked(hypothesisTableService.fetchTrajectoriesFromTypes).mockResolvedValueOnce({
      [TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER]: mockDbTrajectoryArraySpecificThermal,
      [TRAJECTORY_TYPE.THERMAL_TECHNICAL_COMMON_PARAMETER]: [mockDbTrajectoryArrayCommonThermal],
      [TRAJECTORY_TYPE.THERMAL_TECHNICAL_MODULATION_PARAMETER]: [],
    });

    vi.mocked(trajectoryUtils.buildDefaultEmptyTrajectoryList).mockImplementationOnce(() => [
      mockEmptyDbTrajectorySPECIFICAT,
      mockEmptyDbTrajectorySPECIFICBE,
      mockEmptyDbTrajectorySpecificOthers,
    ]);

    const { result } = renderHook(() => useFetchHypothesisTrajectories(5, TRAJECTORY_TYPE.THERMAL_PARAMETER));

    await waitFor(() => {
      expect(result.current.hypothesisTrajectories[0]?.hypothesis).toEqual('Specific');
      expect(result.current.hypothesisTrajectories[0]?.status).toEqual(TRAJECTORY_SELECTION_STATUS.MISSING);
      expect(result.current.hypothesisTrajectories[0]?.isDefault).toBeFalsy();
      expect(result.current.hypothesisTrajectories[0]?.isDeletable).toBeFalsy();
      expect(result.current.hypothesisTrajectories[0]?.subRows).toHaveLength(3);
      expect(result.current.hypothesisTrajectories[0]?.subRows?.[0]).toEqual({
        hypothesis: mockDbTrajectoryArraySpecificThermal[0]?.area,
        trajectory: mockDbTrajectoryArraySpecificThermal[0],
        status: TRAJECTORY_SELECTION_STATUS.OK,
        isDefault: false,
        isDeletable: true,
        subRows: null,
      });
      expect(result.current.hypothesisTrajectories[0]?.subRows?.[1]).toEqual({
        hypothesis: mockDbTrajectoryArraySpecificThermal[1]?.area,
        trajectory: mockDbTrajectoryArraySpecificThermal[1],
        status: TRAJECTORY_SELECTION_STATUS.OK,
        isDefault: false,
        isDeletable: true,
        subRows: null,
      });
      expect(result.current.hypothesisTrajectories[0]?.subRows?.[2]).toEqual({
        hypothesis: OTHER_AREAS_LABEL,
        trajectory: null,
        status: TRAJECTORY_SELECTION_STATUS.MISSING,
        isDefault: true,
        isDeletable: false,
        subRows: null,
      });
      expect(result.current.hypothesisTrajectories[1]?.hypothesis).toEqual('Modulation');
      expect(result.current.hypothesisTrajectories[2]?.hypothesis).toEqual('Common');
      expect(result.current.hypothesisTrajectories[2]?.trajectory).toEqual(mockDbTrajectoryArrayCommonThermal);
      expect(result.current.hypothesisTrajectories[2]?.status).toEqual(TRAJECTORY_SELECTION_STATUS.OK);
      expect(result.current.hypothesisTrajectories[2]?.isDefault).toBeFalsy();
      expect(result.current.hypothesisTrajectories[2]?.isDeletable).toBeFalsy();
      expect(result.current.hypothesisTrajectories[2]?.subRows).toBeNull();
      expect(result.current.readOnlyRow).toEqual({});
    });
  });

  it('should not have read-only area if THERMAL_TECHNICAL_SPECIFIC_PARAMETER trajectories are set', async () => {
    const defaultAreasSpecific = [{ name: 'AT' }, { name: 'FR' }];
    const areas = [{ areaName: 'AT' }, { areaName: 'CZ' }] as TrajectoryAreaData[];
    vi.mocked(hypothesisTableService.fetchTrajectoriesFromTypes).mockResolvedValueOnce({
      [TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER]: mockDbTrajectoryArraySpecificThermal,
      [TRAJECTORY_TYPE.THERMAL_TECHNICAL_COMMON_PARAMETER]: [],
      [TRAJECTORY_TYPE.THERMAL_TECHNICAL_MODULATION_PARAMETER]: [],
    });
    vi.mocked(trajectoryUtils.buildDefaultEmptyTrajectoryList).mockImplementationOnce(() => [
      mockEmptyDbTrajectorySPECIFICFR,
      mockEmptyDbTrajectorySPECIFICCZ,
      mockEmptyDbTrajectorySpecificOthers,
    ]);

    const { result } = renderHook(() =>
      useFetchHypothesisTrajectories(5, TRAJECTORY_TYPE.THERMAL_PARAMETER, defaultAreasSpecific, areas),
    );

    await waitFor(() => {
      expect(result.current.hypothesisTrajectories[0]?.subRows?.[0]?.hypothesis).toEqual('AT');
      expect(result.current.hypothesisTrajectories[0]?.subRows?.[0]?.trajectory).toEqual(
        mockDbTrajectoryArraySpecificThermal[0],
      );
      expect(result.current.hypothesisTrajectories[0]?.subRows?.[1]?.hypothesis).toEqual('FR');
      expect(result.current.hypothesisTrajectories[0]?.subRows?.[2]?.hypothesis).toEqual('BE');
      expect(result.current.hypothesisTrajectories[0]?.subRows?.[3]?.hypothesis).toEqual('CZ');
      expect(result.current.hypothesisTrajectories[0]?.subRows?.[4]?.hypothesis).toEqual(OTHER_AREAS_LABEL);
      expect(result.current.readOnlyRow).toEqual({ '0.1': true });
    });
  });

  it('should set read-only status to default area not in area list and param modulation line if no specific trajectory', async () => {
    const defaultAreasSpecific = [{ name: 'AT' }, { name: 'FR' }];
    const areas = [{ areaName: 'AT' }, { areaName: 'CZ' }] as TrajectoryAreaData[];
    vi.mocked(hypothesisTableService.fetchTrajectoriesFromTypes).mockResolvedValueOnce({
      [TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER]: [],
      [TRAJECTORY_TYPE.THERMAL_TECHNICAL_COMMON_PARAMETER]: [],
      [TRAJECTORY_TYPE.THERMAL_TECHNICAL_MODULATION_PARAMETER]: [],
    });
    vi.mocked(trajectoryUtils.buildDefaultEmptyTrajectoryList).mockImplementationOnce(() => [
      mockEmptyDbTrajectorySPECIFICFR,
      mockEmptyDbTrajectorySPECIFICCZ,
      mockEmptyDbTrajectorySpecificOthers,
    ]);

    const { result } = renderHook(() =>
      useFetchHypothesisTrajectories(5, TRAJECTORY_TYPE.THERMAL_PARAMETER, defaultAreasSpecific, areas),
    );

    await waitFor(() => {
      expect(result.current.readOnlyRow).toEqual({ '0.0': true, '1': true });
    });
  });

  it('should set read-only status for param modulation line if no specific param', async () => {
    const defaultAreasSpecific = [{ name: 'AT' }, { name: 'FR' }];
    const areas = [{ areaName: 'AT' }, { areaName: 'CZ' }, { areaName: 'FR' }] as TrajectoryAreaData[];
    vi.mocked(hypothesisTableService.fetchTrajectoriesFromTypes).mockResolvedValueOnce({
      [TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER]: [],
      [TRAJECTORY_TYPE.THERMAL_TECHNICAL_COMMON_PARAMETER]: [],
      [TRAJECTORY_TYPE.THERMAL_TECHNICAL_MODULATION_PARAMETER]: [],
    });
    vi.mocked(trajectoryUtils.buildDefaultEmptyTrajectoryList).mockImplementationOnce(() => [
      mockEmptyDbTrajectorySPECIFICFR,
      mockEmptyDbTrajectorySPECIFICCZ,
      mockEmptyDbTrajectoryLoadOthers,
    ]);

    const { result } = renderHook(() =>
      useFetchHypothesisTrajectories(5, TRAJECTORY_TYPE.THERMAL_PARAMETER, defaultAreasSpecific, areas),
    );

    await waitFor(() => {
      expect(result.current.hypothesisTrajectories[0]?.subRows?.[0]?.hypothesis).toEqual('FR');
      expect(result.current.hypothesisTrajectories[0]?.subRows?.[1]?.hypothesis).toEqual('CZ');
      expect(result.current.hypothesisTrajectories[0]?.subRows?.[2]?.hypothesis).toEqual(OTHER_AREAS_LABEL);
      expect(result.current.readOnlyRow).toEqual({ '1': true });
    });
  });
});
