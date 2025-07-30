import {
  DbTrajectory,
  FileInputStatus,
  StudyActionType,
  StudyState,
  StudyTrajectoriesData,
  WarningMessage,
} from '@/shared/types';
import { STUDY_ACTION } from '@/shared/enum/study.ts';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { StudyStatus } from '@/shared/types/common/StudyStatus.type.ts';
import { isMatchingTrajectoryType, removeDuplicate, removeDuplicateById } from '@/shared/utils/trajectoryUtils.ts';

export const addTrajectories = (prevState: Partial<StudyState>, data: StudyTrajectoriesData): Partial<StudyState> => {
  const studyState: Partial<StudyState> = { ...prevState };
  (Object.keys(data) as TRAJECTORY_TYPE[]).forEach((keyType: TRAJECTORY_TYPE) => {
    if (keyType === TRAJECTORY_TYPE.AREA || keyType === TRAJECTORY_TYPE.LINK) {
      Object.assign(studyState, { [keyType]: data[keyType] });
    } else {
      const newTrajectories = prevState[keyType]?.trajectories
        ? [...(prevState[keyType]?.trajectories ?? []), ...(data[keyType]?.trajectories ?? [])]
        : (data[keyType]?.trajectories ?? []);
      const newWarningMessages = prevState[keyType]?.warningMessages
        ? [...(prevState[keyType]?.warningMessages ?? []), ...(data[keyType]?.warningMessages ?? [])]
        : (data[keyType]?.warningMessages ?? []);
      Object.assign(studyState, {
        [keyType]: {
          trajectories: removeDuplicate(newTrajectories),
          warningMessages: removeDuplicateById(newWarningMessages),
        },
      });
    }
  });

  return studyState;
};

export const deleteTrajectory = (prevState: Partial<StudyState>, payload: { area: string; type: TRAJECTORY_TYPE }) => {
  const { area, type } = payload;
  const trajectories = Array.isArray(prevState[`${type}`]?.trajectories)
    ? (prevState[`${payload.type}`]?.trajectories as DbTrajectory[])
    : null;
  const warningMessages = Array.isArray(prevState[`${type}`]?.warningMessages)
    ? (prevState[`${payload.type}`]?.warningMessages as WarningMessage[])
    : null;
  if (type === TRAJECTORY_TYPE.AREA || type === TRAJECTORY_TYPE.LINK) {
    Object.assign(prevState, { [type]: { trajectories: [], warningMessages: [] } });
  } else {
    const trajectoryId = (trajectories ?? []).find((trajectory) => trajectory.loadArea === area)?.id;
    const newTrajectories = (trajectories ?? []).filter((trajectory) => trajectory.id !== trajectoryId);
    const newWarningMessages = (warningMessages ?? []).filter((message) => message.trajectoryId !== trajectoryId);
    const newStudyState = {
      ...prevState[`${type}`],
      trajectories: newTrajectories,
      warningMessages: newWarningMessages,
    };
    Object.assign(prevState, { [type]: newStudyState });
  }
  return prevState;
};

export const updateTrajectory = (
  prevState: Partial<StudyState>,
  payload: { trajectory: DbTrajectory; status: FileInputStatus },
) => {
  const { trajectory, status } = payload;
  const trajectoryType = trajectory.type;
  const trajectories = Array.isArray(prevState[`${trajectoryType}`]?.trajectories)
    ? (prevState[`${trajectoryType}`]?.trajectories as DbTrajectory[])
    : null;
  if (trajectories?.length) {
    const newTrajectories = trajectories.map((trajectoryDb) => {
      if (trajectoryDb.loadArea === trajectory.loadArea) {
        return {
          ...trajectoryDb,
          trajectoryName: status === 'success' ? trajectory.trajectoryName : '',
        };
      } else {
        return trajectoryDb;
      }
    });
    const warningMessages = Array.isArray(prevState[`${trajectory.type}`]?.warningMessages)
      ? (prevState[`${trajectory.type}`]?.warningMessages as WarningMessage[])
      : null;

    const newStudyState = {
      ...prevState[`${trajectoryType}`],
      trajectories: newTrajectories,
      warningMessages: (warningMessages ?? []).filter((message) => message.trajectoryId !== trajectory.id),
    };

    return {
      ...prevState,
      [trajectoryType]: newStudyState,
    };
  }

  return prevState;
};

export const skipWarningMessage = (
  prevState: Partial<StudyState>,
  payload: {
    trajectoryType: TRAJECTORY_TYPE;
    warningMessages: WarningMessage[];
  },
): Partial<StudyState> => {
  const { trajectoryType, warningMessages } = payload;

  if (!Array.isArray(prevState[`${trajectoryType}`]?.warningMessages)) return prevState;

  return {
    ...prevState,
    [trajectoryType]: {
      trajectories: prevState[trajectoryType]?.trajectories,
      warningMessages,
    },
  };
};

export const clearByType = (prevState: Partial<StudyState>, payload: TRAJECTORY_TYPE[]) => {
  const studyState: Partial<StudyState> = { ...prevState };
  const stateKeys = Object.keys(prevState);
  if (stateKeys.length > 0 && payload.length > 0) {
    stateKeys.forEach((key) => {
      const trajectoryKey = key as TRAJECTORY_TYPE;
      if (payload.some(isMatchingTrajectoryType(trajectoryKey))) {
        const newStudyState = {
          ...prevState[`${trajectoryKey}`],
          trajectories: [],
          warningMessages: [],
        };
        Object.assign(studyState, { [trajectoryKey]: newStudyState });
      }
    });
    return studyState;
  }

  return prevState;
};

export const studyReducer = (prevState: Partial<StudyState>, action?: StudyActionType): Partial<StudyState> => {
  if (action) {
    switch (action.type) {
      case STUDY_ACTION.SET_STUDY_STATUS:
        return { ...prevState, studyStatus: StudyStatus.GENERATED };
      case STUDY_ACTION.ADD_TRAJECTORIES:
        return { ...addTrajectories(prevState, action.payload) };
      case STUDY_ACTION.DELETE_TRAJECTORY:
        return { ...deleteTrajectory(prevState, action.payload) };
      case STUDY_ACTION.UPDATE_TRAJECTORY:
        return { ...updateTrajectory(prevState, action.payload) };
      case STUDY_ACTION.SKIP_MESSAGE:
        return { ...skipWarningMessage(prevState, action.payload) };
      case STUDY_ACTION.CLEAR_TRAJECTORY_BY_TYPE:
        return { ...clearByType(prevState, action.payload) };
      default:
        return prevState;
    }
  }

  return prevState;
};
