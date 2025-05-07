import { DbTrajectoryWithState, StudyActionType, StudyState, WarningMessage } from '@/shared/types';
import { STUDY_ACTION } from '@/shared/enum/study.ts';
import { TRAJECTORY_SELECTION_STATUS, TRAJECTORY_TYPE, WARNING_MESSAGE_LEVEL } from '@/shared/enum/trajectory.ts';
import { StudyStatus } from '@/shared/types/common/StudyStatus.type.ts';

const addTrajectories = (
  prevState: Partial<StudyState>,
  trajectories: DbTrajectoryWithState[],
): Partial<StudyState> => {
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
      prevState[type][0].messages.unshift(message);
    }
    if (message.level === WARNING_MESSAGE_LEVEL.WARNING_LEVEL) {
      const indexMessage = prevState[type][0].messages.findIndex(
        (item) => item.level === WARNING_MESSAGE_LEVEL.WARNING_LEVEL,
      );
      if (indexMessage < 0) {
        prevState[type][0].messages.push(message);
      } else {
        prevState[type][0].messages.splice(indexMessage, 0, message);
      }
    }
  }

  return prevState;
};

const deleteErrorMessage = (prevState: Partial<StudyState>, payload: TRAJECTORY_TYPE[]) => {
  payload.forEach((type) => {
    if (prevState?.[type]?.[0]?.state === TRAJECTORY_SELECTION_STATUS.ERROR) {
      Object.assign(prevState, { [`${type}`]: null });
    }
  });

  return { ...prevState };
};

const addLoadTrajectory = (prevState: Partial<StudyState>, payload: DbTrajectoryWithState): Partial<StudyState> => {
  const loadTrajectory = Array.isArray(prevState[`${TRAJECTORY_TYPE.LOAD}`])
    ? (prevState[`${TRAJECTORY_TYPE.LOAD}`] as DbTrajectoryWithState[])
    : null;

  if (loadTrajectory?.length) {
    const index = loadTrajectory.findIndex((trajectory) => trajectory.loadArea === payload.loadArea);
    if (index >= 0) {
      loadTrajectory.splice(index, 1, payload);
    }
  }
  return {
    ...prevState,
    [`${TRAJECTORY_TYPE.LOAD}`]: loadTrajectory?.length ? [...loadTrajectory, payload] : [payload],
  };
};

const deleteLoadTrajectory = (prevState: Partial<StudyState>, payload: string) => {
  const loadTrajectory = Array.isArray(prevState[`${TRAJECTORY_TYPE.LOAD}`])
    ? (prevState[`${TRAJECTORY_TYPE.LOAD}`] as DbTrajectoryWithState[])
    : null;
  if (loadTrajectory?.length) {
    const index = loadTrajectory.findIndex((trajectory) => trajectory.loadArea === payload);
    if (index >= 0) {
      loadTrajectory.splice(index, 1);
    }
    return {
      ...prevState,
      [`${TRAJECTORY_TYPE.LOAD}`]: [...loadTrajectory],
    };
  }
  return prevState;
};

export const studyReducer = (prevState: Partial<StudyState>, action?: StudyActionType): Partial<StudyState> => {
  if (action) {
    switch (action.type) {
      case STUDY_ACTION.SET_STUDY_STATUS:
        return { ...prevState, studyStatus: StudyStatus.GENERATED };
      case STUDY_ACTION.ADD_TRAJECTORY_AREA:
        return { ...prevState, [`${TRAJECTORY_TYPE.AREA}`]: [action.payload] };
      case STUDY_ACTION.ADD_TRAJECTORY_LINK:
        return { ...prevState, [`${TRAJECTORY_TYPE.LINK}`]: [action.payload] };
      case STUDY_ACTION.ADD_TRAJECTORY_LOAD:
        return addLoadTrajectory(prevState, action.payload);
      case STUDY_ACTION.CLEAR_AREA_TRAJECTORY:
        return {
          ...prevState,
          [`${TRAJECTORY_TYPE.AREA}`]: null,
          [`${TRAJECTORY_TYPE.LOAD}`]: null,
        };
      case STUDY_ACTION.CLEAR_LINK_TRAJECTORY:
        return { ...prevState, [`${TRAJECTORY_TYPE.LINK}`]: null };
      case STUDY_ACTION.DELETE_LOAD_TRAJECTORY:
        return deleteLoadTrajectory(prevState, action.payload);
      case STUDY_ACTION.CLEAR_AREA_AND_LINK_TRAJECTORY:
        return {
          ...prevState,
          [`${TRAJECTORY_TYPE.AREA}`]: null,
          [`${TRAJECTORY_TYPE.LINK}`]: null,
          [`${TRAJECTORY_TYPE.LOAD}`]: null,
        };
      case STUDY_ACTION.ADD_WARNING_MESSAGE:
        return { ...addMessage(prevState, action.payload) };
      case STUDY_ACTION.REMOVE_TRAJECTORY_ERROR:
        return { ...deleteErrorMessage(prevState, action.payload) };
      case STUDY_ACTION.ADD_TRAJECTORIES:
        return { ...addTrajectories(prevState, action.payload) };
      default:
        return prevState;
    }
  }

  return prevState;
};
