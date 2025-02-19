import { StudyActionType, StudyState } from '@/shared/types';
import { STUDY_ACTION } from '@/shared/enum/study.ts';

export const studyReducer = (prevState: StudyState, action?: StudyActionType): StudyState => {
  if (action) {
    const { areaTrajectory, linkTrajectory } = prevState;
    switch (action.type) {
      case STUDY_ACTION.ADD_TRAJECTORY_AREA:
        return { areaTrajectory: action.payload, linkTrajectory };
      case STUDY_ACTION.ADD_TRAJECTORY_LINK:
        return { areaTrajectory, linkTrajectory: action.payload };
      default:
        return prevState;
    }
  }

  return prevState;
};
