import { describe, Mock, vi } from 'vitest';
import { useFetchHypothesisParametersTrajectories } from '@/hooks/useFetchHypothesisParametersTrajectories.ts';
import * as hypothesisTableService from '@/shared/services/hypothesisTableService.ts';
import { TRAJECTORY_SELECTION_STATUS, TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { STUDY_ACTION } from '@/shared/enum/study.ts';
import { DbTrajectory, HypothesisRowData, StudyDTO } from '@/shared/types';
import { renderHook, waitFor } from '@testing-library/react';
import { useStudyDispatch } from '@/store/contexts/StudyContext.tsx';
import * as sortUtils from '@/shared/utils/sortUtils.ts';

vi.mock('@/shared/services/trajectoryService');
vi.mock('@/shared/services/hypothesisTableService');
vi.mock('@/shared/services/studyService');
vi.mock('@/shared/utils/sortUtils');
vi.mock('@/shared/utils/trajectoryUtils', async (importOriginal) => {
  const actual: Mock = await importOriginal();
  return {
    ...actual,
    buildEmptyTrajectory: vi.fn(),
    buildDefaultEmptyTrajectoryList: vi.fn(),
    removeDuplicate: vi.fn(),
    buildRowWithSubRowsData: vi.fn(),
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

const mockSpecific = [{ id: '2', area: 'B', trajectoryName: 'T2' }] as unknown as DbTrajectory[];
const mockModulation = [{ id: '3', trajectoryName: 'Mod' }] as unknown as DbTrajectory[];
const mockCommon = [{ id: '4', trajectoryName: 'Common' }] as unknown as DbTrajectory[];

describe('useFetchHypothesisParametersTrajectories', () => {
  const mockUseStudyDispatch = useStudyDispatch as Mock<typeof useStudyDispatch>;
  const mockDispatch = vi.fn().mockImplementation(vi.fn());
  mockUseStudyDispatch.mockReturnValue(mockDispatch);
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch and populate hypothesis trajectories when one specific trajectories', async () => {
    const study = { id: 123, horizon: '2025' } as StudyDTO;
    const trajectoryData = [
      {
        areaName: 'B',
        spilledEnergyCost: '',
        unsuppliedEnergyCost: '300.256',
      },
    ];

    vi.mocked(hypothesisTableService.fetchTrajectoriesFromTypes).mockResolvedValue({
      [TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER]: mockSpecific,
      [TRAJECTORY_TYPE.THERMAL_TECHNICAL_MODULATION_PARAMETER]: mockModulation,
      [TRAJECTORY_TYPE.THERMAL_TECHNICAL_COMMON_PARAMETER]: mockCommon,
    });

    const { result } = renderHook(() =>
      useFetchHypothesisParametersTrajectories(trajectoryData, study, [{ name: 'B' }]),
    );

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith({
        type: STUDY_ACTION.ADD_TRAJECTORIES,
        payload: {
          [TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER]: {
            trajectories: mockSpecific,
          },
          [TRAJECTORY_TYPE.THERMAL_TECHNICAL_MODULATION_PARAMETER]: {
            trajectories: [mockModulation[0]],
          },
          [TRAJECTORY_TYPE.THERMAL_TECHNICAL_COMMON_PARAMETER]: {
            trajectories: [mockCommon[0]],
          },
        },
      });

      expect(result.current.hypothesisTrajectories).toHaveLength(3);
      expect(result.current.areasTrajectoryOptions).toEqual([{ name: 'B', isDefault: true }]);
      expect(result.current.dropDownListOptions).toEqual(['B']);
      expect(result.current.readOnlyRow).toEqual({ '1': true });
    });
  });

  it('should handle missing modulation trajectory', async () => {
    const study = { id: 123, horizon: '2025' } as StudyDTO;
    const mockTrajectories = {
      [TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER]: [{ trajectoryName: 'A' }],
      [TRAJECTORY_TYPE.THERMAL_TECHNICAL_COMMON_PARAMETER]: [{ trajectoryName: 'C' }],
    } as Partial<Record<TRAJECTORY_TYPE, DbTrajectory[]>>;

    vi.mocked(hypothesisTableService.fetchTrajectoriesFromTypes).mockResolvedValue(mockTrajectories);

    const { result } = renderHook(() => useFetchHypothesisParametersTrajectories([], study, [{ name: 'A' }], false));

    await waitFor(() => {
      expect(result.current.hypothesisTrajectories[1].status).toBe(TRAJECTORY_SELECTION_STATUS.MISSING);
    });
  });

  it("should not set readonly state to param modulation row when there's at least more than one specific trajectories", async () => {
    const study = { id: 123, horizon: '2025' } as StudyDTO;
    const trajectoryData = [
      {
        areaName: 'B',
                                                                                                                                                                                                                                                                                        spilledEnergyCost: '200.32',
        unsuppliedEnergyCost: '300.256',
      },
      {
        areaName: 'F',
        spilledEnergyCost: '200.32',
        unsuppliedEnergyCost: '300.256',
      },
    ];
    const mockTwoSpecific = [
      { id: '2', area: 'A', trajectoryName: 'TA' },
      { id: '6', area: 'F', trajectoryName: 'T6' },
    ] as unknown as DbTrajectory[];
    vi.mocked(hypothesisTableService.fetchTrajectoriesFromTypes).mockResolvedValue({
      [TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER]: mockTwoSpecific,
      [TRAJECTORY_TYPE.THERMAL_TECHNICAL_MODULATION_PARAMETER]: mockModulation,
      [TRAJECTORY_TYPE.THERMAL_TECHNICAL_COMMON_PARAMETER]: mockCommon,
    });

    vi.mocked(sortUtils.sortWithFixedPosition).mockReturnValue([
      {
        hypothesis: 'A',
        trajectory: { id: 2, area: 'A', trajectoryName: 'TA' },
        status: TRAJECTORY_SELECTION_STATUS.OK,
      },
      {
        hypothesis: 'F',
        trajectory: { id: 6, area: 'F', trajectoryName: 'T6' },
        status: TRAJECTORY_SELECTION_STATUS.OK,
      },
    ] as HypothesisRowData[]);

    const { result } = renderHook(() =>
      useFetchHypothesisParametersTrajectories(trajectoryData, study, [{ name: 'A' }], false),
    );

    await waitFor(() => {
      expect(result.current.readOnlyRow).toEqual({ '0.0': true, '1': true });
    });
  });

  it('should handle readonly rows when no specific trajectories', async () => {
    const study = { id: 123, horizon: '2025' } as StudyDTO;
    const mockTrajectories = {
      [TRAJECTORY_TYPE.THERMAL_TECHNICAL_COMMON_PARAMETER]: [{ trajectoryName: 'C' }],
    } as Partial<Record<TRAJECTORY_TYPE, DbTrajectory[]>>;
    const trajectoryData = [
      {
        areaName: 'B',
        spilledEnergyCost: '200.32',
        unsuppliedEnergyCost: '300.256',
      },
      {
        areaName: 'C',
        spilledEnergyCost: '200.32',
        unsuppliedEnergyCost: '300.256',
      },
    ];

    vi.mocked(hypothesisTableService.fetchTrajectoriesFromTypes).mockResolvedValue(mockTrajectories);

    const { result } = renderHook(() =>
      useFetchHypothesisParametersTrajectories(trajectoryData, study, [{ name: 'A' }], false),
    );

    await waitFor(() => {
      expect(result.current.readOnlyRow).toEqual({ '0.0': true, '1': true });
    });
  });

  it('should handle readonly rows when study is generated', async () => {
    const study = { id: 123, horizon: '2025' } as StudyDTO;
    const trajectoryData = [
      {
        areaName: 'A',
        spilledEnergyCost: '200.32',
        unsuppliedEnergyCost: '300.256',
      },
      {
        areaName: 'B',
        spilledEnergyCost: '200.32',
        unsuppliedEnergyCost: '300.256',
      },
      {
        areaName: 'C',
        spilledEnergyCost: '200.32',
        unsuppliedEnergyCost: '300.256',
      },
    ];
    vi.mocked(hypothesisTableService.fetchTrajectoriesFromTypes).mockResolvedValue({
      [TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER]: mockSpecific,
      [TRAJECTORY_TYPE.THERMAL_TECHNICAL_MODULATION_PARAMETER]: mockModulation,
      [TRAJECTORY_TYPE.THERMAL_TECHNICAL_COMMON_PARAMETER]: mockCommon,
    });

    const { result } = renderHook(() =>
      useFetchHypothesisParametersTrajectories(trajectoryData, study, [{ name: 'A' }], true),
    );

    await waitFor(() => {
      expect(result.current.hypothesisTrajectories[0].subRows).toEqual([
        {
          hypothesis: 'A',
          trajectory: { id: 2, area: 'A', trajectoryName: 'TA' },
          status: 'OK',
        },
        {
          hypothesis: 'F',
          trajectory: { id: 6, area: 'F', trajectoryName: 'T6' },
          status: 'OK',
        },
      ]);
      expect(result.current.readOnlyRow).toEqual({ '0': true, '0.0': true, '0.1': true, '1': true, '2': true });
    });
  });

  it('should handle missing common and param modulation trajectories', async () => {
    const study = { id: 123, horizon: '2025' } as StudyDTO;
    const mockTrajectories = {
      [TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER]: [{ trajectoryName: 'A', area: 'specific' }],
    } as Partial<Record<TRAJECTORY_TYPE, DbTrajectory[]>>;

    vi.mocked(hypothesisTableService.fetchTrajectoriesFromTypes).mockResolvedValue(mockTrajectories);

    const { result } = renderHook(() => useFetchHypothesisParametersTrajectories([], study, [{ name: 'A' }], false));

    await waitFor(() => {
      expect(result.current.hypothesisTrajectories).toHaveLength(3);
      expect(result.current.hypothesisTrajectories[1].status).toBe(TRAJECTORY_SELECTION_STATUS.MISSING);
      expect(result.current.hypothesisTrajectories[2].status).toBe(TRAJECTORY_SELECTION_STATUS.MISSING);
    });
  });

  it('should handle empty trajectory response', async () => {
    vi.mocked(hypothesisTableService.fetchTrajectoriesFromTypes).mockResolvedValue({});
    const study = { id: 123, horizon: '2025' } as StudyDTO;
    const { result } = renderHook(() => useFetchHypothesisParametersTrajectories([], study, [{ name: 'A' }], false));

    await waitFor(() => {
      expect(result.current.hypothesisTrajectories.every((h) => h.status === TRAJECTORY_SELECTION_STATUS.MISSING)).toBe(
        true,
      );
    });
  });
});
