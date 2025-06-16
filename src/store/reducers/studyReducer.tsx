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

const updateLoadTrajectory = (
  prevState: Partial<StudyState>,
  payload: { loadArea: string; trajectoryName: string },
) => {
  const loadTrajectory = Array.isArray(prevState[`${TRAJECTORY_TYPE.LOAD}`])
    ? (prevState[`${TRAJECTORY_TYPE.LOAD}`] as DbTrajectory[])
    : null;
  if (loadTrajectory?.length) {
    const newLoadTrajectories = loadTrajectory.map((trajectory) => {
      if (trajectory.loadArea === payload.loadArea) {
        return {
          ...trajectory,
          trajectoryName: payload.trajectoryName,
        };
      } else {
        return trajectory;
      }
    });

    return {
      ...prevState,
      [`${TRAJECTORY_TYPE.LOAD}`]: [...newLoadTrajectories],
    };
  }

  return prevState;
};

const emptyLoadTrajectory = (prevState: Partial<StudyState>, payload: string) => {
  const loadTrajectory = Array.isArray(prevState[`${TRAJECTORY_TYPE.LOAD}`])
    ? (prevState[`${TRAJECTORY_TYPE.LOAD}`] as DbTrajectory[])
    : null;
  if (loadTrajectory?.length) {
    const newLoadTrajectories = loadTrajectory.map((trajectory) => {
      if (trajectory.loadArea === payload) {
        return {
          ...trajectory,
          trajectoryName: '',
        };
      } else {
        return trajectory;
      }
    });

    return {
      ...prevState,
      [`${TRAJECTORY_TYPE.LOAD}`]: [...newLoadTrajectories],
    };
  }

  return prevState;
};

export const skipTrajectoryMessage = (
  prevState: Partial<StudyState>,
  payload: {
    id: number;
    trajectoryType: TRAJECTORY_TYPE;
    trajectoryId: number;
  },
): Partial<StudyState> => {
  const { id, trajectoryType, trajectoryId } = payload;
  const trajectories = prevState[trajectoryType];

  if (!Array.isArray(trajectories)) return prevState;

  const trajectoryIndex = trajectories.findIndex((t) => t.id === trajectoryId);
  if (trajectoryIndex < 0) return prevState;

  const trajectory = trajectories[trajectoryIndex];
  const messages = trajectory.messages || [];

  const messageIndex = messages.findIndex((m) => m.id === id);
  if (messageIndex < 0) return prevState;

  const skippedMessage = {
    ...messages[messageIndex],
    isAck: true,
  };

  const newMessages = [...messages];
  newMessages.splice(messageIndex, 1);
  newMessages.push(skippedMessage);

  const newTrajectory = {
    ...trajectory,
    messages: newMessages,
  };

  const newTrajectoryArray = [...trajectories];
  newTrajectoryArray[trajectoryIndex] = newTrajectory;

  return {
    ...prevState,
    [trajectoryType]: newTrajectoryArray,
  };
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
      case STUDY_ACTION.UPDATE_LOAD_TRAJECTORY:
        return updateLoadTrajectory(prevState, action.payload);
      case STUDY_ACTION.EMPTY_LOAD_TRAJECTORY:
        return emptyLoadTrajectory(prevState, action.payload);
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
