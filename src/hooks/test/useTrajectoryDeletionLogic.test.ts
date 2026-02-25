import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  collectTrajectoriesRecursively,
  findSpecificTrajectoryToDelete,
  getSpecificTrajectories,
} from '@/shared/helpers/hypothesisTableHelper.ts';
import { useTrajectoryDeletionLogic } from '@/hooks/useTrajectoryDeletionLogic.ts';
import { DbTrajectory, HypothesisRowData, StudyDTO } from '@/shared/types';
import { TRAJECTORY_SELECTION_STATUS, TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { renderHook } from '@testing-library/react';
import { shouldDeleteCapacityModulation } from '@/shared/utils/trajectoryUtils.ts';
import * as trajectoryService from '@/shared/services/trajectoryService.ts';

vi.mock('@/shared/utils/trajectoryUtils.ts', () => ({
  shouldDeleteCapacityModulation: vi.fn(),
}));

vi.mock('@/shared/helpers/hypothesisTableHelper.ts', () => ({
  findSpecificTrajectoryToDelete: vi.fn(),
  getSpecificTrajectories: vi.fn(),
  collectTrajectoriesRecursively: vi.fn(),
}));

vi.mock('@/shared/services/trajectoryService.ts', () => ({
  unlinkMultipleTrajectoriesFromStudy: vi.fn(),
  unlinkTrajectoryFromStudy: vi.fn(),
}));

describe('useTrajectoryDeletionLogic - THERMAL', () => {
  const study = { id: 42 } as StudyDTO;

  const specificTrajectory = { id: 10 } as DbTrajectory;
  const modulationTrajectory = { id: 99 } as DbTrajectory;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('supprime la trajectoire spécifique seule si ce n’est pas la dernière', () => {
    const { result } = renderHook(() => useTrajectoryDeletionLogic(study));
    const computeDeletion = result.current.computeDeletion;

    vi.mocked(findSpecificTrajectoryToDelete).mockReturnValue(specificTrajectory);
    vi.mocked(getSpecificTrajectories).mockReturnValue([specificTrajectory, { id: 11 } as DbTrajectory]);

    const data = [{ subRows: [] }, { status: 'OK', trajectory: modulationTrajectory }] as HypothesisRowData[];

    const deletionResult = computeDeletion(
      TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER,
      data,
      null,
      null,
      'HYP',
    );

    expect(deletionResult).toEqual({
      trajectoryIds: [10],
      trajectoryToDelete: specificTrajectory,
      additionalTrajectory: null,
    });
  });

  it('supprime la spécifique + modulation si c’est la dernière', () => {
    const { result } = renderHook(() => useTrajectoryDeletionLogic(study));
    const computeDeletion = result.current.computeDeletion;

    vi.mocked(findSpecificTrajectoryToDelete).mockReturnValue(specificTrajectory);
    vi.mocked(getSpecificTrajectories).mockReturnValue([specificTrajectory]); // dernière

    const data = [{ subRows: [] }, { status: 'OK', trajectory: modulationTrajectory }] as HypothesisRowData[];

    const deletionResult = computeDeletion(
      TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER,
      data,
      null,
      null,
      'HYP',
    );

    expect(deletionResult).toEqual({
      trajectoryIds: [99, 10], // modulation + spécifique
      trajectoryToDelete: specificTrajectory,
      additionalTrajectory: modulationTrajectory,
    });
  });
});

describe('computeDeletion - DSR', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('supprime uniquement la trajectoire spécifique si pas de modulation', () => {
    const study = { id: 1 } as StudyDTO;
    const { result } = renderHook(() => useTrajectoryDeletionLogic(study));
    const computeDeletion = result.current.computeDeletion;

    const specific = { id: 10 } as DbTrajectory;
    vi.mocked(findSpecificTrajectoryToDelete).mockReturnValue(specific);
    vi.mocked(shouldDeleteCapacityModulation).mockReturnValue(false);

    const data = [
      { status: TRAJECTORY_SELECTION_STATUS.OK, trajectory: { id: 99 } },
      { status: TRAJECTORY_SELECTION_STATUS.ERROR },
    ] as HypothesisRowData[];

    const resultDeletion = computeDeletion(TRAJECTORY_TYPE.DSR, data, null, [0], 'HYP');

    expect(resultDeletion).toEqual({
      trajectoryIds: [10],
      trajectoryToDelete: specific,
      additionalTrajectory: null,
    });
  });
  it('supprime la trajectoire spécifique + modulation si applicable', () => {
    const study = { id: 1 } as StudyDTO;
    const { result } = renderHook(() => useTrajectoryDeletionLogic(study));
    const computeDeletion = result.current.computeDeletion;

    const specific = { id: 10 } as DbTrajectory;
    const modulation = { id: 99 };

    vi.mocked(findSpecificTrajectoryToDelete).mockReturnValue(specific);
    vi.mocked(shouldDeleteCapacityModulation).mockReturnValue(true);

    const data = [
      { status: TRAJECTORY_SELECTION_STATUS.ERROR },
      { status: TRAJECTORY_SELECTION_STATUS.OK, trajectory: modulation },
    ] as HypothesisRowData[];

    const resultDeletion = computeDeletion(TRAJECTORY_TYPE.DSR, data, null, [0], 'HYP');

    expect(resultDeletion).toEqual({
      trajectoryIds: [99, 10],
      trajectoryToDelete: specific,
      additionalTrajectory: modulation,
    });
  });
});

describe('computeDeletion - générique', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('supprime toutes les trajectoires de la ligne (indexRow)', () => {
    const study = { id: 1 } as StudyDTO;
    const { result } = renderHook(() => useTrajectoryDeletionLogic(study));
    const computeDeletion = result.current.computeDeletion;

    const row = {
      trajectory: { id: 5 },
    };

    const collected = [{ id: 5 }, { id: 6 }] as DbTrajectory[];
    vi.mocked(collectTrajectoriesRecursively).mockReturnValue(collected);

    const data = [row] as HypothesisRowData[];

    const resultDeletion = computeDeletion(TRAJECTORY_TYPE.LOAD, data, 0, null, 'HYP');

    expect(resultDeletion).toEqual({
      trajectoryIds: [5, 6],
      trajectoryToDelete: row.trajectory,
      additionalTrajectory: null,
    });
  });

  it('supprime toutes les trajectoires d’une sous-ligne (indexArray)', () => {
    const study = { id: 1 } as StudyDTO;
    const { result } = renderHook(() => useTrajectoryDeletionLogic(study));
    const computeDeletion = result.current.computeDeletion;

    const subRow = {
      trajectory: { id: 20 },
    };

    const collected = [{ id: 20 }, { id: 21 }] as DbTrajectory[];
    vi.mocked(collectTrajectoriesRecursively).mockReturnValue(collected);

    const data = [
      {
        subRows: [null, subRow],
      },
    ] as HypothesisRowData[];

    const resultDeletion = computeDeletion(TRAJECTORY_TYPE.STS, data, null, [0, 1], 'HYP');

    expect(resultDeletion).toEqual({
      trajectoryIds: [20, 21],
      trajectoryToDelete: subRow.trajectory,
      additionalTrajectory: null,
    });
  });
});

describe('computeDeletion - générique', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('ne fait rien si study.id est absent', async () => {
    const study = { id: null } as unknown as StudyDTO;
    const { result } = renderHook(() => useTrajectoryDeletionLogic(study));
    const performBackendDeletion = result.current.performBackendDeletion;
    await performBackendDeletion([1]);
    expect(trajectoryService.unlinkTrajectoryFromStudy).not.toHaveBeenCalled();
    expect(trajectoryService.unlinkMultipleTrajectoriesFromStudy).not.toHaveBeenCalled();
  });
  it('ne fait rien si trajectoryIds est vide', async () => {
    const study = { id: 42 } as StudyDTO;
    const { result } = renderHook(() => useTrajectoryDeletionLogic(study));
    const performBackendDeletion = result.current.performBackendDeletion;
    await performBackendDeletion([]);
    expect(trajectoryService.unlinkTrajectoryFromStudy).not.toHaveBeenCalled();
    expect(trajectoryService.unlinkMultipleTrajectoriesFromStudy).not.toHaveBeenCalled();
  });

  it('appelle unlinkTrajectoryFromStudy quand un seul ID', async () => {
    const study = { id: 10 } as StudyDTO;
    const { result } = renderHook(() => useTrajectoryDeletionLogic(study));
    const performBackendDeletion = result.current.performBackendDeletion;

    const trajectoryIds = [1];
    await performBackendDeletion(trajectoryIds);

    expect(trajectoryService.unlinkTrajectoryFromStudy).toHaveBeenCalledWith(1, 10);
    expect(trajectoryService.unlinkMultipleTrajectoriesFromStudy).not.toHaveBeenCalled();
  });

  it('appelle unlinkMultipleTrajectoriesFromStudy quand plusieurs IDs', async () => {
    const study = { id: 10 } as StudyDTO;
    const { result } = renderHook(() => useTrajectoryDeletionLogic(study));
    const performBackendDeletion = result.current.performBackendDeletion;

    const trajectoryIds = [1, 5];
    await performBackendDeletion(trajectoryIds);

    expect(trajectoryService.unlinkMultipleTrajectoriesFromStudy).toHaveBeenCalledWith(10, trajectoryIds);
    expect(trajectoryService.unlinkTrajectoryFromStudy).not.toHaveBeenCalled();
  });
});
