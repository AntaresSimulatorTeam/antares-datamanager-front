import { DbTrajectory, HypothesisRowData, RowStatus } from '@/shared/types';
import { TRAJECTORY_SELECTION_STATUS, TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { FileInputStatus } from 'rte-design-system-react';
import { ReadOnlyObject } from '@common/data/stdTable/types/readOnly.type';
import { WARNING_MESSAGE_LEVEL } from '@/shared/enum/warning.ts';
import { AREA_OTHERS } from '@/shared/const/studyConfig.ts';

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

export const buildErrorTrajectory = (
  type: TRAJECTORY_TYPE,
  trajectoryId: number,
  trajectoryLabel: string,
  errorMessage?: string,
  userName?: string,
  area?: string,
): DbTrajectory => ({
  id: trajectoryId,
  trajectoryName: trajectoryLabel,
  type,
  version: 0,
  userName: 'unknown_user',
  creationDate: new Date(),
  loadArea: area,
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
      isAck: false,
    },
  ],
  state: TRAJECTORY_SELECTION_STATUS.ERROR,
});

export const removeDuplicate = (arr: DbTrajectory[]) =>
  arr.reduce((acc: DbTrajectory[], current: DbTrajectory) => {
    const x = acc.find((item) => item.id === current.id);
    if (!x) {
      acc.push(current);
    }
    return acc;
  }, []);

export const buildRowData = (areaName: string, isDefault: boolean, trajectory?: DbTrajectory): HypothesisRowData => ({
  hypothesis: areaName === AREA_OTHERS ? 'Other areas' : areaName,
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

export const buildReadOnlyRow = (indexes: (number | null)[]): ReadOnlyObject => {
  const readOnlyRows = {};
  indexes.forEach((readOnlyIndex) => {
    if (readOnlyIndex != null) {
      Object.assign(readOnlyRows, { [`${readOnlyIndex}`]: true });
    }
  });
  return readOnlyRows;
};

/**
 *
 * @param {HypothesisRowData[]} rowData
 * @param {string[]} itemsToReadOnly - Items that should be in read only state
 *
 * @return {ReadOnlyObject}
 */
export const retrieveReadOnlyArea = (rowData: HypothesisRowData[], itemsToReadOnly: string[]): ReadOnlyObject => {
  const readOnlyIndexes: (number | null)[] = itemsToReadOnly.map((areaName) => {
    const index = rowData.findIndex((trajectory) => areaName === trajectory.hypothesis);
    return index >= 0 ? index : null;
  });
  return buildReadOnlyRow(readOnlyIndexes);
};
