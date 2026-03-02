import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { STUDY_ACTION } from '@/shared/enum/study.ts';
import { HypothesisRowData, StudyDTO } from '@/shared/types';
import { useHypothesisTableRemoveRow } from '@/hooks/useHypothesisTableRemoveRow';
import { useTrajectoryDeletionLogic } from '@/hooks/useTrajectoryDeletionLogic.ts';
import * as hypothesisTableHelper from '@/shared/helpers/hypothesisTableHelper.ts';
import { notifyAlert } from '@/shared/notification/notification.tsx';

// --- MOCKS ---

vi.mock('@/hooks/useTrajectoryDeletionLogic', () => ({
  useTrajectoryDeletionLogic: vi.fn(),
}));

vi.mock('@/shared/helpers/hypothesisTableHelper.ts', () => ({
  updateTableAfterRowDeletion: vi.fn(),
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
  const study = {
    id: 1,
    horizon: 2030,
    name: 'Study X',
  } as unknown as StudyDTO;

  const mockDispatch = vi.fn();
  const mockSetData = vi.fn();
  const mockSetCheckedValues = vi.fn();
  const mockSetReadOnly = vi.fn();

  const sampleData = [
    { hypothesis: 'H1', trajectory: { id: 10 }, status: 'OK' },
    { hypothesis: 'H2', trajectory: { id: 20 }, status: 'OK' },
  ] as HypothesisRowData[];

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useTrajectoryDeletionLogic).mockReturnValue({
      computeDeletion: vi.fn().mockReturnValue({
        trajectoryIds: [10],
        trajectoryToDelete: { area: 'AREA_X' },
      }),
      performBackendDeletion: vi.fn().mockResolvedValue(undefined),
    });

    vi.mocked(hypothesisTableHelper.updateTableAfterRowDeletion).mockResolvedValue({
      newData: [{ hypothesis: 'H2' }] as HypothesisRowData[],
      newReadOnly: { 1: true },
    });
  });

  it('supprime une ligne correctement', async () => {
    const { result } = renderHook(() =>
      useHypothesisTableRemoveRow(study, mockDispatch, mockSetData, mockSetCheckedValues, mockSetReadOnly),
    );

    await act(async () => {
      await result.current.removeRow(TRAJECTORY_TYPE.DSR, 0, sampleData, 'H1');
    });

    // 1. computeDeletion appelé
    expect(useTrajectoryDeletionLogic(study).computeDeletion).toHaveBeenCalledWith(
      TRAJECTORY_TYPE.DSR,
      sampleData,
      0,
      null,
      'H1',
    );

    // 2. performBackendDeletion appelé
    expect(useTrajectoryDeletionLogic(study).performBackendDeletion).toHaveBeenCalledWith([10]);

    // 3. dispatch appelé
    expect(mockDispatch).toHaveBeenCalledWith({
      type: STUDY_ACTION.DELETE_TRAJECTORY,
      payload: { area: 'AREA_X', type: TRAJECTORY_TYPE.DSR },
    });

    // 4. updateTableAfterRowDeletion appelé
    expect(hypothesisTableHelper.updateTableAfterRowDeletion).toHaveBeenCalled();

    // 5. setData mis à jour
    expect(mockSetData).toHaveBeenCalledWith([{ hypothesis: 'H2' }]);

    // 6. setReadOnly mis à jour
    expect(mockSetReadOnly).toHaveBeenCalled();

    // 7. setCheckedValues mis à jour
    expect(mockSetCheckedValues).toHaveBeenCalledWith(expect.any(Function));
  });

  it('affiche une alerte en cas d’erreur', async () => {
    vi.mocked(useTrajectoryDeletionLogic).mockReturnValue({
      computeDeletion: vi.fn().mockReturnValue({
        trajectoryIds: [10],
        trajectoryToDelete: { area: 'AREA_X' },
      }),
      performBackendDeletion: vi.fn().mockRejectedValue(new Error('Boom')),
    });

    const { result } = renderHook(() =>
      useHypothesisTableRemoveRow(study, mockDispatch, mockSetData, mockSetCheckedValues, mockSetReadOnly),
    );

    await act(async () => {
      await result.current.removeRow(TRAJECTORY_TYPE.DSR, 0, sampleData, 'H1');
    });

    expect(notifyAlert).toHaveBeenCalled();
  });
});
