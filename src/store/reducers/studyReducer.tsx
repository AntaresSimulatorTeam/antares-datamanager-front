import { StudyActionType, StudyState } from '@/shared/types';
import { STUDY_ACTION } from '@/shared/enum/study.ts';

export const studyReducer = (prevState: StudyState, action?: StudyActionType): StudyState => {
  if (action) {
    switch (action.type) {
      case STUDY_ACTION.ADD_TRAJECTORY_AREA:
        return { ...prevState, areaTrajectory: action.payload };
      case STUDY_ACTION.ADD_TRAJECTORY_LINK:
        return { ...prevState, linkTrajectory: action.payload };
      case STUDY_ACTION.CLEAR_AREA_LINK_TRAJECTORY:
        return { isStudyGenerated: false, areaTrajectory: null, linkTrajectory: null };
      case STUDY_ACTION.SET_IS_STUDY_GENERATED:
        return { ...prevState, isStudyGenerated: true };
      default:
        return prevState;
    }
  }

  return prevState;
};
