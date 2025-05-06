import { AreaAndLinkRowData, DbTrajectory, RowStatus } from '@/shared/types';
import { TRAJECTORY_SELECTION_STATUS, TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { FileInputStatus } from 'rte-design-system-react';

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

export const removeDuplicate = (arr: DbTrajectory[]) =>
  arr.reduce((acc: DbTrajectory[], current: DbTrajectory) => {
    const x = acc.find((item) => item.id === current.id);
    if (!x) {
      acc.push(current);
    }
    return acc;
  }, []);

export const buildRowData = (areaName: string, isDefault: boolean, trajectory?: DbTrajectory): AreaAndLinkRowData => ({
  hypothesis: areaName,
  trajectory: trajectory?.trajectoryName ? trajectory : null,
  status: trajectory?.trajectoryName ? TRAJECTORY_SELECTION_STATUS.OK : TRAJECTORY_SELECTION_STATUS.MISSING,
  isDefault,
});

export const buildEmptyRowData = (areaName: string) => ({
  id: Math.random(),
  trajectoryName: '',
  type: TRAJECTORY_TYPE.LOAD,
  version: 0,
  userName: 'user',
  creationDate: new Date(),
  loadArea: areaName,
  state: TRAJECTORY_SELECTION_STATUS.MISSING,
  messages: [],
});

// When a default area is not included in area options list, its row should have a read only state
export const retrieveReadOnlyArea = (sortedData: AreaAndLinkRowData[], defaultAreasNotInAreaTrajectory: string[]) => {
  const readOnlyIndexes: (number | null)[] = defaultAreasNotInAreaTrajectory
    .map((areaName) => {
      const index = sortedData.findIndex((trajectory) => areaName === trajectory.hypothesis);
      if (index >= 0) return index;
      return null;
    })
    .filter(Boolean);
  const readOnlyRows = {};
  readOnlyIndexes.forEach((readOnlyIndex) => Object.assign(readOnlyRows, { [`${readOnlyIndex}`]: true }));
  return readOnlyRows;
};
