import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { DbTrajectory, HypothesisRowData, StudyDTO } from '@/shared/types';
import { TRAJECTORY_SELECTION_STATUS, TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { useHypothesisTableRemoveRow } from '@/hooks/useHypothesisTableRemoveRow.ts';
import { unlinkMultipleTrajectoriesFromStudy, unlinkTrajectoryFromStudy } from '@/shared/services/trajectoryService.ts';
import { STUDY_ACTION } from '@/shared/enum/study.ts';
import { notifyAlert } from '@/shared/notification/notification.tsx';

vi.mock('@/shared/services/trajectoryService', () => ({
  unlinkTrajectoryFromStudy: vi.fn(),
  unlinkMultipleTrajectoriesFromStudy: vi.fn(),
}));

vi.mock('@/shared/notification/notification', () => ({
  notifyAlert: vi.fn(),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: vi.fn().mockImplementation((key: string) => key),
  }),
}));

describe('useHypothesisTableRemoveRow', () => {
  const mockDispatch = vi.fn();
  const mockSetData = vi.fn();
  const mockSetCheckedValues = vi.fn();

  const study = { id: 'study-001', name: 'Demo Study' } as unknown as StudyDTO;

  const row: HypothesisRowData = {
    hypothesis: 'Zone A',
    trajectory: { id: 10, trajectoryName: 'Traj A', area: 'Zone A' } as DbTrajectory,
    status: TRAJECTORY_SELECTION_STATUS.OK,
    subRows: [],
  };

  const subRowsMock = [
    {
      hypothesis: 'Tech B',
      trajectory: { id: 20, trajectoryName: 'Traj B', area: 'Tech B' } as DbTrajectory,
      status: TRAJECTORY_SELECTION_STATUS.OK,
      subRows: [],
    },
    {
      hypothesis: 'Tech C',
      trajectory: { id: 30, trajectoryName: 'Traj C', area: 'Tech C' } as DbTrajectory,
      status: TRAJECTORY_SELECTION_STATUS.OK,
      subRows: [],
    },
  ];

  const rowWithSubRows: HypothesisRowData = {
    ...row,
    subRows: subRowsMock,
  };

  const rowNullWithSubRows: HypothesisRowData = {
    hypothesis: 'Zone A',
    trajectory: null,
    status: TRAJECTORY_SELECTION_STATUS.MISSING,
    subRows: subRowsMock,
  };

  const rowNullWithSingleRow: HypothesisRowData = {
    hypothesis: 'Zone A',
    trajectory: null,
    status: TRAJECTORY_SELECTION_STATUS.MISSING,
    subRows: [
      {
        hypothesis: 'Tech B',
        trajectory: null,
        status: TRAJECTORY_SELECTION_STATUS.MISSING,
        subRows: [],
      },
      {
        hypothesis: 'Tech C',
        trajectory: { id: 30, trajectoryName: 'Traj C', area: 'Tech C' } as DbTrajectory,
        status: TRAJECTORY_SELECTION_STATUS.OK,
        subRows: [],
      },
    ],
  };

  const modulationTrajectory = {
    id: 202,
    type: TRAJECTORY_TYPE.THERMAL_TECHNICAL_MODULATION_PARAMETER,
    trajectoryName: 'traj',
  };
  const trajectory = { id: 101, area: 'Area A' };
  const subRow = {
    hypothesis: 'SubHypo',
    trajectory,
    status: TRAJECTORY_SELECTION_STATUS.OK,
  };
  const rowData = [
    {
      hypothesis: 'MainHypo',
      trajectory: null,
      status: TRAJECTORY_SELECTION_STATUS.MISSING,
      subRows: [subRow],
    },
    {
      hypothesis: 'Modulation',
      trajectory: modulationTrajectory,
      status: TRAJECTORY_SELECTION_STATUS.OK,
      subRows: [],
    },
  ] as HypothesisRowData[];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should unlink single main trajectory and update state', async () => {
    const { result } = renderHook(() =>
      useHypothesisTableRemoveRow(study, mockDispatch, mockSetData, mockSetCheckedValues),
    );

    await result.current.removeRow(TRAJECTORY_TYPE.LOAD, 'Zone A', 0, [row]);

    expect(unlinkTrajectoryFromStudy).toHaveBeenCalledWith(10, 'study-001');
    expect(mockDispatch).toHaveBeenCalledWith({
      type: STUDY_ACTION.DELETE_TRAJECTORY,
      payload: { area: 'Zone A', type: TRAJECTORY_TYPE.LOAD },
    });
    expect(mockSetData).toHaveBeenCalled();
    expect(mockSetCheckedValues).toHaveBeenCalled();
  });

  it('should unlink single subRow trajectory without parent one and update state', async () => {
    const { result } = renderHook(() =>
      useHypothesisTableRemoveRow(study, mockDispatch, mockSetData, mockSetCheckedValues),
    );

    await result.current.removeRow(TRAJECTORY_TYPE.LOAD, 'Zone A', 0, [rowNullWithSingleRow]);

    expect(unlinkTrajectoryFromStudy).toHaveBeenCalledWith(30, 'study-001');
    expect(mockDispatch).toHaveBeenCalledWith({
      type: STUDY_ACTION.DELETE_TRAJECTORY,
      payload: { area: 'Zone A', type: TRAJECTORY_TYPE.LOAD },
    });
    expect(mockSetData).toHaveBeenCalled();
    expect(mockSetCheckedValues).toHaveBeenCalled();
  });

  it('should unlink multiple subRows trajectories without parent one and update state', async () => {
    const { result } = renderHook(() =>
      useHypothesisTableRemoveRow(study, mockDispatch, mockSetData, mockSetCheckedValues),
    );

    await result.current.removeRow(TRAJECTORY_TYPE.LOAD, 'Zone A', 0, [rowNullWithSubRows]);

    expect(unlinkMultipleTrajectoriesFromStudy).toHaveBeenCalledWith('study-001', [20, 30]);
    expect(mockDispatch).toHaveBeenCalledWith({
      type: STUDY_ACTION.DELETE_TRAJECTORY,
      payload: { area: 'Zone A', type: TRAJECTORY_TYPE.LOAD },
    });
    expect(mockSetData).toHaveBeenCalled();
    expect(mockSetCheckedValues).toHaveBeenCalled();
  });

  it('should unlink multiple trajectories when subRows exist', async () => {
    const { result } = renderHook(() =>
      useHypothesisTableRemoveRow(study, mockDispatch, mockSetData, mockSetCheckedValues),
    );

    await result.current.removeRow(TRAJECTORY_TYPE.LOAD, 'Zone A', 0, [rowWithSubRows]);

    expect(unlinkMultipleTrajectoriesFromStudy).toHaveBeenCalledWith('study-001', [10, 20, 30]);
    expect(mockDispatch).toHaveBeenCalled();
    expect(mockSetData).toHaveBeenCalled();
    expect(mockSetCheckedValues).toHaveBeenCalled();
  });

  it('should handle error and call notifyAlert', async () => {
    const mockUnlinkTrajectoryFromStudy = unlinkTrajectoryFromStudy as Mock;
    mockUnlinkTrajectoryFromStudy.mockImplementationOnce(() => {
      throw new Error('unlink failed');
    });

    const { result } = renderHook(() =>
      useHypothesisTableRemoveRow(study, mockDispatch, mockSetData, mockSetCheckedValues),
    );

    await result.current.removeRow(TRAJECTORY_TYPE.LOAD, 'Zone A', 0, [row]);

    expect(notifyAlert).toHaveBeenCalled();
  });

  it('should remove specific parameter and modulation trajectory when only one subRow exists', async () => {
    const { result } = renderHook(() =>
      useHypothesisTableRemoveRow(study, mockDispatch, mockSetData, mockSetCheckedValues),
    );

    await result.current.removeRow(TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER, 'SubHypo', 0, rowData);

    expect(unlinkMultipleTrajectoriesFromStudy).toHaveBeenCalledWith('study-001', [202, 101]);
    expect(mockDispatch).toHaveBeenCalledWith({
      type: STUDY_ACTION.DELETE_TRAJECTORY,
      payload: { area: 'Area A', type: TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER },
    });
    expect(mockSetData).toHaveBeenCalled();
    expect(mockSetCheckedValues).toHaveBeenCalled();
  });

  it('should remove only the specific trajectory when multiple subRows exist', async () => {
    const rowDataMultiple = [
      {
        hypothesis: 'MainHypo',
        trajectory: null,
        status: TRAJECTORY_SELECTION_STATUS.MISSING,
        subRows: [
          {
            hypothesis: 'OtherHypo',
            trajectory: {
              id: 303,
              type: TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER,
            },
            status: TRAJECTORY_SELECTION_STATUS.OK,
          },
        ],
      },
      {
        hypothesis: 'Modulation',
        trajectory: modulationTrajectory,
        status: TRAJECTORY_SELECTION_STATUS.OK,
        subRows: [],
      },
    ] as HypothesisRowData[];
    const { result } = renderHook(() =>
      useHypothesisTableRemoveRow(study, mockDispatch, mockSetData, mockSetCheckedValues),
    );

    await result.current.removeRow(
      TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER,
      'OtherHypo',
      0,
      rowDataMultiple,
    );

    expect(unlinkMultipleTrajectoriesFromStudy).toHaveBeenCalledWith('study-001', [202, 303]);
    expect(mockSetData).toHaveBeenCalled();
    expect(mockSetCheckedValues).toHaveBeenCalled();
  });

  it('should call notifyAlert on error', async () => {
    const mockUnlinkMultipleTrajectoriesFromStudy = unlinkMultipleTrajectoriesFromStudy as Mock;
    mockUnlinkMultipleTrajectoriesFromStudy.mockRejectedValue(() => {
      throw new Error('unlink failed');
    });

    const { result } = renderHook(() =>
      useHypothesisTableRemoveRow(study, mockDispatch, mockSetData, mockSetCheckedValues),
    );

    await result.current.removeRow(TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER, 'SubHypo', 0, rowData);

    expect(notifyAlert).toHaveBeenCalled();
  });
});
