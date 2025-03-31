import { DbTrajectory, StudyActionType, StudyState, WarningMessage } from '@/shared/types';
import { STUDY_ACTION } from '@/shared/enum/study.ts';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { StudyStatus } from '@/shared/types/common/StudyStatus.type.ts';
import { sortByLevel } from '@/shared/utils/trajectoryUtils.ts';

const addTrajectories = (prevState: Partial<StudyState>, trajectories: DbTrajectory[]): Partial<StudyState> => {
  const studyState = {};
  trajectories.forEach((trajectory) => Object.assign(studyState, { [`${trajectory?.type}`]: trajectory }));

  const messages: WarningMessage[] = trajectories
    .flatMap((trajectory) => (trajectory?.messages.length > 0 ? trajectory.messages : null))
    .filter((f) => f != null);

  if (messages.length > 0) {
    messages.sort(sortByLevel);
    return { ...prevState, ...studyState, messages };
  } else {
    return { ...prevState, ...studyState };
  }
};

export const studyReducer = (prevState: Partial<StudyState>, action?: StudyActionType): Partial<StudyState> => {
  if (action) {
    switch (action.type) {
      case STUDY_ACTION.SET_STUDY_STATUS:
        return { ...prevState, studyStatus: StudyStatus.GENERATED };
      case STUDY_ACTION.ADD_TRAJECTORY_AREA:
        return { ...prevState, [`${TRAJECTORY_TYPE.AREA}`]: action.payload };
      case STUDY_ACTION.ADD_TRAJECTORY_LINK:
        return { ...prevState, [`${TRAJECTORY_TYPE.LINK}`]: action.payload };
      case STUDY_ACTION.ADD_TRAJECTORIES:
        return { ...addTrajectories(prevState, action.payload) };
      case STUDY_ACTION.CLEAR_AREA_TRAJECTORY:
        return { ...prevState, [`${TRAJECTORY_TYPE.AREA}`]: null };
      case STUDY_ACTION.CLEAR_LINK_TRAJECTORY:
        return { ...prevState, [`${TRAJECTORY_TYPE.LINK}`]: null };
      case STUDY_ACTION.CLEAR_AREA_AND_LINK_TRAJECTORY:
        return { ...prevState, [`${TRAJECTORY_TYPE.AREA}`]: null, [`${TRAJECTORY_TYPE.LINK}`]: null };
      default:
        return prevState;
    }
  }

  return prevState;
};
