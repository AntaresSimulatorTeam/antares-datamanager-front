import { DbTrajectory, StudyActionType, StudyState, WarningMessage } from '@/shared/types';
import { STUDY_ACTION } from '@/shared/enum/study.ts';
import { TRAJECTORY_TYPE, WARNING_MESSAGE_LEVEL } from '@/shared/enum/trajectory.ts';
import { StudyStatus } from '@/shared/types/common/StudyStatus.type.ts';

const addTrajectories = (prevState: Partial<StudyState>, trajectories: DbTrajectory[]): Partial<StudyState> => {
  const studyState = {};
  trajectories.forEach((trajectory) => Object.assign(studyState, { [`${trajectory?.type}`]: trajectory }));
  return { ...prevState, ...studyState };
};

export const addMessage = (
  prevState: Partial<StudyState>,
  payload: {
    message: WarningMessage;
    type: TRAJECTORY_TYPE;
  },
): Partial<StudyState> => {
  const { message, type } = payload;
  if (prevState[type]) {
    if (message.level === WARNING_MESSAGE_LEVEL.ERROR_LEVEL) {
      prevState[type].messages.unshift(message);
    }
    if (message.level === WARNING_MESSAGE_LEVEL.WARNING_LEVEL) {
      const indexMessage = prevState[type].messages.findIndex(
        (item) => item.level === WARNING_MESSAGE_LEVEL.WARNING_LEVEL,
      );
      if (indexMessage < 0) {
        prevState[type].messages.push(message);
      } else {
        prevState[type].messages.splice(indexMessage, 0, message);
      }
    }
  }

  return prevState;
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
      case STUDY_ACTION.ADD_WARNING_MESSAGE:
        return { ...addMessage(prevState, action.payload) };
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
