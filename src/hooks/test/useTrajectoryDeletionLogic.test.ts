import { beforeEach, describe, expect, it, vi } from 'vitest';
import { findSpecificTrajectoryToDelete, getSpecificTrajectories } from '@/shared/helpers/hypothesisTableHelper.ts';
import { useTrajectoryDeletionLogic } from '@/hooks/useTrajectoryDeletionLogic.ts';
import { DbTrajectory, HypothesisRowData, StudyDTO } from '@/shared/types';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { renderHook } from '@testing-library/react';

vi.mock('@/shared/helpers/hypothesisTableHelper.ts', () => ({
  findSpecificTrajectoryToDelete: vi.fn(),
  getSpecificTrajectories: vi.fn(),
  shouldDeleteCapacityModulation: vi.fn(),
  collectTrajectoriesRecursively: vi.fn(),
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
