import { DbTrajectory, RowStatus, StudyActionType, StudyState, StudyTrajectoriesData } from '@/shared/types';
import { STUDY_ACTION } from '@/shared/enum/study.ts';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { StudyStatus } from '@/shared/types/common/StudyStatus.type.ts';
import { isMatchingTrajectoryType, isUniqueTrajectoryType, normalize, removeDuplicateByTechnology } from '@/shared/utils/trajectoryUtils.ts';

export const addTrajectories = (prevState: Partial<StudyState>, data: StudyTrajectoriesData): Partial<StudyState> => {
  const studyState: Partial<StudyState> = { ...prevState };
  (Object.keys(data) as TRAJECTORY_TYPE[]).forEach((keyType: TRAJECTORY_TYPE) => {
    if (keyType === TRAJECTORY_TYPE.AREA || keyType === TRAJECTORY_TYPE.LINK) {
      Object.assign(studyState, { [keyType]: data[keyType] });
    } else if (Array.isArray(data[keyType]?.trajectories)) {
      const newTrajectories = [...(prevState[keyType]?.trajectories ?? []), ...(data[keyType]?.trajectories ?? [])];
      Object.assign(studyState, {
        [keyType]: {
          trajectories: removeDuplicateByTechnology(newTrajectories),
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
  if (type === TRAJECTORY_TYPE.AREA || type === TRAJECTORY_TYPE.LINK) {
    Object.assign(prevState, { [type]: { trajectories: [] } });
  } else {
    const newTrajectories = (trajectories ?? []).filter((trajectory) => trajectory.area !== area);
    const newStudyState = {
      ...prevState[`${type}`],
      trajectories: newTrajectories,
    };
    const shouldUpdateParam =
      type === TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER &&
      newTrajectories.every((traj) => !traj.trajectoryName);

    Object.assign(prevState, {
      [type]: newStudyState,
      ...(shouldUpdateParam && {
        [TRAJECTORY_TYPE.THERMAL_TECHNICAL_MODULATION_PARAMETER]: {
          trajectories:
            prevState[TRAJECTORY_TYPE.THERMAL_TECHNICAL_MODULATION_PARAMETER]?.trajectories.map((trajectoryDb) => ({
              ...trajectoryDb,
              trajectoryName: '',
            })) ?? [],
        },
      }),
    });
  }
  return prevState;
};

export const updateTrajectory = (
  prevState: Partial<StudyState>,
  payload: { trajectory: DbTrajectory; status: RowStatus },
) => {
  const { trajectory, status } = payload;
  const trajectoryType = trajectory.type;
  const trajectories = Array.isArray(prevState[`${trajectoryType}`]?.trajectories)
    ? (prevState[`${trajectoryType}`]?.trajectories as DbTrajectory[])
    : [];

  const alreadyExists = isUniqueTrajectoryType(trajectoryType)
    ? trajectories.some((item) => item.type === trajectoryType)
    : trajectories.some(
        (item) =>
          normalize(item.area ?? '') === normalize(trajectory.area ?? '') &&
          normalize(item.technology) === normalize(trajectory.technology),
      );

  let newTrajectories: DbTrajectory[];

  if (alreadyExists) {
    newTrajectories = trajectories.map((trajectoryDb) => {
      const sameArea = normalize(trajectoryDb.area ?? '') === normalize(trajectory.area ?? '');
      const sameTech = normalize(trajectoryDb.technology ?? '') === normalize(trajectory.technology ?? '');
      const sameType = trajectoryDb.type === trajectory.type;
      const isMatch = isUniqueTrajectoryType(trajectoryType) ? sameType : sameArea && sameTech && sameType;

      if (isMatch) {
        if (trajectoryDb.id === trajectory.id) {
          return {
            ...trajectoryDb,
            trajectoryName: status === 'success' ? trajectory.trajectoryName : '',
          };
        }
        return trajectory;
      }

      return trajectoryDb;
    });
  } else {
    if (trajectoryType === TRAJECTORY_TYPE.AREA || trajectoryType === TRAJECTORY_TYPE.LINK) {
      newTrajectories = [trajectory];
    } else {
      newTrajectories = removeDuplicateByTechnology([...trajectories, trajectory]);
    }
  }

  const isMultipleUpdate =
    trajectoryType === TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER &&
    newTrajectories.every((traj) => !traj.trajectoryName);

  const newStudyState = {
    ...prevState[`${trajectoryType}`],
    trajectories: newTrajectories,
  };

  return {
    ...prevState,
    hvdc: trajectoryType === TRAJECTORY_TYPE.LINK && status === 'empty' ? false : prevState.hvdc,
    [trajectoryType]: newStudyState,
    ...(isMultipleUpdate && {
      [TRAJECTORY_TYPE.THERMAL_TECHNICAL_MODULATION_PARAMETER]: {
        trajectories:
          prevState[TRAJECTORY_TYPE.THERMAL_TECHNICAL_MODULATION_PARAMETER]?.trajectories.map((trajectoryDb) => ({
            ...trajectoryDb,
            trajectoryName: '',
          })) ?? [],
      },
    }),
  };
};

export const skipWarningMessage = (
  prevState: Partial<StudyState>,
  payload: {
    discardActionTriggered: boolean;
  },
): Partial<StudyState> => ({
  ...prevState,
  discardActionTriggered: payload.discardActionTriggered,
});

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
        };
        Object.assign(studyState, { [trajectoryKey]: newStudyState });
      }
    });
    return studyState;
  }

  return prevState;
};

export const updateHvdcOption = (prevState: Partial<StudyState>, payload: boolean): Partial<StudyState> => ({
  ...prevState,
  hvdc: payload,
});

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
      case STUDY_ACTION.RESET_STUDY_STATE:
        return { studyStatus: StudyStatus.IN_PROGRESS };
      case STUDY_ACTION.SET_STUDY_AREAS:
        return { ...prevState, areas: action.payload.areas ?? [], defaultAreas: action.payload.defaultAreas ?? [] };
      default:
        return prevState;
    }
  }

  return prevState;
};
