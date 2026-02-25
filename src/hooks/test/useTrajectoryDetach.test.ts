import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useTrajectoryDetach } from '@/hooks/useTrajectoryDetach';
import { useTrajectoryDeletionLogic } from '@/hooks/useTrajectoryDeletionLogic';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import * as hypothesisTableHelper from '@/shared/helpers/hypothesisTableHelper.ts';
import { HypothesisRowData, StudyDTO } from '@/shared/types';
import { STUDY_ACTION } from '@/shared/enum/study.ts';
import * as hypothesisTableService from '@/shared/services/hypothesisTableService.ts';

vi.mock('@/hooks/useTrajectoryDeletionLogic', () => ({
  useTrajectoryDeletionLogic: vi.fn(),
}));

vi.mock('@/shared/helpers/hypothesisTableHelper.ts', () => ({
  updateTableAfterCellDetach: vi.fn(),
}));

vi.mock('@/shared/notification/notification', () => ({
  notifyAlert: vi.fn(),
}));

vi.mock('@/shared/services/hypothesisTableService.ts', () => ({
  handleTrajectoryError: vi.fn(),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: vi.fn().mockImplementation((key: string) => key),
  }),
}));

vi.mock('@/hooks/useUser', () => ({
  useUser: () => ({
    user: { profile: { sub: 'user-123' } },
  }),
}));

describe('useTrajectoryDetach', () => {
  const study = {
    id: 1,
    horizon: 2030,
    name: 'Study X',
  } as unknown as StudyDTO;

  const mockDispatch = vi.fn();
  const mockSetReadOnly = vi.fn();
  const mockSetData = vi.fn();

  const sampleData = [
    {
      hypothesis: 'H1',
      trajectory: { id: 10, type: TRAJECTORY_TYPE.DSR, hasTimeSeries: false },
      status: 'OK',
    },
    {
      hypothesis: 'H2',
      trajectory: { id: 20, type: TRAJECTORY_TYPE.DSR, hasTimeSeries: false },
      status: 'OK',
    },
  ] as HypothesisRowData[];

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useTrajectoryDeletionLogic).mockReturnValue({
      computeDeletion: vi.fn().mockReturnValue({
        trajectoryIds: [10],
        trajectoryToDelete: {
          id: 10,
          area: 'AREA_X',
          trajectoryName: 'Traj X',
        },
        additionalTrajectory: null,
      }),
      performBackendDeletion: vi.fn().mockResolvedValue(undefined),
    });

    vi.mocked(hypothesisTableHelper.updateTableAfterCellDetach).mockResolvedValue({
      newData: [{ hypothesis: 'H1' }] as HypothesisRowData[],
      newReadOnly: { 1: true },
    });
  });

  // --------------------------------------------------------------------
  //  TEST 1 : Détachement OK
  // --------------------------------------------------------------------
  it('détache correctement une trajectoire', async () => {
    const { result } = renderHook(() => useTrajectoryDetach(study, mockDispatch, mockSetReadOnly));

    await act(async () => {
      await result.current.detachTrajectory(TRAJECTORY_TYPE.DSR, [0], mockSetData, sampleData, 'empty', 'H1');
    });

    // computeDeletion appelé
    expect(useTrajectoryDeletionLogic(study).computeDeletion).toHaveBeenCalledWith(
      TRAJECTORY_TYPE.DSR,
      sampleData,
      null,
      [0],
      'H1',
    );

    // performBackendDeletion appelé
    expect(useTrajectoryDeletionLogic(study).performBackendDeletion).toHaveBeenCalledWith([10]);

    // dispatch appelé
    expect(mockDispatch).toHaveBeenCalledWith({
      type: STUDY_ACTION.UPDATE_TRAJECTORY,
      payload: {
        trajectory: {
          id: 10,
          area: 'AREA_X',
          trajectoryName: 'Traj X',
        },
        status: 'empty',
      },
    });

    // updateTableAfterCellDetach appelé
    expect(hypothesisTableHelper.updateTableAfterCellDetach).toHaveBeenCalled();

    // setData mis à jour
    expect(mockSetData).toHaveBeenCalledWith([{ hypothesis: 'H1' }]);

    // setReadOnly mis à jour
    expect(mockSetReadOnly).toHaveBeenCalled();
  });

  // --------------------------------------------------------------------
  //  TEST 2 : Erreur avec trajectoryToDelete → handleTrajectoryError
  // --------------------------------------------------------------------
  it('appelle handleTrajectoryError en cas d’erreur avec trajectoryToDelete', async () => {
    vi.mocked(useTrajectoryDeletionLogic).mockReturnValue({
      computeDeletion: vi.fn().mockReturnValue({
        trajectoryIds: [10],
        trajectoryToDelete: {
          id: 10,
          area: 'AREA_X',
          trajectoryName: 'Traj X',
        },
        additionalTrajectory: null,
      }),
      performBackendDeletion: vi.fn().mockRejectedValue(new Error('Boom')),
    });

    const { result } = renderHook(() => useTrajectoryDetach(study, mockDispatch, mockSetReadOnly));

    await act(async () => {
      await result.current.detachTrajectory(TRAJECTORY_TYPE.DSR, [0], mockSetData, sampleData, 'empty', 'H1');
    });

    expect(hypothesisTableService.handleTrajectoryError).toHaveBeenCalled();
  });
});
