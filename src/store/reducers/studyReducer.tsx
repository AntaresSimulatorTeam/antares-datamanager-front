import { DbTrajectory, StudyActionType, StudyState } from '@/shared/types';
import { STUDY_ACTION } from '@/shared/enum/study.ts';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { StudyStatus } from '@/shared/types/common/StudyStatus.type.ts';

const addAreaTrajectories = (prevState: Partial<StudyState>, trajectories: DbTrajectory[]) => {
  const studyState = {};
  trajectories.forEach((trajectory) => {
    if (trajectory?.type === TRAJECTORY_TYPE.AREA) {
      Object.assign(studyState, { [`${trajectory?.type}`]: [trajectory] });
    } else if (trajectory?.type === TRAJECTORY_TYPE.LINK) {
      Object.assign(studyState, { [`${trajectory?.type}`]: [trajectory] });
    } else if (
      !trajectories.some((traj) => traj.type === TRAJECTORY_TYPE.AREA) ||
      !trajectories.some((traj) => traj.type === TRAJECTORY_TYPE.LINK)
    ) {
      Object.assign(studyState, { [`${trajectory?.type}`]: null });
    }
  });
  return { ...prevState, ...studyState };
};

const addTrajectories = (prevState: Partial<StudyState>, trajectories: DbTrajectory[]): Partial<StudyState> => {
  const studyState = {};
  trajectories.forEach((trajectory) => Object.assign(studyState, { [`${trajectory?.type}`]: [trajectory] }));
  return { ...prevState, ...studyState };
};

const addLoadTrajectory = (prevState: Partial<StudyState>, payload: DbTrajectory): Partial<StudyState> => {
  const loadTrajectory = Array.isArray(prevState[`${TRAJECTORY_TYPE.LOAD}`])
    ? (prevState[`${TRAJECTORY_TYPE.LOAD}`] as DbTrajectory[])
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
    ? (prevState[`${TRAJECTORY_TYPE.LOAD}`] as DbTrajectory[])
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

const skipTrajectoryMessage = (
  prevState: Partial<StudyState>,
  payload: {
    id: number;
    trajectoryType: TRAJECTORY_TYPE;
    trajectoryId: number;
  },
) => {
  const { id, trajectoryType, trajectoryId } = payload;
  let trajectoryIndex = 0;
  // @ts-ignore
  if (prevState?.[`${trajectoryType}`]?.length >= 1) {
    trajectoryIndex = prevState[`${trajectoryType}`]?.findIndex(
      (trajectory) => trajectory.id === trajectoryId,
    ) as number;
    if (trajectoryIndex >= 0) {
      const messageSkippedIndex = prevState[`${trajectoryType}`]?.[trajectoryIndex]?.messages.findIndex(
        (message) => message.id === id,
      );
      if (messageSkippedIndex && messageSkippedIndex >= 0) {
        const messageSkipped = prevState[`${trajectoryType}`]?.[trajectoryIndex]?.messages[messageSkippedIndex];
        const messages = prevState[`${trajectoryType}`]?.[trajectoryIndex]?.messages;
        console.log('==================== messageSkipped', messageSkipped);
        if (messages && messages.length > 0 && messageSkipped) {
          const messageIndex = messages.findIndex(
            (message) => message.isAck && message.generatedAt.getTime() < messageSkipped.generatedAt.getTime(),
          );
          // Remove message skipped
          prevState[`${trajectoryType}`]?.[trajectoryIndex]?.messages.splice(messageSkippedIndex, 1);
          if (messageIndex >= 0 && messageSkipped) {
            // Add skipped message at the end position
            prevState[`${trajectoryType}`]?.[trajectoryIndex]?.messages.splice(messageIndex, 0, messageSkipped);
          }
        }
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
      case STUDY_ACTION.ADD_TRAJECTORIES:
        return { ...addTrajectories(prevState, action.payload) };
      case STUDY_ACTION.ADD_AREA_TRAJECTORIES:
        return { ...addAreaTrajectories(prevState, action.payload) };
      case STUDY_ACTION.SKIP_MESSAGE:
        return { ...skipTrajectoryMessage(prevState, action.payload) };
      default:
        return prevState;
    }
  }

  return prevState;
};
