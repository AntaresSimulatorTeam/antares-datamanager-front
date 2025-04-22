import { DbTrajectory, RowStatus, WarningMessage } from '@/shared/types';
import { TRAJECTORY_SELECTION_STATUS, TRAJECTORY_TYPE, WARNING_MESSAGE_LEVEL } from '@/shared/enum/trajectory.ts';
import { FileInputStatus } from 'rte-design-system-react';

export const getTrajectoryDB = (trajectories: DbTrajectory[] | null, id: number) =>
  trajectories?.find((trajectory) => trajectory.id === id);

export const getStatus = (status: RowStatus) => {
  switch (status) {
    case 'error':
      return TRAJECTORY_SELECTION_STATUS.ERROR;
    case 'success':
      return TRAJECTORY_SELECTION_STATUS.OK;
    case 'warning':
      return TRAJECTORY_SELECTION_STATUS.WARNING;
    case 'empty':
    default:
      return TRAJECTORY_SELECTION_STATUS.MISSING;
  }
};

export const getBgColor = (status: FileInputStatus) => {
  switch (status) {
    case 'loading':
      return 'bg-acc1-600';
    case 'success':
    case 'error':
      return `bg-${status}-600`;
    case 'empty':
    default:
      return 'bg-gray-600';
  }
};

export const sortByLevel = (a: WarningMessage, b: WarningMessage): number => {
  const map: Map<WARNING_MESSAGE_LEVEL, number> = new Map();
  map.set(WARNING_MESSAGE_LEVEL.ERROR_LEVEL, 0);
  map.set(WARNING_MESSAGE_LEVEL.WARNING_LEVEL, 1);
  map.set(WARNING_MESSAGE_LEVEL.INFO_LEVEL, 2);
  map.set(WARNING_MESSAGE_LEVEL.FATAL_LEVEL, 3);

  if (map.get(a.level) !== undefined && map.get(b.level) !== undefined) {
    if (map.get(a.level)! < map.get(b.level)!) {
      return -1;
    }
    if (map.get(a.level)! > map.get(b.level)!) {
      return 1;
    }
  }
  return 0;
};

export const buildErrorTrajectory = (
  type: TRAJECTORY_TYPE,
  trajectoryId: number,
  trajectoryLabel: string,
  errorMessage?: string,
  userName?: string,
) => ({
  id: trajectoryId,
  trajectoryName: trajectoryLabel,
  type,
  version: null,
  userName: null,
  creationDate: null,
  messages: [
    {
      id: Math.floor(Math.random() * 10),
      content: errorMessage ?? 'Error',
      level: WARNING_MESSAGE_LEVEL.ERROR_LEVEL,
      code: 'ERROR',
      generatedBy: userName ?? '',
      generatedAt: new Date(),
      trajectory: trajectoryLabel,
      secondTrajectory: '',
    },
  ],
  state: TRAJECTORY_SELECTION_STATUS.ERROR,
});
