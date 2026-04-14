import { beforeEach, describe, Mock, vi } from 'vitest';
import { useStudy, useStudyDispatch } from '@/store/contexts/StudyContext.tsx';
import { DbTrajectory, StudyDTO, StudyState, TrajectoryAreaData } from '@/shared/types';
import { fetchAndNormalizeTrajectories } from '@/shared/helpers/hypothesisTableHelper.ts';
import { renderHook, waitFor } from '@testing-library/react';
import * as studyService from '@/shared/services/studyService.ts';
import * as defaultConfigService from '@/shared/services/defaultConfigService.ts';
import {
  mockDbTrajectory,
  mockDbTrajectoryArrayLoad,
  mockDbTrajectoryArrayResCapacity,
  mockDbTrajectoryArrayResDistribution,
  mockDbTrajectoryArrayResLoad,
  mockDbTrajectoryArrayThermal,
  mockDefaultEmptyDbTrajectoryArrayDSR,
  mockEmptyDbTrajectoryArrayDSR,
  mockEmptyDbTrajectoryArrayLoad,
  mockEmptyDbTrajectoryArrayLoadSTS,
  mockEmptyDbTrajectoryLoadFR,
  mockEmptyDbTrajectoryLoadOthers,
} from '@/mocks/data/tests/trajectory.mock.ts';
import { TRAJECTORY_SELECTION_STATUS, TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { STUDY_ACTION } from '@/shared/enum/study.ts';
import { useFetchHypothesisTrajectories } from '@/hooks/useFetchHypothesisTrajectories.ts';
import * as trajectoryUtils from '@/shared/utils/trajectoryUtils.ts';
import { OTHER_AREAS_LABEL } from '@/shared/const/studyConfig.ts';
import { STSTechnology, ThermalOptions } from '@/mocks/data/list/names.ts';
import { getResTechnologyList } from '@/shared/services/trajectoryService.ts';
import { StudyStatus } from '@/shared/types/common/StudyStatus.type.ts';

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
vi.mock('@/shared/services/defaultConfigService', async (importOriginal) => {
  const actual: Mock = await importOriginal();
  return {
    ...actual,
    getThermalTechnologyList: vi.fn(),
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
    const study = { id: 5, status: StudyStatus.IN_PROGRESS } as StudyDTO;
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
    const { result } = renderHook(() =>
      useFetchHypothesisTrajectories([], [TRAJECTORY_TYPE.LOAD], [], 5, study.status),
    );

    await waitFor(() => {
      expect(studyService.getStudyTrajectories).toHaveBeenCalledWith(5, TRAJECTORY_TYPE.LOAD);
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
      expect(result.current.hypothesisTrajectories).toEqual({
        [TRAJECTORY_TYPE.LOAD]: [
          {
            hypothesis: 'AT',
            isDefault: false,
            isDeletable: true,
            status: TRAJECTORY_SELECTION_STATUS.OK,
            subRows: [],
            trajectory: {
              id: 1,
              trajectoryName: 'area_PB_2024',
              type: TRAJECTORY_TYPE.LOAD,
              version: 3,
              userName: 'mouad',
              creationDate: '2024-07-22 15:13:56.860045' as unknown as Date,
              area: 'AT',
              technology: '',
              hasTimeSeries: false,
            },
          },
          {
            hypothesis: 'BE',
            isDefault: false,
            isDeletable: true,
            status: TRAJECTORY_SELECTION_STATUS.OK,
            subRows: [],
            trajectory: {
              id: 2,
              trajectoryName: 'area_PB_2026',
              type: TRAJECTORY_TYPE.LOAD,
              version: 3,
              userName: 'mouad',
              creationDate: '2026-08-22 15:13:56.860045' as unknown as Date,
              area: 'BE',
              technology: '',
              hasTimeSeries: false,
            },
          },
          {
            hypothesis: 'DEkf',
            isDefault: false,
            isDeletable: true,
            status: TRAJECTORY_SELECTION_STATUS.MISSING,
            subRows: [],
            trajectory: null,
          },
          {
            hypothesis: 'ES',
            isDefault: false,
            isDeletable: true,
            status: TRAJECTORY_SELECTION_STATUS.MISSING,
            subRows: [],
            trajectory: null,
          },
          {
            hypothesis: 'FR',
            isDefault: false,
            isDeletable: true,
            status: TRAJECTORY_SELECTION_STATUS.OK,
            subRows: [],
            trajectory: {
              id: 6,
              trajectoryName: 'area_PB_2026',
              type: TRAJECTORY_TYPE.LOAD,
              version: 3,
              userName: 'mouad',
              creationDate: '2026-08-22 15:13:56.860045' as unknown as Date,
              area: 'FR',
              technology: '',
              hasTimeSeries: false,
            },
          },
          {
            hypothesis: OTHER_AREAS_LABEL,
            isDefault: true,
            isDeletable: false,
            status: TRAJECTORY_SELECTION_STATUS.MISSING,
            subRows: [],
            trajectory: null,
          },
        ],
      });
    });
  });

  it('should return correct hypothesis trajectory array if empty default trajectories not linked to study', async () => {
    const study = { id: 5, status: StudyStatus.IN_PROGRESS } as StudyDTO;
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
    const { result } = renderHook(() =>
      useFetchHypothesisTrajectories([], [TRAJECTORY_TYPE.LOAD], [{ name: 'FR' }], 5, study.status),
    );

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
      expect(result.current.hypothesisTrajectories).toEqual({
        [TRAJECTORY_TYPE.LOAD]: [
          {
            hypothesis: 'FR',
            isDefault: true,
            isDeletable: false,
            status: TRAJECTORY_SELECTION_STATUS.OK,
            subRows: null,
            trajectory: {
              id: 6,
              trajectoryName: 'area_PB_2026',
              type: TRAJECTORY_TYPE.LOAD,
              version: 3,
              userName: 'mouad',
              creationDate: '2026-08-22 15:13:56.860045' as unknown as Date,
              area: 'FR',
              technology: '',
              hasTimeSeries: false,
            },
          },
          {
            hypothesis: 'AT',
            isDefault: false,
            isDeletable: true,
            status: TRAJECTORY_SELECTION_STATUS.OK,
            subRows: [],
            trajectory: {
              id: 1,
              trajectoryName: 'area_PB_2024',
              type: TRAJECTORY_TYPE.LOAD,
              version: 3,
              userName: 'mouad',
              creationDate: '2024-07-22 15:13:56.860045' as unknown as Date,
              area: 'AT',
              technology: '',
              hasTimeSeries: false,
            },
          },
          {
            hypothesis: 'BE',
            isDefault: false,
            isDeletable: true,
            status: TRAJECTORY_SELECTION_STATUS.OK,
            subRows: [],
            trajectory: {
              id: 2,
              trajectoryName: 'area_PB_2026',
              type: TRAJECTORY_TYPE.LOAD,
              version: 3,
              userName: 'mouad',
              creationDate: '2026-08-22 15:13:56.860045' as unknown as Date,
              area: 'BE',
              technology: '',
              hasTimeSeries: false,
            },
          },
          {
            hypothesis: 'DEkf',
            isDefault: false,
            isDeletable: true,
            status: TRAJECTORY_SELECTION_STATUS.MISSING,
            subRows: [],
            trajectory: null,
          },
          {
            hypothesis: 'ES',
            isDefault: false,
            isDeletable: true,
            status: TRAJECTORY_SELECTION_STATUS.MISSING,
            subRows: [],
            trajectory: null,
          },
          {
            hypothesis: OTHER_AREAS_LABEL,
            isDefault: true,
            isDeletable: false,
            status: TRAJECTORY_SELECTION_STATUS.MISSING,
            subRows: [],
            trajectory: null,
          },
        ],
      });
    });
  });

  it('should return correct hypothesis trajectory array if no empty trajectory in context', async () => {
    const study = { id: 5, status: StudyStatus.IN_PROGRESS } as StudyDTO;
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
    const { result } = renderHook(() =>
      useFetchHypothesisTrajectories(
        [],
        [TRAJECTORY_TYPE.LOAD],
        [{ name: 'FR' }],
        5,
        study.status,
        StudyStatus.IN_PROGRESS,
      ),
    );

    await waitFor(() => {
      expect(studyService.getStudyTrajectories).toHaveBeenCalledWith(5, TRAJECTORY_TYPE.LOAD);
      expect(mockDispatch).toHaveBeenCalledTimes(1);
      expect(mockDispatch).toHaveBeenCalledWith({
        type: STUDY_ACTION.ADD_TRAJECTORIES,
        payload: {
          [TRAJECTORY_TYPE.LOAD]: {
            trajectories: [...mockDbTrajectoryArrayLoad, mockEmptyDbTrajectoryLoadOthers],
          },
        },
      });
      expect(result.current.hypothesisTrajectories).toEqual({
        [TRAJECTORY_TYPE.LOAD]: [
          {
            hypothesis: 'FR',
            isDefault: true,
            isDeletable: false,
            status: TRAJECTORY_SELECTION_STATUS.OK,
            subRows: null,
            trajectory: {
              id: 6,
              trajectoryName: 'area_PB_2026',
              type: TRAJECTORY_TYPE.LOAD,
              version: 3,
              userName: 'mouad',
              creationDate: '2026-08-22 15:13:56.860045' as unknown as Date,
              area: 'FR',
              technology: '',
              hasTimeSeries: false,
            },
          },
          {
            hypothesis: 'AT',
            isDefault: false,
            isDeletable: true,
            status: TRAJECTORY_SELECTION_STATUS.OK,
            subRows: [],
            trajectory: {
              id: 1,
              trajectoryName: 'area_PB_2024',
              type: TRAJECTORY_TYPE.LOAD,
              version: 3,
              userName: 'mouad',
              creationDate: '2024-07-22 15:13:56.860045' as unknown as Date,
              area: 'AT',
              technology: '',
              hasTimeSeries: false,
            },
          },
          {
            hypothesis: 'BE',
            isDefault: false,
            isDeletable: true,
            status: TRAJECTORY_SELECTION_STATUS.OK,
            subRows: [],
            trajectory: {
              id: 2,
              trajectoryName: 'area_PB_2026',
              type: TRAJECTORY_TYPE.LOAD,
              version: 3,
              userName: 'mouad',
              creationDate: '2026-08-22 15:13:56.860045' as unknown as Date,
              area: 'BE',
              technology: '',
              hasTimeSeries: false,
            },
          },
          {
            hypothesis: OTHER_AREAS_LABEL,
            isDefault: true,
            isDeletable: false,
            status: TRAJECTORY_SELECTION_STATUS.MISSING,
            subRows: [],
            trajectory: null,
          },
        ],
      });
    });
  });

  it('should return correct hypothesis trajectory array if empty one default trajectory not linked to study', async () => {
    vi.mocked(studyService.getStudyTrajectories).mockResolvedValue(mockDbTrajectoryArrayLoad);
    vi.mocked(trajectoryUtils.buildDefaultEmptyTrajectoryList).mockImplementationOnce(() => [
      mockEmptyDbTrajectoryLoadFR,
      mockEmptyDbTrajectoryLoadOthers,
    ]);
    const { result } = renderHook(() =>
      useFetchHypothesisTrajectories(
        [],
        [TRAJECTORY_TYPE.LOAD],
        [{ name: 'FR' }, { name: 'BE' }],
        5,
        StudyStatus.IN_PROGRESS,
      ),
    );

    await waitFor(() => {
      expect(studyService.getStudyTrajectories).toHaveBeenCalledWith(5, TRAJECTORY_TYPE.LOAD);
      expect(mockDispatch).toHaveBeenCalledTimes(1);
      expect(mockDispatch).toHaveBeenCalledWith({
        type: STUDY_ACTION.ADD_TRAJECTORIES,
        payload: {
          [TRAJECTORY_TYPE.LOAD]: {
            trajectories: [...mockDbTrajectoryArrayLoad, mockEmptyDbTrajectoryLoadOthers],
          },
        },
      });
      expect(result.current.hypothesisTrajectories).toEqual({
        [TRAJECTORY_TYPE.LOAD]: [
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
              hasTimeSeries: false,
            },
          },
          {
            hypothesis: 'FR',
            isDefault: true,
            isDeletable: false,
            status: TRAJECTORY_SELECTION_STATUS.OK,
            subRows: null,
            trajectory: {
              id: 6,
              trajectoryName: 'area_PB_2026',
              type: TRAJECTORY_TYPE.LOAD,
              version: 3,
              userName: 'mouad',
              creationDate: '2026-08-22 15:13:56.860045' as unknown as Date,
              area: 'FR',
              technology: '',
              hasTimeSeries: false,
            },
          },
          {
            hypothesis: 'AT',
            isDefault: false,
            isDeletable: true,
            status: TRAJECTORY_SELECTION_STATUS.OK,
            subRows: [],
            trajectory: {
              id: 1,
              trajectoryName: 'area_PB_2024',
              type: TRAJECTORY_TYPE.LOAD,
              version: 3,
              userName: 'mouad',
              creationDate: '2024-07-22 15:13:56.860045' as unknown as Date,
              area: 'AT',
              technology: '',
              hasTimeSeries: false,
            },
          },
          {
            hypothesis: OTHER_AREAS_LABEL,
            isDefault: true,
            isDeletable: false,
            status: TRAJECTORY_SELECTION_STATUS.MISSING,
            subRows: [],
            trajectory: null,
          },
        ],
      });
    });
  });

  it('should exclude default areas already present in areas from checklist', async () => {
    const defaultAreas = [{ name: 'FR' }, { name: 'BE' }];
    const areas = [{ areaName: 'FR' }, { areaName: 'AT' }] as TrajectoryAreaData[];

    vi.mocked(studyService.getStudyTrajectories).mockResolvedValue(mockDbTrajectoryArrayLoad);

    const { result } = renderHook(() =>
      useFetchHypothesisTrajectories(areas, [TRAJECTORY_TYPE.LOAD], defaultAreas, 5, StudyStatus.IN_PROGRESS),
    );

    await waitFor(() => {
      expect(result.current.areasTrajectoryOptions).toEqual({
        [TRAJECTORY_TYPE.LOAD]: [
          { name: 'FR', isDefault: true },
          { name: 'BE', isDefault: true },
          { name: 'AT', isDefault: false },
        ],
      });
    });
  });

  it('should build correct dropDownListOptions from default and fetched trajectories', async () => {
    const defaultAreas = [{ name: 'FR' }];
    const areas = [{ areaName: 'AT' }, { areaName: 'BE' }] as TrajectoryAreaData[];
    vi.mocked(studyService.getStudyTrajectories).mockResolvedValue(mockDbTrajectoryArrayLoad);

    const { result } = renderHook(() =>
      useFetchHypothesisTrajectories(areas, [TRAJECTORY_TYPE.LOAD], defaultAreas, 5, StudyStatus.IN_PROGRESS),
    );

    await waitFor(() => {
      expect(result.current.dropDownListOptions).toEqual({
        [TRAJECTORY_TYPE.LOAD]: ['FR', 'AT', 'BE', 'OTHERS'],
      });
    });
  });

  it('should build read only object from trajectories linked to study when study is generated', async () => {
    const defaultAreas = [{ name: 'FR' }];
    const areas = [{ areaName: 'AT' }] as TrajectoryAreaData[];
    mockUseStudy.mockImplementation(
      () =>
        ({
          ['LOAD']: { trajectories: mockDbTrajectoryArrayLoad, warningMessages: [] },
        }) as Partial<StudyState>,
    );

    const { result } = renderHook(() =>
      useFetchHypothesisTrajectories(
        areas,
        [TRAJECTORY_TYPE.LOAD],
        defaultAreas,
        5,
        StudyStatus.GENERATED,
        StudyStatus.GENERATED,
      ),
    );

    await waitFor(() => {
      expect(result.current.readOnlyRow).toEqual({
        [TRAJECTORY_TYPE.LOAD]: { '0': true, '1': true, '2': true },
      });
    });
  });

  it('should include ThermalOptions when trajectoryType is THERMAL_CAPACITY', async () => {
    vi.mocked(studyService.getStudyTrajectories).mockResolvedValue(mockDbTrajectoryArrayThermal);
    vi.mocked(defaultConfigService.getThermalTechnologyList).mockResolvedValue(
      ThermalOptions.map((option) => ({ name: option })),
    );
    const technologiesHypothesis = ThermalOptions.map((option) => ({
      hypothesis: option,
      isDefault: false,
      isDeletable: false,
      status: TRAJECTORY_SELECTION_STATUS.MISSING,
      subRows: null,
      trajectory: null,
    }));

    const { result } = renderHook(() =>
      useFetchHypothesisTrajectories([], [TRAJECTORY_TYPE.THERMAL_CAPACITY], [], 7, StudyStatus.IN_PROGRESS),
    );

    await waitFor(() =>
      expect(result.current.hypothesisTrajectories?.[TRAJECTORY_TYPE.THERMAL_CAPACITY]?.[0]?.subRows).toEqual(
        technologiesHypothesis,
      ),
    );
  });

  it('should include STSTechnology when trajectoryType is STS', async () => {
    const defaultAreas = [{ name: 'FR' }];
    const areas = [{ areaName: 'AT' }, { areaName: 'BE' }] as TrajectoryAreaData[];
    mockUseStudy.mockImplementation(
      () =>
        ({
          ['STS']: { trajectories: mockEmptyDbTrajectoryArrayLoadSTS, warningMessages: [] },
        }) as Partial<StudyState>,
    );
    vi.mocked(studyService.getStudyTrajectories).mockResolvedValue([]);
    const technologiesHypothesis = STSTechnology.map((option) => ({
      hypothesis: option,
      isDefault: false,
      isDeletable: false,
      status: TRAJECTORY_SELECTION_STATUS.MISSING,
      subRows: null,
      trajectory: null,
    }));

    const { result } = renderHook(() =>
      useFetchHypothesisTrajectories(
        areas,
        [TRAJECTORY_TYPE.STS],
        defaultAreas,
        7,
        StudyStatus.IN_PROGRESS,
        StudyStatus.IN_PROGRESS,
      ),
    );

    await waitFor(() => {
      expect(defaultConfigService.getThermalTechnologyList).not.toHaveBeenCalled();
      expect(result.current.hypothesisTrajectories?.[TRAJECTORY_TYPE.STS]).toEqual([
        {
          hypothesis: 'FR',
          isDefault: true,
          isDeletable: false,
          status: TRAJECTORY_SELECTION_STATUS.MISSING,
          subRows: technologiesHypothesis,
          trajectory: null,
        },
        {
          hypothesis: 'AT',
          isDefault: false,
          isDeletable: true,
          status: TRAJECTORY_SELECTION_STATUS.MISSING,
          subRows: technologiesHypothesis,
          trajectory: null,
        },
        {
          hypothesis: 'BE',
          isDefault: false,
          isDeletable: true,
          status: TRAJECTORY_SELECTION_STATUS.MISSING,
          subRows: technologiesHypothesis,
          trajectory: null,
        },
        {
          hypothesis: OTHER_AREAS_LABEL,
          isDefault: true,
          isDeletable: false,
          status: TRAJECTORY_SELECTION_STATUS.MISSING,
          subRows: technologiesHypothesis,
          trajectory: null,
        },
      ]);
    });
  });

  it('should include Capacity modulation as last row when trajectoryType is DSR', async () => {
    const defaultAreas = [{ name: 'FR' }];
    const areas = [{ areaName: 'FR' }, { areaName: 'AT' }, { areaName: 'BE' }] as TrajectoryAreaData[];
    mockUseStudy.mockImplementation(
      () =>
        ({
          ['DSR']: { trajectories: mockEmptyDbTrajectoryArrayDSR, warningMessages: [] },
        }) as Partial<StudyState>,
    );
    vi.mocked(trajectoryUtils.buildDefaultEmptyTrajectoryList).mockImplementationOnce(() => [
      mockDefaultEmptyDbTrajectoryArrayDSR,
    ]);
    vi.mocked(studyService.getStudyTrajectories).mockResolvedValue([]);

    const { result } = renderHook(() =>
      useFetchHypothesisTrajectories(areas, [TRAJECTORY_TYPE.DSR], defaultAreas, 5, StudyStatus.IN_PROGRESS),
    );

    await waitFor(() => {
      expect(defaultConfigService.getThermalTechnologyList).not.toHaveBeenCalled();
      expect(result.current.hypothesisTrajectories).toEqual({
        [TRAJECTORY_TYPE.DSR]: [
          {
            hypothesis: 'FR',
            isDefault: true,
            isDeletable: false,
            status: TRAJECTORY_SELECTION_STATUS.MISSING,
            subRows: [],
            trajectory: null,
          },
          {
            hypothesis: 'AT',
            isDefault: false,
            isDeletable: true,
            status: TRAJECTORY_SELECTION_STATUS.MISSING,
            subRows: [],
            trajectory: null,
          },
          {
            hypothesis: 'BE',
            isDefault: false,
            isDeletable: true,
            status: TRAJECTORY_SELECTION_STATUS.MISSING,
            subRows: [],
            trajectory: null,
          },
          {
            hypothesis: 'Other areas',
            isDefault: true,
            isDeletable: false,
            status: TRAJECTORY_SELECTION_STATUS.MISSING,
            subRows: [],
            trajectory: null,
          },
          {
            hypothesis: 'dsr.@capacityModulation',
            isDefault: false,
            isDeletable: false,
            status: TRAJECTORY_SELECTION_STATUS.MISSING,
            subRows: null,
            trajectory: null,
          },
        ],
      });
    });
  });

  it('returns RES technologies and normalized trajectories when trajectory type is RES_CAPACITY', async () => {
    const defaultAreas = [{ name: 'FR' }];
    const emptyAreaSelected = [{ id: 99, trajectoryName: '' }] as DbTrajectory[];

    vi.mocked(trajectoryUtils.buildDefaultEmptyTrajectoryList).mockReturnValue([
      { id: 11, trajectoryName: '' },
    ] as DbTrajectory[]);
    const expectedTrajectories = [
      { id: 1, trajectoryName: 'R1' },
      { id: 99, trajectoryName: '' },
      { id: 11, trajectoryName: '' },
    ] as DbTrajectory[];
    vi.spyOn(trajectoryUtils, 'removeDuplicate').mockReturnValue(expectedTrajectories);
    vi.spyOn(trajectoryUtils, 'removeDuplicateByTechnology').mockReturnValue(expectedTrajectories);

    const trajectoryService = await import('@/shared/services/trajectoryService.ts');
    vi.mocked(trajectoryService.getResTechnologyList).mockResolvedValue(['Offshore Wind', 'Solar PV']);

    const result = await fetchAndNormalizeTrajectories({
      id: 7,
      trajType: TRAJECTORY_TYPE.RES_CAPACITY,
      defaultAreas,
      emptyAreaSelected,
    });

    expect(trajectoryService.getResTechnologyList).toHaveBeenCalled();
    expect(result.technologies).toEqual(['Offshore Wind', 'Solar PV']);
    expect(result.trajectories).toEqual(expectedTrajectories);
    expect(result.dsrCmResult).toEqual([]);
  });

  it('propagates error when fetching RES technologies fails', async () => {
    const trajectoryService = await import('@/shared/services/trajectoryService.ts');
    vi.mocked(trajectoryService.getResTechnologyList).mockRejectedValue(new Error('res-fetch-failed'));

    await expect(
      fetchAndNormalizeTrajectories({
        id: 1,
        trajType: TRAJECTORY_TYPE.RES_LOAD,
        defaultAreas: [],
        emptyAreaSelected: [],
      }),
    ).rejects.toThrow('res-fetch-failed');
  });

  it.skip('should include ResOptions when trajectoryType is RES_CAPACITY', async () => {
    const defaultAreas = [{ name: 'FR' }];
    const areas = [{ areaName: 'AT' }, { areaName: 'BE' }] as TrajectoryAreaData[];
    vi.mocked(studyService.getStudyTrajectories).mockResolvedValue(mockDbTrajectoryArrayResCapacity);
    const restTech = await getResTechnologyList();
    const technologiesHypothesis = restTech.map((option) => ({
      hypothesis: option,
      isDefault: false,
      isDeletable: false,
      status: TRAJECTORY_SELECTION_STATUS.MISSING,
      subRows: null,
      trajectory: null,
    }));

    const { result } = renderHook(() =>
      useFetchHypothesisTrajectories(areas, [TRAJECTORY_TYPE.RES_CAPACITY], defaultAreas, 7, StudyStatus.IN_PROGRESS),
    );

    await waitFor(() => {
      expect(result.current.hypothesisTrajectories?.[TRAJECTORY_TYPE.RES_CAPACITY]?.[0]?.subRows).toEqual(
        technologiesHypothesis,
      );
    });
  });

  it.skip('should include ResOptions when trajectoryType is RES_LOAD', async () => {
    const defaultAreas = [{ name: 'FR' }];
    const areas = [{ areaName: 'AT' }, { areaName: 'BE' }] as TrajectoryAreaData[];
    vi.mocked(studyService.getStudyTrajectories).mockResolvedValue(mockDbTrajectoryArrayResLoad);
    const restTech2 = await getResTechnologyList();
    const technologiesHypothesis = restTech2.map((option) => ({
      hypothesis: option,
      isDefault: false,
      isDeletable: false,
      status: TRAJECTORY_SELECTION_STATUS.MISSING,
      subRows: null,
      trajectory: null,
    }));

    const { result } = renderHook(() =>
      useFetchHypothesisTrajectories(areas, [TRAJECTORY_TYPE.RES_LOAD], defaultAreas, 7, StudyStatus.IN_PROGRESS),
    );

    await waitFor(() => {
      expect(result.current.hypothesisTrajectories?.[TRAJECTORY_TYPE.RES_LOAD]?.[0]?.subRows).toEqual(
        technologiesHypothesis,
      );
    });
  });

  it.skip('should include ResOptions when trajectoryTypes are RES_ZONAL_DISTRIBUTION and RES_TECHNOLOGY_DISTRIBUTION', async () => {
    const defaultAreas = [{ name: 'FR' }];
    const areas = [{ areaName: 'AT' }, { areaName: 'BE' }] as TrajectoryAreaData[];
    vi.mocked(studyService.getStudyTrajectories).mockResolvedValue(mockDbTrajectoryArrayResDistribution);

    const { result } = renderHook(() =>
      useFetchHypothesisTrajectories(
        areas,
        [TRAJECTORY_TYPE.RES_ZONAL_DISTRIBUTION, TRAJECTORY_TYPE.RES_TECHNOLOGY_DISTRIBUTION],
        defaultAreas,
        7,
        StudyStatus.IN_PROGRESS,
      ),
    );

    await waitFor(() => {
      expect(result.current.hypothesisTrajectories?.[TRAJECTORY_TYPE.RES_ZONAL_DISTRIBUTION]).toEqual(
        mockDbTrajectoryArrayResDistribution[0],
      );
      expect(result.current.hypothesisTrajectories?.[TRAJECTORY_TYPE.RES_TECHNOLOGY_DISTRIBUTION]).toEqual(
        mockDbTrajectoryArrayResDistribution[1],
      );
    });
  });

  it('should not call api if only study id is provided', async () => {
    const { result } = renderHook(() =>
      useFetchHypothesisTrajectories([], [TRAJECTORY_TYPE.DSR], [], 5, StudyStatus.IN_PROGRESS),
    );

    await waitFor(() => {
      expect(studyService.getStudyTrajectories).toHaveBeenCalledTimes(0);
      expect(result.current.hypothesisTrajectories?.[TRAJECTORY_TYPE.DSR]).toBeUndefined();
    });
  });

  it('should not call api when no arguments area provided', async () => {
    const { result } = renderHook(() =>
      useFetchHypothesisTrajectories([], [TRAJECTORY_TYPE.DSR], [], 5, StudyStatus.IN_PROGRESS),
    );

    await waitFor(() => {
      expect(studyService.getStudyTrajectories).toHaveBeenCalledTimes(0);
      expect(result.current.hypothesisTrajectories?.[TRAJECTORY_TYPE.DSR]).toBeUndefined();
    });
  });

  it('should throw error when api call throw an exception', async () => {
    const { result } = renderHook(() =>
      useFetchHypothesisTrajectories([], [TRAJECTORY_TYPE.DSR], [], 5, StudyStatus.IN_PROGRESS),
    );

    await waitFor(() => {
      expect(studyService.getStudyTrajectories).toHaveBeenCalledTimes(0);
      expect(result.current.hypothesisTrajectories?.[TRAJECTORY_TYPE.DSR]).toBeUndefined();
    });
  });
});
