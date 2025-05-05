import { DbTrajectoryWithState, StudyActionType, StudyState } from '@/shared/types';
import { STUDY_ACTION } from '@/shared/enum/study.ts';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';

const addTrajectories = (
  prevState: Partial<StudyState>,
  trajectories: DbTrajectoryWithState[],
): Partial<StudyState> => {
  const studyState = {};
  trajectories.forEach((trajectory) => Object.assign(studyState, { [`${trajectory?.type}`]: trajectory }));
  return { ...prevState, ...studyState };
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

const deleteLoadTrajectory = (prevState: Partial<StudyState>, payload: number) => {
  const loadTrajectory = Array.isArray(prevState[`${TRAJECTORY_TYPE.LOAD}`])
    ? (prevState[`${TRAJECTORY_TYPE.LOAD}`] as DbTrajectoryWithState[])
    : null;
  if (loadTrajectory?.length) {
    const index = loadTrajectory.findIndex((trajectory) => trajectory.id === payload);
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
      case STUDY_ACTION.ADD_TRAJECTORY_AREA:
        return { ...prevState, [`${TRAJECTORY_TYPE.AREA}`]: action.payload };
      case STUDY_ACTION.ADD_TRAJECTORY_LINK:
        return { ...prevState, [`${TRAJECTORY_TYPE.LINK}`]: action.payload };
      case STUDY_ACTION.ADD_TRAJECTORY_LOAD:
        return addLoadTrajectory(prevState, action.payload);
      case STUDY_ACTION.CLEAR_AREA_TRAJECTORY:
        return {
          ...prevState,
          [`${TRAJECTORY_TYPE.AREA}`]: null,
        };
      case STUDY_ACTION.CLEAR_LINK_TRAJECTORY:
        return { ...prevState, [`${TRAJECTORY_TYPE.LINK}`]: null };
      case STUDY_ACTION.DELETE_LOAD_TRAJECTORY:
        return deleteLoadTrajectory(prevState, action.payload);
      case STUDY_ACTION.CLEAR_AREA_AND_LINK_TRAJECTORY:
        return { ...prevState, [`${TRAJECTORY_TYPE.AREA}`]: null, [`${TRAJECTORY_TYPE.LINK}`]: null };
      case STUDY_ACTION.SET_STUDY_STATUS:
        return { ...prevState, studyStatus: action.payload };
      case STUDY_ACTION.ADD_TRAJECTORIES:
        return { ...addTrajectories(prevState, action.payload) };
      default:
        return prevState;
    }
  }

  return prevState;
};
