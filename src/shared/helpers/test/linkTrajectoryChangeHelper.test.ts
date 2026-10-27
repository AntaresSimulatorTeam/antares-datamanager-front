import { describe, expect, it, vi } from 'vitest';
import { TRAJECTORY_SELECTION_STATUS, TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { DbTrajectory, HypothesisRowData } from '@/shared/types';
import {
  hasSelectedFlowbasedTrajectory,
  performLinkTrajectoryChange,
} from '@/shared/helpers/linkTrajectoryChangeHelper.ts';

const linkTrajectory = { id: 17, type: TRAJECTORY_TYPE.LINK } as DbTrajectory;
const flowbasedTrajectory = { id: 29, type: TRAJECTORY_TYPE.FLOWBASED } as DbTrajectory;
const replacement = { id: 31, type: TRAJECTORY_TYPE.LINK } as DbTrajectory;

const flowbasedRow = (status: TRAJECTORY_SELECTION_STATUS): HypothesisRowData => ({
  hypothesis: 'Flowbased',
  trajectory: flowbasedTrajectory,
  status,
});

const createDependencies = () => ({
  detach: vi.fn().mockResolvedValue(undefined),
  resetStudyOptions: vi.fn().mockResolvedValue(undefined),
  associate: vi.fn().mockResolvedValue(replacement),
  onDetached: vi.fn(),
  onAssociationSucceeded: vi.fn(),
  onStudyOptionsResetError: vi.fn(),
});

describe('linkTrajectoryChangeHelper', () => {
  it('recognizes selected Flowbased trajectories, including warning status', () => {
    expect(hasSelectedFlowbasedTrajectory(flowbasedRow(TRAJECTORY_SELECTION_STATUS.OK))).toBe(true);
    expect(hasSelectedFlowbasedTrajectory(flowbasedRow(TRAJECTORY_SELECTION_STATUS.WARNING))).toBe(true);
    expect(hasSelectedFlowbasedTrajectory(flowbasedRow(TRAJECTORY_SELECTION_STATUS.MISSING))).toBe(false);
  });

  it('detaches only LINK for deletion when Flowbased is not selected', async () => {
    const dependencies = createDependencies();

    await performLinkTrajectoryChange({
      studyId: 5,
      linkTrajectory,
      detach: dependencies.detach,
      resetStudyOptions: dependencies.resetStudyOptions,
      associate: dependencies.associate,
      onDetached: dependencies.onDetached,
      onAssociationSucceeded: dependencies.onAssociationSucceeded,
      onStudyOptionsResetError: dependencies.onStudyOptionsResetError,
    });

    expect(dependencies.detach).toHaveBeenCalledWith(5, [17]);
    expect(dependencies.resetStudyOptions).toHaveBeenCalledWith(5, false);
    expect(dependencies.onDetached).toHaveBeenCalledOnce();
    expect(dependencies.associate).not.toHaveBeenCalled();
  });

  it('detaches LINK and Flowbased before associating a replacement', async () => {
    const dependencies = createDependencies();

    await performLinkTrajectoryChange({
      studyId: 5,
      linkTrajectory,
      flowbasedTrajectory,
      replacement,
      detach: dependencies.detach,
      resetStudyOptions: dependencies.resetStudyOptions,
      associate: dependencies.associate,
      onDetached: dependencies.onDetached,
      onAssociationSucceeded: dependencies.onAssociationSucceeded,
      onStudyOptionsResetError: dependencies.onStudyOptionsResetError,
    });

    expect(dependencies.detach).toHaveBeenCalledWith(5, [17, 29]);
    expect(dependencies.onDetached).toHaveBeenCalledOnce();
    expect(dependencies.associate).toHaveBeenCalledWith(5, replacement);
    expect(dependencies.onAssociationSucceeded).toHaveBeenCalledWith(replacement);
  });

  it('does not clear local state or associate a replacement when batch detach fails', async () => {
    const dependencies = createDependencies();
    dependencies.detach.mockRejectedValue(new Error('batch failed'));

    await expect(
      performLinkTrajectoryChange({
        studyId: 5,
        linkTrajectory,
        flowbasedTrajectory,
        replacement,
        detach: dependencies.detach,
        resetStudyOptions: dependencies.resetStudyOptions,
        associate: dependencies.associate,
        onDetached: dependencies.onDetached,
        onAssociationSucceeded: dependencies.onAssociationSucceeded,
        onStudyOptionsResetError: dependencies.onStudyOptionsResetError,
      }),
    ).rejects.toThrow('batch failed');

    expect(dependencies.onDetached).not.toHaveBeenCalled();
    expect(dependencies.resetStudyOptions).not.toHaveBeenCalled();
    expect(dependencies.associate).not.toHaveBeenCalled();
  });

  it('keeps LINK and Flowbased detached when replacement association fails', async () => {
    const dependencies = createDependencies();
    dependencies.associate.mockRejectedValue(new Error('association failed'));

    await expect(
      performLinkTrajectoryChange({
        studyId: 5,
        linkTrajectory,
        flowbasedTrajectory,
        replacement,
        detach: dependencies.detach,
        resetStudyOptions: dependencies.resetStudyOptions,
        associate: dependencies.associate,
        onDetached: dependencies.onDetached,
        onAssociationSucceeded: dependencies.onAssociationSucceeded,
        onStudyOptionsResetError: dependencies.onStudyOptionsResetError,
      }),
    ).rejects.toThrow('association failed');

    expect(dependencies.onDetached).toHaveBeenCalledOnce();
    expect(dependencies.onAssociationSucceeded).not.toHaveBeenCalled();
  });

  it('continues replacement after reporting a study options reset error', async () => {
    const dependencies = createDependencies();
    dependencies.resetStudyOptions.mockRejectedValue(new Error('reset failed'));

    await performLinkTrajectoryChange({
      studyId: 5,
      linkTrajectory,
      flowbasedTrajectory,
      replacement,
      detach: dependencies.detach,
      resetStudyOptions: dependencies.resetStudyOptions,
      associate: dependencies.associate,
      onDetached: dependencies.onDetached,
      onAssociationSucceeded: dependencies.onAssociationSucceeded,
      onStudyOptionsResetError: dependencies.onStudyOptionsResetError,
    });

    expect(dependencies.onStudyOptionsResetError).toHaveBeenCalledWith(expect.any(Error));
    expect(dependencies.associate).toHaveBeenCalledOnce();
  });
});
