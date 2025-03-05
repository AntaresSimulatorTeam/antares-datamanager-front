import { DbTrajectory, StudyActionType, StudyState } from '@/shared/types';
import { STUDY_ACTION } from '@/shared/enum/study.ts';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';

const addTrajectories = (prevState: StudyState, trajectories: DbTrajectory[]): StudyState => {
  const studyState = {};
  trajectories.forEach((trajectory) => Object.assign(studyState, { [`${trajectory.type}`]: trajectory }));
  console.log('addTrajectories', { ...prevState, ...studyState });
  return { ...prevState, ...studyState };
};

export const studyReducer = (prevState: StudyState, action?: StudyActionType): StudyState => {
  if (action) {
    switch (action.type) {
      case STUDY_ACTION.ADD_TRAJECTORY_AREA:
        return { ...prevState, [`${TRAJECTORY_TYPE.AREA}`]: action.payload };
      case STUDY_ACTION.ADD_TRAJECTORY_LINK:
        return { ...prevState, [`${TRAJECTORY_TYPE.LINK}`]: action.payload };
      case STUDY_ACTION.CLEAR_AREA_LINK_TRAJECTORY:
        return {
          ...prevState,
          isStudyGenerated: false,
          [`${TRAJECTORY_TYPE.AREA}`]: null,
          [`${TRAJECTORY_TYPE.LINK}`]: null,
        };
      case STUDY_ACTION.CLEAR_LINK_TRAJECTORY:
        return { ...prevState, isStudyGenerated: false, [`${TRAJECTORY_TYPE.LINK}`]: null };
      case STUDY_ACTION.SET_IS_STUDY_GENERATED:
        return { ...prevState, isStudyGenerated: true };
      case STUDY_ACTION.ADD_TRAJECTORIES:
        console.log('========================== addTrajectories', { ...addTrajectories(prevState, action.payload) });
        return { ...addTrajectories(prevState, action.payload) };
      default:
        return prevState;
    }
  }

  return prevState;
};
