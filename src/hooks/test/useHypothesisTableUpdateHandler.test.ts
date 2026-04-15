import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import * as trajectoryUtils from '@/shared/utils/trajectoryUtils.ts';
import { useHypothesisTableUpdateHandler } from '@/hooks/useHypothesisTableUpdateHandler.ts';
import { DbTrajectory, HypothesisRowData, StudyDTO } from '@/shared/types';
import { renderHook } from '@testing-library/react';

// Mocks des hooks internes
vi.mock('@/hooks/useStudy', () => ({
  useStudy: () => ({}),
  useStudyDispatch: () => vi.fn(),
}));

// Mock attach/detach
const mockAttach = vi.fn();
const mockDetach = vi.fn();

vi.mock('@/hooks/useTrajectoryAttach', () => ({
  useTrajectoryAttach: () => ({
    attachTrajectory: mockAttach,
  }),
}));

vi.mock('@/hooks/useTrajectoryDetach', () => ({
  useTrajectoryDetach: () => ({
    detachTrajectory: mockDetach,
  }),
}));

// Mock utilitaires
vi.mock('@/shared/utils/trajectoryUtils', () => ({
  getRowDataSelected: vi.fn(),
  shouldDeleteCapacityModulation: vi.fn(),
}));

describe('useHypothesisTableUpdateHandler', () => {
  const setData = vi.fn();
  const setRowToDelete = vi.fn();
  const setIsDeletionModalOpen = vi.fn();
  const setRowIdSelected = vi.fn();
  const setReadOnly = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const studyData = { horizon: 2030 } as unknown as StudyDTO;

  it('should detach trajectory when status is empty', async () => {
    const data = [{ hypothesis: 'Area A', trajectory: { id: 1 } }] as HypothesisRowData[];

    vi.mocked(trajectoryUtils.getRowDataSelected).mockReturnValue(data[0]);
    vi.mocked(trajectoryUtils.shouldDeleteCapacityModulation).mockReturnValue(false);

    const { result } = renderHook(() =>
      useHypothesisTableUpdateHandler({
        studyData,
        data,
        type: TRAJECTORY_TYPE.LOAD,
        setData,
        setRowToDelete,
        setIsDeletionModalOpen,
        dbTrajectories: [],
        setRowIdSelected,
        setReadOnly,
      }),
    );

    await result.current.handleHypothesisTableUpdate('0', null, 'empty');

    expect(mockDetach).toHaveBeenCalledWith(TRAJECTORY_TYPE.LOAD, [0], setData, data, 'empty', 'Area A');
  });

  it('should open deletion modal for DSR capacity modulation', async () => {
    const data = [{ hypothesis: 'Area A' }, { hypothesis: 'Area B' }] as HypothesisRowData[];

    vi.mocked(trajectoryUtils.getRowDataSelected).mockReturnValue(data[1]);
    vi.mocked(trajectoryUtils.shouldDeleteCapacityModulation).mockReturnValue(true);

    const { result } = renderHook(() =>
      useHypothesisTableUpdateHandler({
        studyData,
        data,
        type: TRAJECTORY_TYPE.DSR,
        setData,
        setRowToDelete,
        setIsDeletionModalOpen,
        dbTrajectories: [],
        setRowIdSelected,
        setReadOnly,
      }),
    );

    await result.current.handleHypothesisTableUpdate('1', null, 'empty');

    expect(setRowToDelete).toHaveBeenCalledWith({
      index: 1,
      value: 'Area B',
      operation: 'empty',
    });

    expect(setIsDeletionModalOpen).toHaveBeenCalledWith(true);
    expect(mockDetach).not.toHaveBeenCalled();
  });

  it('should attach trajectory when status is success', async () => {
    const data = [{ hypothesis: 'Area A', trajectory: { id: 1 } }] as HypothesisRowData[];

    const dbTrajectories = [{ id: 42, trajectoryName: 'Trajectory X' }] as DbTrajectory[];

    vi.mocked(trajectoryUtils.getRowDataSelected).mockReturnValue(data[0]);

    const { result } = renderHook(() =>
      useHypothesisTableUpdateHandler({
        studyData,
        data,
        type: TRAJECTORY_TYPE.LOAD,
        setData,
        setRowToDelete,
        setIsDeletionModalOpen,
        dbTrajectories,
        setRowIdSelected,
        setReadOnly,
      }),
    );

    await result.current.handleHypothesisTableUpdate('0', 42, 'success');

    expect(mockAttach).toHaveBeenCalledWith(TRAJECTORY_TYPE.LOAD, [0], 'success', dbTrajectories[0], setData);
  });
});
