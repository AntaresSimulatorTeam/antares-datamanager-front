import { describe, Mock, vi } from 'vitest';
import { useFetchHypothesisParametersTrajectories } from '@/hooks/useFetchHypothesisParametersTrajectories.ts';
import * as trajectoryUtils from '@/shared/utils/trajectoryUtils.ts';
import * as hypothesisTableService from '@/shared/services/hypothesisTableService.ts';
import * as hypothesisTableUtils from '@/shared/utils/hypothesisTableUtils.ts';
import * as sortUtils from '@/shared/utils/sortUtils.ts';
import { TRAJECTORY_SELECTION_STATUS, TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { STUDY_ACTION } from '@/shared/enum/study.ts';
import { DbTrajectory, HypothesisRowData } from '@/shared/types';
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
vi.mock('@/shared/utils/hypothesisTableUtils', async (importOriginal) => {
  const actual: Mock = await importOriginal();
  return {
    ...actual,
    buildCheckListBox: vi.fn(),
    getDefaultAreaNotIncludedInAreaList: vi.fn(),
    transformToSubRowKeys: vi.fn(),
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

describe('useFetchHypothesisParametersTrajectories', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch and populate hypothesis trajectories', async () => {
    const mockUseStudyDispatch = useStudyDispatch as Mock<typeof useStudyDispatch>;
    //const mockUseStudy = useStudy as Mock<typeof useStudy>;
    const mockDispatch = vi.fn().mockImplementation(vi.fn());
    mockUseStudyDispatch.mockReturnValue(mockDispatch);
    const mockSpecific = [{ id: '2', area: 'B', trajectoryName: 'T2' }] as unknown as DbTrajectory[];
    const mockModulation = [{ id: '3', trajectoryName: 'Mod' }] as unknown as DbTrajectory[];
    const mockCommon = [{ id: '4', trajectoryName: 'Common' }] as unknown as DbTrajectory[];
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

    vi.mocked(trajectoryUtils.buildEmptyTrajectory).mockImplementation(
      (_, type) => ({ hypothesis: 'empty', type }) as unknown as DbTrajectory,
    );
    vi.mocked(trajectoryUtils.buildDefaultEmptyTrajectoryList).mockReturnValue([]);
    vi.mocked(trajectoryUtils.removeDuplicate).mockReturnValue([...mockSpecific]);
    vi.mocked(hypothesisTableUtils.buildCheckListBox).mockReturnValue({
      areaOptions: [{ name: 'B', isDefault: false }],
      checkedValues: ['B'],
    });
    vi.mocked(trajectoryUtils.buildRowWithSubRowsData).mockReturnValue({
      hypothesis: 'row1',
      status: TRAJECTORY_SELECTION_STATUS.OK,
    } as HypothesisRowData);
    vi.mocked(sortUtils.sortWithFixedPosition).mockReturnValue([
      { hypothesis: 'row1', status: TRAJECTORY_SELECTION_STATUS.OK } as HypothesisRowData,
    ]);
    vi.mocked(hypothesisTableUtils.getDefaultAreaNotIncludedInAreaList).mockReturnValue([]);
    vi.mocked(hypothesisTableUtils.transformToSubRowKeys).mockReturnValue({ row1: true });

    const { result } = renderHook(() =>
      useFetchHypothesisParametersTrajectories(123, [{ name: 'B' }, { name: 'C' }], trajectoryData),
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
      expect(result.current.areasTrajectoryOptions).toEqual([{ name: 'B', isDefault: false }]);
      expect(result.current.dropDownListOptions).toEqual(['B']);
      expect(result.current.readOnlyRow).toEqual({ row1: true });
    });
  });
});
