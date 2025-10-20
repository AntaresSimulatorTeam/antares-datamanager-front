import { TRAJECTORY_SELECTION_STATUS, TRAJECTORY_TYPE } from '@/shared/enum/trajectory';
import { computeReadOnlyState } from '@/shared/utils/computeReadOnlyState';
import { StudyStatus } from '@/shared/types/common/StudyStatus.type';
import { DbTrajectory } from '@/shared/types';

describe('computeReadOnlyState', () => {
  const dummyTrajectory: DbTrajectory = {
    id: 1,
    trajectoryName: 'test',
    type: TRAJECTORY_TYPE.AREA,
    version: 0,
    userName: '',
    creationDate: new Date(),
    technology: '',
  } as DbTrajectory;

  it('should disable Links (index 1) if no area trajectory', () => {
    const readOnly = computeReadOnlyState(null, TRAJECTORY_SELECTION_STATUS.OK, StudyStatus.IN_PROGRESS, true);
    expect(readOnly).toEqual({ '0': false, '1': true });
  });

  it('should disable Links if area status is ERROR', () => {
    const readOnly = computeReadOnlyState(
      dummyTrajectory,
      TRAJECTORY_SELECTION_STATUS.ERROR,
      StudyStatus.IN_PROGRESS,
      true,
    );
    expect(readOnly).toEqual({ '0': false, '1': true });
  });

  it('should disable Links if no link trajectory and study is GENERATED', () => {
    const readOnly = computeReadOnlyState(
      dummyTrajectory,
      TRAJECTORY_SELECTION_STATUS.OK,
      StudyStatus.GENERATED,
      false,
    );
    expect(readOnly).toEqual({ '0': false, '1': true });
  });

  it('should enable Links if area trajectory exists, no error, study is not GENERATED, and has link trajectory', () => {
    const readOnly = computeReadOnlyState(
      dummyTrajectory,
      TRAJECTORY_SELECTION_STATUS.OK,
      StudyStatus.IN_PROGRESS,
      true,
    );
    expect(readOnly).toEqual({ '0': false, '1': false });
  });
});
