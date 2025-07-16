import { DbTrajectory, FileInputStatus, StudyActionType, StudyState } from '@/shared/types';
import { STUDY_ACTION } from '@/shared/enum/study.ts';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { StudyStatus } from '@/shared/types/common/StudyStatus.type.ts';
import { isMatchingTrajectoryType, removeDuplicate } from '@/shared/utils/trajectoryUtils.ts';

export const addTrajectories = (prevState: Partial<StudyState>, trajectories: DbTrajectory[]): Partial<StudyState> => {
  const studyState: Partial<StudyState> = { ...prevState };
  trajectories.forEach((trajectory) => {
    const type = trajectory.type;
    const existing = Array.isArray(studyState[type]) ? studyState[type] : [];
    Object.assign(studyState, { [`${trajectory.type}`]: removeDuplicate([trajectory, ...existing]) });
  });

  return studyState;
};

export const deleteTrajectory = (prevState: Partial<StudyState>, payload: { area: string; type: TRAJECTORY_TYPE }) => {
  const loadTrajectory = Array.isArray(prevState[`${payload.type}`])
    ? (prevState[`${payload.type}`] as DbTrajectory[])
    : null;
  if (loadTrajectory?.length) {
    const newLoadTrajectory = loadTrajectory.filter((trajectory) => trajectory.loadArea !== payload.area);
    return {
      ...prevState,
      [`${payload.type}`]: [...newLoadTrajectory],
    };
  }
  return prevState;
};

export const updateTrajectory = (
  prevState: Partial<StudyState>,
  payload: { trajectory: DbTrajectory; status: FileInputStatus },
) => {
  const { trajectory, status } = payload;
  const trajectoryType = trajectory.type;
  const loadTrajectory = Array.isArray(prevState[`${trajectoryType}`])
    ? (prevState[`${trajectoryType}`] as DbTrajectory[])
    : null;
  if (loadTrajectory?.length) {
    const newLoadTrajectories = loadTrajectory.map((trajectoryDb) => {
      if (trajectoryDb.loadArea === trajectory.loadArea) {
        return {
          ...trajectoryDb,
          trajectoryName: status === 'success' ? trajectory.trajectoryName : '',
          messages: status === 'success' ? trajectory.messages : [],
        };
      } else {
        return trajectoryDb;
      }
    });

    return {
      ...prevState,
      [`${trajectoryType}`]: [...newLoadTrajectories],
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

export const clearByType = (prevState: Partial<StudyState>, payload: TRAJECTORY_TYPE[]) => {
  const studyState: Partial<StudyState> = { ...prevState };
  Object.keys(prevState).forEach((key) => {
    const trajectoryKey = key as TRAJECTORY_TYPE;
    if (payload.some(isMatchingTrajectoryType(trajectoryKey))) {
      Object.assign(studyState, { [trajectoryKey]: null });
    }
  });
  return studyState;
};

export const studyReducer = (prevState: Partial<StudyState>, action?: StudyActionType): Partial<StudyState> => {
  if (action) {
    switch (action.type) {
      case STUDY_ACTION.SET_STUDY_STATUS:
        return { ...prevState, studyStatus: StudyStatus.GENERATED };
      case STUDY_ACTION.CLEAR_TRAJECTORY_BY_TYPE:
        return { ...clearByType(prevState, action.payload) };
      case STUDY_ACTION.ADD_TRAJECTORIES:
        return { ...addTrajectories(prevState, action.payload) };
      case STUDY_ACTION.DELETE_TRAJECTORY:
        return { ...deleteTrajectory(prevState, action.payload) };
      case STUDY_ACTION.UPDATE_TRAJECTORY:
        return { ...updateTrajectory(prevState, action.payload) };
      case STUDY_ACTION.SKIP_MESSAGE:
        return { ...skipTrajectoryMessage(prevState, action.payload) };
      default:
        return prevState;
    }
  }

  return prevState;
};
