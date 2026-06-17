import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useTrajectoryDetach } from '@/hooks/useTrajectoryDetach';
import { useTrajectoryDeletionLogic } from '@/hooks/useTrajectoryDeletionLogic';
import { TRAJECTORY_SELECTION_STATUS, TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import * as hypothesisTableHelper from '@/shared/helpers/hypothesisTableHelper.ts';
import { DbTrajectory, HypothesisRowData, StudyDTO } from '@/shared/types';
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
  const mockSetRowIdSelected = vi.fn();
  const mockSetIsDeletionModalOpen = vi.fn();

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

    vi.mocked(hypothesisTableHelper.updateTableAfterCellDetach).mockResolvedValue({
      newData: [{ hypothesis: 'H1' }] as HypothesisRowData[],
      newReadOnly: { 1: true },
    });
  });

  // --------------------------------------------------------------------
  //  TEST 1 : Détachement OK
  // --------------------------------------------------------------------
  it('détache correctement une trajectoire dont le type est autre que type AREA', async () => {
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
      'empty',
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

  it('détache correctement une trajectoire dont le type est autre que type AREA', async () => {
    vi.mocked(useTrajectoryDeletionLogic).mockReturnValue({
      computeDeletion: vi.fn().mockReturnValue({
        trajectoryIds: [10],
        trajectoryToDelete: {
          id: 10,
          area: 'AREA_X',
          trajectoryName: 'Traj X',
          type: TRAJECTORY_TYPE.AREA,
        },
        additionalTrajectory: null,
      }),
      performBackendDeletion: vi.fn().mockResolvedValue(undefined),
    });
    const { result } = renderHook(() => useTrajectoryDetach(study, mockDispatch, mockSetReadOnly));

    await act(async () => {
      await result.current.detachTrajectory(TRAJECTORY_TYPE.AREA, [0], mockSetData, sampleData, 'empty', 'H1');
    });

    // computeDeletion appelé
    expect(useTrajectoryDeletionLogic(study).computeDeletion).toHaveBeenCalledWith(
      TRAJECTORY_TYPE.AREA,
      sampleData,
      null,
      [0],
      'H1',
      'empty',
    );

    // performBackendDeletion appelé
    expect(useTrajectoryDeletionLogic(study).performBackendDeletion).toHaveBeenCalledWith([10]);

    // dispatch appelé
    expect(mockDispatch).toHaveBeenCalledWith({ type: STUDY_ACTION.RESET_STUDY_STATE });

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

  // --------------------------------------------------------------------
  //  TEST 3 : Erreur avec trajectoryToDelete → Confirmed required => open modal
  // --------------------------------------------------------------------
  it('ouvre la modal en cas d’erreur avec Confirmed required', async () => {
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
      performBackendDeletion: vi.fn().mockRejectedValue(new Error('Confirmation required')),
    });

    const { result } = renderHook(() =>
      useTrajectoryDetach(study, mockDispatch, mockSetReadOnly, mockSetIsDeletionModalOpen, mockSetRowIdSelected),
    );

    await act(async () => {
      await result.current.detachTrajectory(TRAJECTORY_TYPE.AREA, [0], mockSetData, sampleData, 'empty', 'H1');
    });

    expect(mockSetIsDeletionModalOpen).toHaveBeenCalledWith(true);
    expect(mockSetRowIdSelected).toHaveBeenCalledWith('0');
  });

  // --------------------------------------------------------------------
  //  TEST 4 : area control failed and a trajectory Links is linked to the study with ok status
  // --------------------------------------------------------------------
  it("le contrôle de l'area échoue et une trajectoire Links est liée", async () => {
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
      performBackendDeletion: vi.fn().mockRejectedValueOnce(new Error('Boom')),
    });
    const data = [
      { hypothesis: 'H1', trajectory: { id: 10, type: TRAJECTORY_TYPE.AREA, hasTimeSeries: false }, status: 'OK' },
      { hypothesis: 'H2', trajectory: { id: 11, type: TRAJECTORY_TYPE.LINK, hasTimeSeries: false }, status: 'OK' },
    ] as HypothesisRowData[];

    const { result } = renderHook(() =>
      useTrajectoryDetach(study, mockDispatch, mockSetReadOnly, mockSetIsDeletionModalOpen, mockSetRowIdSelected),
    );

    await act(async () => {
      await result.current.detachTrajectory(TRAJECTORY_TYPE.AREA, [0], mockSetData, data, 'empty', 'H1');
    });

    expect(useTrajectoryDeletionLogic(study).performBackendDeletion).toHaveBeenCalledTimes(2);
    expect(mockDispatch).toHaveBeenCalledWith({
      type: STUDY_ACTION.CLEAR_TRAJECTORY_BY_TYPE,
      payload: [TRAJECTORY_TYPE.LINK],
    });
    expect(mockSetData).toHaveBeenCalled();
    const setDataCallback = mockSetData.mock.calls[0][0] as (prev: HypothesisRowData[]) => HypothesisRowData[];
    const resultData = setDataCallback([
      {
        hypothesis: 'H1',
        trajectory: { id: 10, type: TRAJECTORY_TYPE.AREA, hasTimeSeries: false } as DbTrajectory,
        status: TRAJECTORY_SELECTION_STATUS.ERROR,
      },
      { hypothesis: 'H2', trajectory: null, status: TRAJECTORY_SELECTION_STATUS.MISSING },
    ]);
    expect(Object.keys(resultData[0].trajectory as DbTrajectory)).toEqual([
      'id',
      'trajectoryName',
      'technology',
      'type',
      'version',
      'userName',
      'creationDate',
      'area',
      'state',
      'hasTimeSeries',
    ]);
    expect(resultData[0].status).toBe(TRAJECTORY_SELECTION_STATUS.ERROR);
    expect(mockSetReadOnly).toHaveBeenCalledWith({ '0': false, '1': false });
  });
});
