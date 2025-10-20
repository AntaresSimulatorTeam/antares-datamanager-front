import { describe, Mock, vi } from 'vitest';
import { useFetchHypothesisParametersTrajectories } from '@/hooks/useFetchHypothesisParametersTrajectories.ts';
import * as hypothesisTableService from '@/shared/services/hypothesisTableService.ts';
import { TRAJECTORY_SELECTION_STATUS, TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { STUDY_ACTION } from '@/shared/enum/study.ts';
import { DbTrajectory } from '@/shared/types';
import { renderHook, waitFor } from '@testing-library/react';
import { useStudyDispatch } from '@/store/contexts/StudyContext.tsx';

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
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch and populate hypothesis trajectories', async () => {
    const trajectoryData = [
      {
        areaName: 'B',
        powerToGas: '',
        shortTermStorage: null,
      },
    ];

    vi.mocked(hypothesisTableService.fetchTrajectoriesFromTypes).mockResolvedValue({
      [TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER]: mockSpecific,
      [TRAJECTORY_TYPE.THERMAL_TECHNICAL_MODULATION_PARAMETER]: mockModulation,
      [TRAJECTORY_TYPE.THERMAL_TECHNICAL_COMMON_PARAMETER]: mockCommon,
    });

    const { result } = renderHook(() => useFetchHypothesisParametersTrajectories(123, [{ name: 'B' }], trajectoryData));

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
    const mockTrajectories = {
      [TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER]: [{ trajectoryName: 'A' }],
      [TRAJECTORY_TYPE.THERMAL_TECHNICAL_COMMON_PARAMETER]: [{ trajectoryName: 'C' }],
    } as Partial<Record<TRAJECTORY_TYPE, DbTrajectory[]>>;

    vi.mocked(hypothesisTableService.fetchTrajectoriesFromTypes).mockResolvedValue(mockTrajectories);

    const { result } = renderHook(() => useFetchHypothesisParametersTrajectories(1, [{ name: 'A' }], [], false));

    await waitFor(() => {
      expect(result.current.hypothesisTrajectories[1].status).toBe(TRAJECTORY_SELECTION_STATUS.MISSING);
    });
  });

  it('should handle readonly rows when no specific trajectories', async () => {
    const mockTrajectories = {
      [TRAJECTORY_TYPE.THERMAL_TECHNICAL_COMMON_PARAMETER]: [{ trajectoryName: 'C' }],
    } as Partial<Record<TRAJECTORY_TYPE, DbTrajectory[]>>;
    const trajectoryData = [
      {
        areaName: 'B',
        powerToGas: '',
        shortTermStorage: null,
      },
      {
        areaName: 'C',
        powerToGas: '',
        shortTermStorage: null,
      },
    ];

    vi.mocked(hypothesisTableService.fetchTrajectoriesFromTypes).mockResolvedValue(mockTrajectories);

    const { result } = renderHook(() =>
      useFetchHypothesisParametersTrajectories(1, [{ name: 'A' }], trajectoryData, false),
    );

    await waitFor(() => {
      expect(result.current.readOnlyRow).toEqual({ '1': true });
    });
  });

  it('should handle readonly rows when study is generated', async () => {
    const trajectoryData = [
      {
        areaName: 'A',
        powerToGas: '',
        shortTermStorage: null,
      },
      {
        areaName: 'B',
        powerToGas: '',
        shortTermStorage: null,
      },
      {
        areaName: 'C',
        powerToGas: '',
        shortTermStorage: null,
      },
    ];
    vi.mocked(hypothesisTableService.fetchTrajectoriesFromTypes).mockResolvedValue({
      [TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER]: mockSpecific,
      [TRAJECTORY_TYPE.THERMAL_TECHNICAL_MODULATION_PARAMETER]: mockModulation,
      [TRAJECTORY_TYPE.THERMAL_TECHNICAL_COMMON_PARAMETER]: mockCommon,
    });

    const { result } = renderHook(() =>
      useFetchHypothesisParametersTrajectories(1, [{ name: 'A' }], trajectoryData, true),
    );

    await waitFor(() => {
      expect(result.current.readOnlyRow).toEqual({ '0': true, '1': true, '2': true });
    });
  });

  it('should handle missing common and param modulation trajectories', async () => {
    const mockTrajectories = {
      [TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER]: [{ trajectoryName: 'A', area: 'specific' }],
    } as Partial<Record<TRAJECTORY_TYPE, DbTrajectory[]>>;

    vi.mocked(hypothesisTableService.fetchTrajectoriesFromTypes).mockResolvedValue(mockTrajectories);

    const { result } = renderHook(() => useFetchHypothesisParametersTrajectories(1, [{ name: 'A' }], [], false));

    await waitFor(() => {
      expect(result.current.hypothesisTrajectories).toHaveLength(3);
      expect(result.current.hypothesisTrajectories[1].status).toBe(TRAJECTORY_SELECTION_STATUS.MISSING);
      expect(result.current.hypothesisTrajectories[2].status).toBe(TRAJECTORY_SELECTION_STATUS.MISSING);
    });
  });

  it('should handle empty trajectory response', async () => {
    vi.mocked(hypothesisTableService.fetchTrajectoriesFromTypes).mockResolvedValue({});

    const { result } = renderHook(() => useFetchHypothesisParametersTrajectories(1, [{ name: 'A' }], [], false));

    await waitFor(() => {
      expect(result.current.hypothesisTrajectories.every((h) => h.status === TRAJECTORY_SELECTION_STATUS.MISSING)).toBe(
        true,
      );
    });
  });
});
