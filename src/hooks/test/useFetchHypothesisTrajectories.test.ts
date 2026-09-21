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
  mockEmptyDbTrajectorySTSOthers,
  resTechnologies,
} from '@/mocks/data/tests/trajectory.mock.ts';
import { TRAJECTORY_SELECTION_STATUS, TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { STUDY_ACTION } from '@/shared/enum/study.ts';
import { useFetchHypothesisTrajectories } from '@/hooks/useFetchHypothesisTrajectories.ts';
import * as trajectoryUtils from '@/shared/utils/trajectoryUtils.ts';
import * as trajectoryService from '@/shared/services/trajectoryService';
import { OTHER_AREAS_LABEL } from '@/shared/const/studyConfig.ts';
import { HydroSubRows, STSTechnology, ThermalOptionsResults } from '@/mocks/data/list/names.ts';
import { StudyStatus } from '@/shared/types/common/StudyStatus.type.ts';
import { ME_TYPES, NUCLEAR_FR_MODULATION_TYPES, P2G_TYPES } from '@/shared/const/trajectoryTypes.ts';

vi.mock('@/shared/services/trajectoryService', async (importOriginal) => {
  const actual: Mock = await importOriginal();
  return {
    ...actual,
    getResTechnologyList: vi.fn().mockReturnValue([
      {
        id: 1,
        label: 'Wind Offshore',
        code: 'wind_offshore',
      },
      {
        id: 2,
        label: 'Wind Onshore',
        code: 'wind_onshore',
      },
      {
        id: 3,
        label: 'Solar PV',
        code: 'solar_pv',
      },
      {
        id: 4,
        label: 'Solar Thermo',
        code: 'solar_thermo',
      },
    ]),
  };
});
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
      useFetchHypothesisTrajectories([TRAJECTORY_TYPE.LOAD], 5, study.status),
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
      useFetchHypothesisTrajectories([TRAJECTORY_TYPE.LOAD], 5, study.status, undefined, [{ name: 'FR' }]),
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
        [TRAJECTORY_TYPE.LOAD],
        5,
        study.status,
        StudyStatus.IN_PROGRESS,
        [{ name: 'FR' }],
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
        [TRAJECTORY_TYPE.LOAD],
        5,
        StudyStatus.IN_PROGRESS,
        undefined,
        [{ name: 'FR' }, { name: 'BE' }],
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
      useFetchHypothesisTrajectories([TRAJECTORY_TYPE.LOAD], 5, StudyStatus.IN_PROGRESS, undefined, defaultAreas, areas),
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
      useFetchHypothesisTrajectories([TRAJECTORY_TYPE.LOAD], 5, StudyStatus.IN_PROGRESS, undefined, defaultAreas, areas),
    );

    await waitFor(() => {
      expect(result.current.dropDownListOptions).toEqual({
        [TRAJECTORY_TYPE.LOAD]: ['FR', 'AT', 'BE'],
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
        [TRAJECTORY_TYPE.LOAD],
        5,
        StudyStatus.GENERATED,
        StudyStatus.GENERATED,
        defaultAreas,
        areas
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
    vi.mocked(defaultConfigService.getThermalTechnologyList).mockResolvedValue(ThermalOptionsResults);
    const technologiesHypothesis = ThermalOptionsResults.map((option) => ({
      hypothesis: option.label,
      isDefault: false,
      isDeletable: false,
      status: TRAJECTORY_SELECTION_STATUS.MISSING,
      subRows: null,
      trajectory: null,
    }));

    const { result } = renderHook(() =>
      useFetchHypothesisTrajectories([TRAJECTORY_TYPE.THERMAL_CAPACITY],7, StudyStatus.IN_PROGRESS),
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
    vi.mocked(trajectoryUtils.buildDefaultEmptyTrajectoryList).mockImplementationOnce(() => [
      mockEmptyDbTrajectorySTSOthers,
    ]);
    mockUseStudy.mockImplementation(
      () =>
        ({
          ['STS']: { trajectories: mockEmptyDbTrajectoryArrayLoadSTS, warningMessages: [] },
        }) as Partial<StudyState>,
    );
    vi.mocked(studyService.getStudyTrajectories).mockResolvedValue([]);
    const technologiesHypothesis = STSTechnology.map((option) => ({
      hypothesis: option.label,
      isDefault: false,
      isDeletable: false,
      status: TRAJECTORY_SELECTION_STATUS.MISSING,
      subRows: null,
      trajectory: null,
    }));

    const { result } = renderHook(() =>
      useFetchHypothesisTrajectories(
        [TRAJECTORY_TYPE.STS],
        7,
        StudyStatus.IN_PROGRESS,
        StudyStatus.IN_PROGRESS,
        defaultAreas,
        areas
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
      useFetchHypothesisTrajectories([TRAJECTORY_TYPE.DSR], 5, StudyStatus.IN_PROGRESS, undefined, defaultAreas, areas),
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
    const removeDuplicateSpy = vi.spyOn(trajectoryUtils, 'removeDuplicate').mockReturnValue(expectedTrajectories);
    const removeDuplicateByTechSpy = vi
      .spyOn(trajectoryUtils, 'removeDuplicateByTechnology')
      .mockReturnValue(expectedTrajectories);

    try {
      const result = await fetchAndNormalizeTrajectories({
        id: 7,
        trajType: TRAJECTORY_TYPE.RES_CAPACITY,
        defaultAreas,
        emptyAreaSelected,
      });

      expect(trajectoryService.getResTechnologyList).toHaveBeenCalled();
      expect(result.technologies).toEqual(resTechnologies);
      expect(result.trajectories).toEqual(expectedTrajectories);
      expect(result.dsrCmResult).toEqual([]);
    } finally {
      removeDuplicateSpy.mockRestore();
      removeDuplicateByTechSpy.mockRestore();
    }
  });

  it('should include ResOptions when trajectoryType is RES_CAPACITY', async () => {
    const defaultAreas = [{ name: 'FR' }];
    const areas = [{ areaName: 'AT' }, { areaName: 'BE' }] as TrajectoryAreaData[];
    vi.mocked(studyService.getStudyTrajectories).mockResolvedValue(mockDbTrajectoryArrayResCapacity);
    const technologiesHypothesis = resTechnologies.map((option) => ({
      hypothesis: option.label,
      isDefault: false,
      isDeletable: false,
      status: TRAJECTORY_SELECTION_STATUS.MISSING,
      subRows: null,
      trajectory: null,
    }));

    const { result } = renderHook(() =>
      useFetchHypothesisTrajectories([TRAJECTORY_TYPE.RES_CAPACITY], 7, StudyStatus.IN_PROGRESS, undefined, defaultAreas, areas),
    );

    await waitFor(() => {
      expect(result.current.hypothesisTrajectories?.[TRAJECTORY_TYPE.RES_CAPACITY]?.[0]?.subRows).toEqual(
        technologiesHypothesis,
      );
    });
  });

  it('should include ResOptions when trajectoryType is RES_LOAD', async () => {
    const defaultAreas = [{ name: 'FR' }];
    const areas = [{ areaName: 'AT' }, { areaName: 'BE' }] as TrajectoryAreaData[];
    vi.mocked(studyService.getStudyTrajectories).mockResolvedValue(mockDbTrajectoryArrayResLoad);
    const technologiesHypothesis = resTechnologies.map((option) => ({
      hypothesis: option.label,
      isDefault: false,
      isDeletable: false,
      status: TRAJECTORY_SELECTION_STATUS.MISSING,
      subRows: null,
      trajectory: null,
    }));

    const { result } = renderHook(() =>
      useFetchHypothesisTrajectories([TRAJECTORY_TYPE.RES_LOAD],7, StudyStatus.IN_PROGRESS, undefined, defaultAreas, areas),
    );

    await waitFor(() => {
      expect(result.current.hypothesisTrajectories?.[TRAJECTORY_TYPE.RES_LOAD]?.[0]?.subRows).toEqual(
        technologiesHypothesis,
      );
    });
  });

  it('should include ResOptions when trajectoryTypes are RES_ZONAL_DISTRIBUTION and RES_TECHNOLOGY_DISTRIBUTION', async () => {
    const defaultAreas = [{ name: 'FR' }];
    const areas = [{ areaName: 'AT' }, { areaName: 'BE' }] as TrajectoryAreaData[];
    vi.mocked(studyService.getStudyTrajectories).mockResolvedValue(mockDbTrajectoryArrayResDistribution);

    const { result } = renderHook(() =>
      useFetchHypothesisTrajectories(
        [TRAJECTORY_TYPE.RES_ZONAL_DISTRIBUTION, TRAJECTORY_TYPE.RES_TECHNOLOGY_DISTRIBUTION],
        7,
        StudyStatus.IN_PROGRESS,
        undefined, defaultAreas, areas
      ),
    );

    await waitFor(() => {
      const hypothesisATZonal = result.current.hypothesisTrajectories?.[TRAJECTORY_TYPE.RES_ZONAL_DISTRIBUTION]?.find(
        (hypothesis) => hypothesis.hypothesis === 'AT',
      );
      expect(hypothesisATZonal?.trajectory).toEqual(mockDbTrajectoryArrayResDistribution[0]);
      const hypothesisBETechnology = result.current.hypothesisTrajectories?.[
        TRAJECTORY_TYPE.RES_TECHNOLOGY_DISTRIBUTION
      ]?.find((hypothesis) => hypothesis.hypothesis === 'BE');
      expect(hypothesisBETechnology?.trajectory).toEqual(mockDbTrajectoryArrayResDistribution[1]);
    });
  });

  it('should not call api if only study id is provided', async () => {
    const { result } = renderHook(() =>
      useFetchHypothesisTrajectories([TRAJECTORY_TYPE.DSR],5, StudyStatus.IN_PROGRESS),
    );

    await waitFor(() => {
      expect(studyService.getStudyTrajectories).toHaveBeenCalledTimes(0);
      expect(result.current.hypothesisTrajectories?.[TRAJECTORY_TYPE.DSR]).toBeUndefined();
    });
  });

  it('should not call api when no arguments area provided', async () => {
    const { result } = renderHook(() =>
      useFetchHypothesisTrajectories([TRAJECTORY_TYPE.DSR], 5, StudyStatus.IN_PROGRESS),
    );

    await waitFor(() => {
      expect(studyService.getStudyTrajectories).toHaveBeenCalledTimes(0);
      expect(result.current.hypothesisTrajectories?.[TRAJECTORY_TYPE.DSR]).toBeUndefined();
    });
  });

  it('should throw error when api call throw an exception', async () => {
    const { result } = renderHook(() =>
      useFetchHypothesisTrajectories([TRAJECTORY_TYPE.DSR],5, StudyStatus.IN_PROGRESS),
    );

    await waitFor(() => {
      expect(studyService.getStudyTrajectories).toHaveBeenCalledTimes(0);
      expect(result.current.hypothesisTrajectories?.[TRAJECTORY_TYPE.DSR]).toBeUndefined();
    });
  });

  it('should build merged rows for HYDRO_SERIES combining trajectories from both hydro sub-types', async () => {
    const areas = [{ areaName: 'FR' }] as TrajectoryAreaData[];

    const hydroSeriesTrajectory: DbTrajectory = {
      id: 10,
      trajectoryName: 'hydro_series_FR',
      type: TRAJECTORY_TYPE.HYDRO_SERIES,
      area: 'FR',
      technology: '',
      version: 1,
      userName: 'test',
      creationDate: '2024-01-01' as unknown as Date,
      hasTimeSeries: false,
    };

    const hydroTechParamsTrajectory: DbTrajectory = {
      id: 11,
      trajectoryName: 'hydro_tech_params_FR',
      type: TRAJECTORY_TYPE.HYDRO_TECHNICAL_PARAMETERS,
      area: 'FR',
      technology: '',
      version: 1,
      userName: 'test',
      creationDate: '2024-01-01' as unknown as Date,
      hasTimeSeries: false,
    };

    mockUseStudy.mockReturnValue({
      [TRAJECTORY_TYPE.HYDRO_SERIES]: { trajectories: [], warningMessages: [] },
      [TRAJECTORY_TYPE.HYDRO_TECHNICAL_PARAMETERS]: { trajectories: [], warningMessages: [] },
    } as Partial<StudyState>);

    vi.mocked(studyService.getStudyTrajectories).mockImplementation((_, type) => {
      if (type === TRAJECTORY_TYPE.HYDRO_SERIES) return Promise.resolve([hydroSeriesTrajectory]);
      if (type === TRAJECTORY_TYPE.HYDRO_TECHNICAL_PARAMETERS) return Promise.resolve([hydroTechParamsTrajectory]);
      return Promise.resolve([]);
    });

    vi.mocked(trajectoryUtils.buildDefaultEmptyTrajectoryList).mockReturnValue([]);

    const { result } = renderHook(() =>
      useFetchHypothesisTrajectories(
        [TRAJECTORY_TYPE.HYDRO_SERIES, TRAJECTORY_TYPE.HYDRO_TECHNICAL_PARAMETERS],
        5,
        StudyStatus.IN_PROGRESS,
        undefined, [], areas
      ),
    );

    await waitFor(() => {
      expect(studyService.getStudyTrajectories).toHaveBeenCalledWith(5, TRAJECTORY_TYPE.HYDRO_SERIES);
      expect(studyService.getStudyTrajectories).toHaveBeenCalledWith(5, TRAJECTORY_TYPE.HYDRO_TECHNICAL_PARAMETERS);

      const hydroRows = result.current.hypothesisTrajectories?.[TRAJECTORY_TYPE.HYDRO_SERIES];
      expect(hydroRows).toBeDefined();

      const frRow = hydroRows?.find((r) => r.hypothesis === 'FR');
      expect(frRow).toBeDefined();
      expect(frRow?.trajectory).toBeNull();

      // La subrow 'Series' provient du fetch HYDRO_SERIES
      const seriesSubRow = frRow?.subRows?.find((sr) => sr.hypothesis === HydroSubRows[0].label);
      expect(seriesSubRow?.trajectory).toEqual(hydroSeriesTrajectory);
      expect(seriesSubRow?.status).toBe(TRAJECTORY_SELECTION_STATUS.OK);

      // La subrow 'Technical parameters' provient du fetch HYDRO_TECHNICAL_PARAMETERS
      const techParamsSubRow = frRow?.subRows?.find((sr) => sr.hypothesis === HydroSubRows[1].label);
      expect(techParamsSubRow?.trajectory).toEqual(hydroTechParamsTrajectory);
      expect(techParamsSubRow?.status).toBe(TRAJECTORY_SELECTION_STATUS.OK);
    });

    // Les rows HYDRO_TECHNICAL_PARAMETERS ne sont pas stockées séparément
    expect(result.current.hypothesisTrajectories?.[TRAJECTORY_TYPE.HYDRO_TECHNICAL_PARAMETERS]).toBeUndefined();
  });

  it('should build merged rows for HYDRO_PSP_SERIES combining trajectories from both hydro sub-types', async () => {
    const areas = [{ areaName: 'FR' }] as TrajectoryAreaData[];

    const hydroPSPSeriesTrajectory: DbTrajectory = {
      id: 10,
      trajectoryName: 'hydro_series_FR',
      type: TRAJECTORY_TYPE.HYDRO_PSP_SERIES,
      area: 'FR',
      technology: '',
      version: 1,
      userName: 'test',
      creationDate: '2024-01-01' as unknown as Date,
      hasTimeSeries: false,
    };

    const hydroPSPTechParamsTrajectory: DbTrajectory = {
      id: 11,
      trajectoryName: 'hydro_tech_params_FR',
      type: TRAJECTORY_TYPE.HYDRO_PSP_TECHNICAL_PARAMETERS,
      area: 'FR',
      technology: '',
      version: 1,
      userName: 'test',
      creationDate: '2024-01-01' as unknown as Date,
      hasTimeSeries: false,
    };

    mockUseStudy.mockReturnValue({
      [TRAJECTORY_TYPE.HYDRO_PSP_SERIES]: { trajectories: [], warningMessages: [] },
      [TRAJECTORY_TYPE.HYDRO_PSP_TECHNICAL_PARAMETERS]: { trajectories: [], warningMessages: [] },
    } as Partial<StudyState>);

    vi.mocked(studyService.getStudyTrajectories).mockImplementation((_, type) => {
      if (type === TRAJECTORY_TYPE.HYDRO_PSP_SERIES) return Promise.resolve([hydroPSPSeriesTrajectory]);
      if (type === TRAJECTORY_TYPE.HYDRO_PSP_TECHNICAL_PARAMETERS)
        return Promise.resolve([hydroPSPTechParamsTrajectory]);
      return Promise.resolve([]);
    });

    vi.mocked(trajectoryUtils.buildDefaultEmptyTrajectoryList).mockReturnValue([]);

    const { result } = renderHook(() =>
      useFetchHypothesisTrajectories(
        [TRAJECTORY_TYPE.HYDRO_PSP_SERIES, TRAJECTORY_TYPE.HYDRO_PSP_TECHNICAL_PARAMETERS],
        5,
        StudyStatus.IN_PROGRESS,
        undefined, [], areas
      ),
    );

    await waitFor(() => {
      expect(studyService.getStudyTrajectories).toHaveBeenCalledWith(5, TRAJECTORY_TYPE.HYDRO_PSP_SERIES);
      expect(studyService.getStudyTrajectories).toHaveBeenCalledWith(5, TRAJECTORY_TYPE.HYDRO_PSP_TECHNICAL_PARAMETERS);

      const hydroRows = result.current.hypothesisTrajectories?.[TRAJECTORY_TYPE.HYDRO_PSP_SERIES];
      expect(hydroRows).toBeDefined();

      const frRow = hydroRows?.find((r) => r.hypothesis === 'FR');
      expect(frRow).toBeDefined();
      expect(frRow?.trajectory).toBeNull();

      // La subrow 'Series' provient du fetch HYDRO_SERIES
      const seriesSubRow = frRow?.subRows?.find((sr) => sr.hypothesis === HydroSubRows[0].label);
      expect(seriesSubRow?.trajectory).toEqual(hydroPSPSeriesTrajectory);
      expect(seriesSubRow?.status).toBe(TRAJECTORY_SELECTION_STATUS.OK);

      // La subrow 'Technical parameters' provient du fetch HYDRO_TECHNICAL_PARAMETERS
      const techParamsSubRow = frRow?.subRows?.find((sr) => sr.hypothesis === HydroSubRows[1].label);
      expect(techParamsSubRow?.trajectory).toEqual(hydroPSPTechParamsTrajectory);
      expect(techParamsSubRow?.status).toBe(TRAJECTORY_SELECTION_STATUS.OK);
    });

    // Les rows HYDRO_TECHNICAL_PARAMETERS ne sont pas stockées séparément
    expect(result.current.hypothesisTrajectories?.[TRAJECTORY_TYPE.HYDRO_PSP_TECHNICAL_PARAMETERS]).toBeUndefined();
  });

  it('should not re-fetch when trajectoryTypes has a new reference but same content', async () => {
    mockUseStudy.mockReturnValue({} as StudyState);
    vi.mocked(studyService.getStudyTrajectories).mockResolvedValue([]);

    const { rerender } = renderHook(
      ({ types }: { types: TRAJECTORY_TYPE[] }) =>
        useFetchHypothesisTrajectories(types, 5, StudyStatus.IN_PROGRESS),
      { initialProps: { types: [TRAJECTORY_TYPE.LOAD] } },
    );

    await waitFor(() => expect(studyService.getStudyTrajectories).toHaveBeenCalledTimes(1));

    rerender({ types: [TRAJECTORY_TYPE.LOAD] }); // nouvelle référence, même contenu

    await waitFor(() => expect(studyService.getStudyTrajectories).toHaveBeenCalledTimes(1));
  });

  it('should re-fetch when trajectoryTypes content changes', async () => {
    // DSR utilise fetchTrajectoriesFromTypes (pas getStudyTrajectories) — on utilise MISC_LOAD
    // qui emprunte le même chemin que LOAD et appelle bien getStudyTrajectories
    mockUseStudy.mockReturnValue({} as StudyState);
    vi.mocked(studyService.getStudyTrajectories).mockResolvedValue([]);

    const { rerender } = renderHook(
      ({ types }: { types: TRAJECTORY_TYPE[] }) =>
        useFetchHypothesisTrajectories(types, 5, StudyStatus.IN_PROGRESS),
      { initialProps: { types: [TRAJECTORY_TYPE.LOAD] } },
    );

    await waitFor(() => expect(studyService.getStudyTrajectories).toHaveBeenCalledWith(5, TRAJECTORY_TYPE.LOAD));

    rerender({ types: [TRAJECTORY_TYPE.MISC_LOAD] });

    await waitFor(() => expect(studyService.getStudyTrajectories).toHaveBeenCalledWith(5, TRAJECTORY_TYPE.MISC_LOAD));
    expect(studyService.getStudyTrajectories).toHaveBeenCalledTimes(2);
  });

  it('should re-fetch when studyContextStatus changes', async () => {
    mockUseStudy.mockReturnValue({} as StudyState);
    vi.mocked(studyService.getStudyTrajectories).mockResolvedValue([]);

    const { rerender } = renderHook(
      ({ contextStatus }: { contextStatus: StudyStatus }) =>
        useFetchHypothesisTrajectories([TRAJECTORY_TYPE.LOAD], 5, StudyStatus.IN_PROGRESS, contextStatus),
      { initialProps: { contextStatus: StudyStatus.IN_PROGRESS } },
    );

    await waitFor(() => expect(studyService.getStudyTrajectories).toHaveBeenCalledTimes(1));

    rerender({ contextStatus: StudyStatus.GENERATED });

    await waitFor(() => expect(studyService.getStudyTrajectories).toHaveBeenCalledTimes(2));
  });

  it('should not re-fetch when studyId stays the same and types do not change', async () => {
    mockUseStudy.mockReturnValue({} as StudyState);
    vi.mocked(studyService.getStudyTrajectories).mockResolvedValue([]);

    const { rerender } = renderHook(
      ({ studyId }: { studyId: number }) =>
        useFetchHypothesisTrajectories([TRAJECTORY_TYPE.LOAD], studyId, StudyStatus.IN_PROGRESS),
      { initialProps: { studyId: 5 } },
    );

    await waitFor(() => expect(studyService.getStudyTrajectories).toHaveBeenCalledTimes(1));

    rerender({ studyId: 5 }); // même studyId

    await waitFor(() => expect(studyService.getStudyTrajectories).toHaveBeenCalledTimes(1));
  });

  it('should re-fetch when studyId changes', async () => {
    mockUseStudy.mockReturnValue({} as StudyState);
    vi.mocked(studyService.getStudyTrajectories).mockResolvedValue([]);

    const { rerender } = renderHook(
      ({ studyId }: { studyId: number }) =>
        useFetchHypothesisTrajectories([TRAJECTORY_TYPE.LOAD], studyId, StudyStatus.IN_PROGRESS),
      { initialProps: { studyId: 5 } },
    );

    await waitFor(() => expect(studyService.getStudyTrajectories).toHaveBeenCalledWith(5, TRAJECTORY_TYPE.LOAD));

    rerender({ studyId: 99 });

    await waitFor(() => expect(studyService.getStudyTrajectories).toHaveBeenCalledWith(99, TRAJECTORY_TYPE.LOAD));
    expect(studyService.getStudyTrajectories).toHaveBeenCalledTimes(2);
  });

  it('should build hypothesis trajectories for nuclear types when isTrajectoryNuclearType is true', async () => {
    const nuclearModulationTrajectory: DbTrajectory = {
      id: 101,
      trajectoryName: 'nuclear_modulation_traj',
      type: TRAJECTORY_TYPE.NUCLEAR_FR_MODULATION,
      area: '',
      technology: '',
      version: 1,
      userName: 'user1',
      creationDate: '2024-01-01' as unknown as Date,
      hasTimeSeries: false,
    };

    const nuclearTalonTrajectory: DbTrajectory = {
      id: 102,
      trajectoryName: 'nuclear_talon_traj',
      type: TRAJECTORY_TYPE.NUCLEAR_FR_TALON,
      area: '',
      technology: '',
      version: 1,
      userName: 'user1',
      creationDate: '2024-01-01' as unknown as Date,
      hasTimeSeries: false,
    };

    const nuclearTsErpTrajectory: DbTrajectory = {
      id: 103,
      trajectoryName: 'nuclear_erp_traj',
      type: TRAJECTORY_TYPE.NUCLEAR_FR_TS_ERP,
      area: '',
      technology: '',
      version: 1,
      userName: 'user1',
      creationDate: '2024-01-01' as unknown as Date,
      hasTimeSeries: false,
    };

    const nuclearTsLongTermTrajectory: DbTrajectory = {
      id: 104,
      trajectoryName: 'nuclear_long_term_traj',
      type: TRAJECTORY_TYPE.NUCLEAR_FR_TS_LONG_TERM,
      area: '',
      technology: '',
      version: 1,
      userName: 'user1',
      creationDate: '2024-01-01' as unknown as Date,
      hasTimeSeries: false,
    };

    const nuclearTsSmrTrajectory: DbTrajectory = {
      id: 105,
      trajectoryName: 'nuclear_smr_traj',
      type: TRAJECTORY_TYPE.NUCLEAR_FR_TS_SMR,
      area: '',
      technology: '',
      version: 1,
      userName: 'user1',
      creationDate: '2024-01-01' as unknown as Date,
      hasTimeSeries: false,
    };

    mockUseStudy.mockReturnValue({
      [TRAJECTORY_TYPE.NUCLEAR_FR_MODULATION]: { trajectories: [], warningMessages: [] },
      [TRAJECTORY_TYPE.NUCLEAR_FR_TALON]: { trajectories: [], warningMessages: [] },
      [TRAJECTORY_TYPE.NUCLEAR_FR_TS_ERP]: { trajectories: [], warningMessages: [] },
      [TRAJECTORY_TYPE.NUCLEAR_FR_TS_LONG_TERM]: { trajectories: [], warningMessages: [] },
      [TRAJECTORY_TYPE.NUCLEAR_FR_TS_SMR]: { trajectories: [], warningMessages: [] },
    } as Partial<StudyState>);

    vi.mocked(studyService.getStudyTrajectories).mockImplementation((_, type) => {
      if (type === TRAJECTORY_TYPE.NUCLEAR_FR_MODULATION) return Promise.resolve([nuclearModulationTrajectory]);
      if (type === TRAJECTORY_TYPE.NUCLEAR_FR_TALON) return Promise.resolve([nuclearTalonTrajectory]);
      if (type === TRAJECTORY_TYPE.NUCLEAR_FR_TS_ERP) return Promise.resolve([nuclearTsErpTrajectory]);
      if (type === TRAJECTORY_TYPE.NUCLEAR_FR_TS_LONG_TERM) return Promise.resolve([nuclearTsLongTermTrajectory]);
      if (type === TRAJECTORY_TYPE.NUCLEAR_FR_TS_SMR) return Promise.resolve([nuclearTsSmrTrajectory]);
      return Promise.resolve([]);
    });

    const { result } = renderHook(() =>
      useFetchHypothesisTrajectories(NUCLEAR_FR_MODULATION_TYPES, 5, StudyStatus.IN_PROGRESS),
    );

    await waitFor(() => {
      expect(studyService.getStudyTrajectories).toHaveBeenCalledWith(5, TRAJECTORY_TYPE.NUCLEAR_FR_MODULATION);
      expect(studyService.getStudyTrajectories).toHaveBeenCalledWith(5, TRAJECTORY_TYPE.NUCLEAR_FR_TALON);
      expect(studyService.getStudyTrajectories).toHaveBeenCalledWith(5, TRAJECTORY_TYPE.NUCLEAR_FR_TS_ERP);
      expect(studyService.getStudyTrajectories).toHaveBeenCalledWith(5, TRAJECTORY_TYPE.NUCLEAR_FR_TS_LONG_TERM);
      expect(studyService.getStudyTrajectories).toHaveBeenCalledWith(5, TRAJECTORY_TYPE.NUCLEAR_FR_TS_SMR);

      expect(mockDispatch).toHaveBeenCalledWith({
        type: STUDY_ACTION.ADD_TRAJECTORIES,
        payload: {
          [TRAJECTORY_TYPE.NUCLEAR_FR_MODULATION]: {
            trajectories: [nuclearModulationTrajectory],
          },
        },
      });

      expect(result.current.hypothesisTrajectories?.[TRAJECTORY_TYPE.NUCLEAR_FR_MODULATION]).toEqual([
        {
          hypothesis: 'thermal.@modulation',
          trajectory: nuclearModulationTrajectory,
          status: TRAJECTORY_SELECTION_STATUS.OK,
          isDefault: false,
          isDeletable: false,
          subRows: [],
        },
        {
          hypothesis: 'thermal.@talon',
          trajectory: nuclearTalonTrajectory,
          status: TRAJECTORY_SELECTION_STATUS.OK,
          isDefault: false,
          isDeletable: false,
          subRows: [],
        },
        {
          hypothesis: 'thermal.@time_series',
          trajectory: null,
          status: TRAJECTORY_SELECTION_STATUS.MISSING,
          isDefault: false,
          isDeletable: false,
          subRows: [
            {
              hypothesis: 'thermal.@epr',
              trajectory: nuclearTsErpTrajectory,
              status: TRAJECTORY_SELECTION_STATUS.OK,
              isDefault: false,
              isDeletable: false,
              subRows: null,
            },
            {
              hypothesis: 'thermal.@long_term',
              trajectory: nuclearTsLongTermTrajectory,
              status: TRAJECTORY_SELECTION_STATUS.OK,
              isDefault: false,
              isDeletable: false,
              subRows: null,
            },
            {
              hypothesis: 'thermal.@smr',
              trajectory: nuclearTsSmrTrajectory,
              status: TRAJECTORY_SELECTION_STATUS.OK,
              isDefault: false,
              isDeletable: false,
              subRows: null,
            },
          ],
        },
      ]);

      expect(result.current.hypothesisTrajectories?.[TRAJECTORY_TYPE.NUCLEAR_FR_TALON]).toBeUndefined();
      expect(result.current.areasTrajectoryOptions).toBeUndefined();
      expect(result.current.dropDownListOptions).toBeUndefined();
    });
  });

  it('should build hypothesis trajectories for nuclear types with missing trajectories and generated status', async () => {
    mockUseStudy.mockReturnValue({} as StudyState);
    vi.mocked(studyService.getStudyTrajectories).mockResolvedValue([]);

    const { result } = renderHook(() =>
      useFetchHypothesisTrajectories(
        NUCLEAR_FR_MODULATION_TYPES,
        5,
        StudyStatus.GENERATED,
        StudyStatus.GENERATED,
      ),
    );

    await waitFor(() => {
      expect(result.current.hypothesisTrajectories?.[TRAJECTORY_TYPE.NUCLEAR_FR_MODULATION]).toEqual([
        {
          hypothesis: 'thermal.@modulation',
          trajectory: null,
          status: TRAJECTORY_SELECTION_STATUS.MISSING,
          isDefault: false,
          isDeletable: false,
          subRows: [],
        },
        {
          hypothesis: 'thermal.@talon',
          trajectory: null,
          status: TRAJECTORY_SELECTION_STATUS.MISSING,
          isDefault: false,
          isDeletable: false,
          subRows: [],
        },
        {
          hypothesis: 'thermal.@time_series',
          trajectory: null,
          status: TRAJECTORY_SELECTION_STATUS.MISSING,
          isDefault: false,
          isDeletable: false,
          subRows: [
            {
              hypothesis: 'thermal.@epr',
              trajectory: null,
              status: TRAJECTORY_SELECTION_STATUS.MISSING,
              isDefault: false,
              isDeletable: false,
              subRows: null,
            },
            {
              hypothesis: 'thermal.@long_term',
              trajectory: null,
              status: TRAJECTORY_SELECTION_STATUS.MISSING,
              isDefault: false,
              isDeletable: false,
              subRows: null,
            },
            {
              hypothesis: 'thermal.@smr',
              trajectory: null,
              status: TRAJECTORY_SELECTION_STATUS.MISSING,
              isDefault: false,
              isDeletable: false,
              subRows: null,
            },
          ],
        },
      ]);

      expect(result.current.readOnlyRow?.[TRAJECTORY_TYPE.NUCLEAR_FR_MODULATION]).toEqual({
        '0': true,
        '1': true,
        '2': true,
        '2.0': true,
        '2.1': true,
        '2.2': true,
      });
    });
  });

  it('should build hypothesis trajectories for other vector types when isTrajectoryOtherVectorType is true', async () => {
    const p2gCapacityTrajectory: DbTrajectory = {
      id: 201,
      trajectoryName: 'p2g_capacity_traj',
      type: TRAJECTORY_TYPE.P2G_CAPACITY_COST,
      area: '',
      technology: '',
      version: 1,
      userName: 'user1',
      creationDate: '2024-01-01' as unknown as Date,
      hasTimeSeries: false,
    };

    const p2gModulationTrajectory: DbTrajectory = {
      id: 202,
      trajectoryName: 'p2g_modulation_traj',
      type: TRAJECTORY_TYPE.P2G_MARKET_MODULATION,
      area: '',
      technology: '',
      version: 1,
      userName: 'user1',
      creationDate: '2024-01-01' as unknown as Date,
      hasTimeSeries: false,
    };

    mockUseStudy.mockReturnValue({
      [TRAJECTORY_TYPE.P2G_CAPACITY_COST]: { trajectories: [], warningMessages: [] },
      [TRAJECTORY_TYPE.P2G_MARKET_MODULATION]: { trajectories: [], warningMessages: [] },
    } as Partial<StudyState>);

    vi.mocked(studyService.getStudyTrajectories).mockImplementation((_, type) => {
      if (type === TRAJECTORY_TYPE.P2G_CAPACITY_COST) return Promise.resolve([p2gCapacityTrajectory]);
      if (type === TRAJECTORY_TYPE.P2G_MARKET_MODULATION) return Promise.resolve([p2gModulationTrajectory]);
      return Promise.resolve([]);
    });

    const { result } = renderHook(() =>
      useFetchHypothesisTrajectories(P2G_TYPES, 5, StudyStatus.IN_PROGRESS),
    );

    await waitFor(() => {
      expect(studyService.getStudyTrajectories).toHaveBeenCalledWith(5, TRAJECTORY_TYPE.P2G_CAPACITY_COST);
      expect(studyService.getStudyTrajectories).toHaveBeenCalledWith(5, TRAJECTORY_TYPE.P2G_MARKET_MODULATION);

      expect(mockDispatch).toHaveBeenCalledWith({
        type: STUDY_ACTION.ADD_TRAJECTORIES,
        payload: {
          [TRAJECTORY_TYPE.P2G]: {
            trajectories: [p2gCapacityTrajectory, p2gModulationTrajectory],
          },
        },
      });

      expect(result.current.hypothesisTrajectories?.[TRAJECTORY_TYPE.P2G]).toEqual([
        {
          hypothesis: 'p2g.@capacity',
          trajectory: p2gCapacityTrajectory,
          status: TRAJECTORY_SELECTION_STATUS.OK,
          isDefault: false,
          isDeletable: false,
          subRows: [],
        },
        {
          hypothesis: 'p2g.@modulation',
          trajectory: p2gModulationTrajectory,
          status: TRAJECTORY_SELECTION_STATUS.OK,
          isDefault: false,
          isDeletable: false,
          subRows: [],
        },
      ]);

      expect(result.current.areasTrajectoryOptions).toBeUndefined();
      expect(result.current.dropDownListOptions).toBeUndefined();
    });
  });

  it('should build hypothesis trajectories for other vector types with missing trajectories and generated status', async () => {
    mockUseStudy.mockReturnValue({} as StudyState);
    vi.mocked(studyService.getStudyTrajectories).mockResolvedValue([]);

    const { result } = renderHook(() =>
      useFetchHypothesisTrajectories(
        P2G_TYPES,
        5,
        StudyStatus.GENERATED,
        StudyStatus.GENERATED,
      ),
    );

    await waitFor(() => {
      expect(result.current.hypothesisTrajectories?.[TRAJECTORY_TYPE.P2G]).toEqual([
        {
          hypothesis: 'p2g.@capacity',
          trajectory: null,
          status: TRAJECTORY_SELECTION_STATUS.MISSING,
          isDefault: false,
          isDeletable: false,
          subRows: [],
        },
        {
          hypothesis: 'p2g.@modulation',
          trajectory: null,
          status: TRAJECTORY_SELECTION_STATUS.MISSING,
          isDefault: false,
          isDeletable: false,
          subRows: [],
        },
      ]);

      expect(result.current.readOnlyRow?.[TRAJECTORY_TYPE.P2G]).toEqual({
        '0': true,
        '1': true,
      });
    });
  });

  it('should build hypothesis trajectories for ME types when isTrajectoryMEType is true', async () => {
    const areaMeTrajectory: DbTrajectory = {
      id: 301,
      trajectoryName: 'area_me_traj',
      type: TRAJECTORY_TYPE.AREA_ME,
      area: '',
      technology: '',
      version: 1,
      userName: 'user1',
      creationDate: '2024-01-01' as unknown as Date,
      hasTimeSeries: false,
    };

    const linkMeTrajectory: DbTrajectory = {
      id: 302,
      trajectoryName: 'link_me_traj',
      type: TRAJECTORY_TYPE.LINK_ME,
      area: '',
      technology: '',
      version: 1,
      userName: 'user1',
      creationDate: '2024-01-01' as unknown as Date,
      hasTimeSeries: false,
    };

    const loadMeTrajectory: DbTrajectory = {
      id: 303,
      trajectoryName: 'load_me_traj',
      type: TRAJECTORY_TYPE.LOAD_ME,
      area: '',
      technology: '',
      version: 1,
      userName: 'user1',
      creationDate: '2024-01-01' as unknown as Date,
      hasTimeSeries: false,
    };

    const stsMeTrajectory: DbTrajectory = {
      id: 304,
      trajectoryName: 'sts_me_traj',
      type: TRAJECTORY_TYPE.STS_ME,
      area: '',
      technology: '',
      version: 1,
      userName: 'user1',
      creationDate: '2024-01-01' as unknown as Date,
      hasTimeSeries: false,
    };

    mockUseStudy.mockReturnValue({
      [TRAJECTORY_TYPE.AREA_ME]: { trajectories: [], warningMessages: [] },
      [TRAJECTORY_TYPE.LINK_ME]: { trajectories: [], warningMessages: [] },
      [TRAJECTORY_TYPE.LOAD_ME]: { trajectories: [], warningMessages: [] },
      [TRAJECTORY_TYPE.STS_ME]: { trajectories: [], warningMessages: [] },
    } as Partial<StudyState>);

    vi.mocked(studyService.getStudyTrajectories).mockImplementation((_, type) => {
      if (type === TRAJECTORY_TYPE.AREA_ME) return Promise.resolve([areaMeTrajectory]);
      if (type === TRAJECTORY_TYPE.LINK_ME) return Promise.resolve([linkMeTrajectory]);
      if (type === TRAJECTORY_TYPE.LOAD_ME) return Promise.resolve([loadMeTrajectory]);
      if (type === TRAJECTORY_TYPE.STS_ME) return Promise.resolve([stsMeTrajectory]);
      return Promise.resolve([]);
    });

    const { result } = renderHook(() =>
      useFetchHypothesisTrajectories(ME_TYPES, 5, StudyStatus.IN_PROGRESS),
    );

    await waitFor(() => {
      expect(studyService.getStudyTrajectories).toHaveBeenCalledWith(5, TRAJECTORY_TYPE.AREA_ME);
      expect(studyService.getStudyTrajectories).toHaveBeenCalledWith(5, TRAJECTORY_TYPE.LINK_ME);
      expect(studyService.getStudyTrajectories).toHaveBeenCalledWith(5, TRAJECTORY_TYPE.LOAD_ME);
      expect(studyService.getStudyTrajectories).toHaveBeenCalledWith(5, TRAJECTORY_TYPE.STS_ME);

      expect(mockDispatch).toHaveBeenCalledWith({
        type: STUDY_ACTION.ADD_TRAJECTORIES,
        payload: {
          [TRAJECTORY_TYPE.ME]: {
            trajectories: [areaMeTrajectory, linkMeTrajectory, loadMeTrajectory, stsMeTrajectory],
          },
        },
      });

      expect(result.current.hypothesisTrajectories?.[TRAJECTORY_TYPE.ME]).toEqual([
        {
          hypothesis: 'studyDetails.@areas',
          trajectory: areaMeTrajectory,
          status: TRAJECTORY_SELECTION_STATUS.OK,
          isDefault: false,
          isDeletable: false,
          subRows: [],
        },
        {
          hypothesis: 'studyDetails.@links',
          trajectory: linkMeTrajectory,
          status: TRAJECTORY_SELECTION_STATUS.OK,
          isDefault: false,
          isDeletable: false,
          subRows: [],
        },
        {
          hypothesis: 'studyDetails.@load',
          trajectory: loadMeTrajectory,
          status: TRAJECTORY_SELECTION_STATUS.OK,
          isDefault: false,
          isDeletable: false,
          subRows: [],
        },
        {
          hypothesis: 'me.@storage',
          trajectory: stsMeTrajectory,
          status: TRAJECTORY_SELECTION_STATUS.OK,
          isDefault: false,
          isDeletable: false,
          subRows: [],
        },
      ]);

      expect(result.current.readOnlyRow?.[TRAJECTORY_TYPE.ME]).toEqual({});
      expect(result.current.areasTrajectoryOptions).toBeUndefined();
      expect(result.current.dropDownListOptions).toBeUndefined();
    });
  });

  it('should build hypothesis trajectories for ME types with missing trajectories and generated status', async () => {
    mockUseStudy.mockReturnValue({} as StudyState);
    vi.mocked(studyService.getStudyTrajectories).mockResolvedValue([]);

    const { result } = renderHook(() =>
      useFetchHypothesisTrajectories(
        ME_TYPES,
        5,
        StudyStatus.GENERATED,
        StudyStatus.GENERATED,
      ),
    );

    await waitFor(() => {
      expect(result.current.hypothesisTrajectories?.[TRAJECTORY_TYPE.ME]).toEqual([
        {
          hypothesis: 'studyDetails.@areas',
          trajectory: null,
          status: TRAJECTORY_SELECTION_STATUS.MISSING,
          isDefault: false,
          isDeletable: false,
          subRows: [],
        },
        {
          hypothesis: 'studyDetails.@links',
          trajectory: null,
          status: TRAJECTORY_SELECTION_STATUS.MISSING,
          isDefault: false,
          isDeletable: false,
          subRows: [],
        },
        {
          hypothesis: 'studyDetails.@load',
          trajectory: null,
          status: TRAJECTORY_SELECTION_STATUS.MISSING,
          isDefault: false,
          isDeletable: false,
          subRows: [],
        },
        {
          hypothesis: 'me.@storage',
          trajectory: null,
          status: TRAJECTORY_SELECTION_STATUS.MISSING,
          isDefault: false,
          isDeletable: false,
          subRows: [],
        },
      ]);

      expect(result.current.readOnlyRow?.[TRAJECTORY_TYPE.ME]).toEqual({
        '0': true,
        '1': true,
        '2': true,
        '3': true,
      });
    });
  });
});
