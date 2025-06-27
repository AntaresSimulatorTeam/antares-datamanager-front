import { DbTrajectory, HypothesisRowData, NestedCheckedType, RowStatus } from '@/shared/types';
import { TRAJECTORY_SELECTION_STATUS, TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { FileInputStatus } from 'rte-design-system-react';
import { ReadOnlyObject } from '@common/data/stdTable/types/readOnly.type';
import { WARNING_MESSAGE_LEVEL } from '@/shared/enum/warning.ts';
import { OTHER_AREAS, OTHER_AREAS_LABEL } from '@/shared/const/studyConfig.ts';
import { ThermalOptions } from '@/mocks/data/list/names.ts';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps.ts';

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
    const x = acc.find((item) => item.loadArea === current.loadArea);
    if (!x) {
      acc.push(current);
    }
    return acc;
  }, []);

export const buildRowData = (areaName: string, isDefault: boolean, trajectory?: DbTrajectory): HypothesisRowData => ({
  hypothesis: areaName === OTHER_AREAS ? OTHER_AREAS_LABEL : areaName,
  trajectory: trajectory?.trajectoryName ? trajectory : null,
  status: trajectory?.trajectoryName ? TRAJECTORY_SELECTION_STATUS.OK : TRAJECTORY_SELECTION_STATUS.MISSING,
  isDefault,
});

export const buildEmptyTrajectory = (areaName: string, type: TRAJECTORY_TYPE): DbTrajectory => ({
  id: Math.random(),
  trajectoryName: '',
  type,
  version: 0,
  userName: 'user',
  creationDate: new Date(),
  loadArea: areaName,
  state: TRAJECTORY_SELECTION_STATUS.MISSING,
  messages: [],
});

export const buildRowWithSubRowsData = (array: { name: string }[]) =>
  array.map((area) => ({
    hypothesis: area.name,
    trajectory: null,
    status: TRAJECTORY_SELECTION_STATUS.MISSING,
    isDefault: true,
    subRows: ThermalOptions.map((option) => ({
      hypothesis: option,
      trajectory: null,
      status: TRAJECTORY_SELECTION_STATUS.MISSING,
      isDefault: true,
      subRows: null,
    })),
  }));

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

export const addNestedRow = (data: HypothesisRowData[], newRow: HypothesisRowData, parentValue?: string) =>
  data.map((item) => {
    if (item.hypothesis === parentValue) {
      return {
        ...item,
        subRows: !item.subRows
          ? [newRow]
          : [...item.subRows, newRow].sort((a, b) => a.hypothesis.localeCompare(b.hypothesis)),
      };
    } else {
      return item;
    }
  });

export const checkNestedValue = (checkedValues: NestedCheckedType[], value: string, parentValue?: string) =>
  checkedValues.map((item) => {
    if (item.name === parentValue) {
      return {
        ...item,
        subOptions:
          item.subOptions && !item.subOptions.includes(value)
            ? [...item.subOptions, value].sort((a, b) => a.localeCompare(b))
            : [value],
      };
    } else {
      return item;
    }
  });

export const removeThermalRow = (data: HypothesisRowData[], value: string, parentValue: string) =>
  data.map((item) => {
    if (item.hypothesis === parentValue) {
      const itemsSubRows = item.subRows
        ? [...item.subRows.filter((subRow) => subRow.hypothesis !== value)].sort((a, b) =>
            a.hypothesis.localeCompare(b.hypothesis),
          )
        : item.subRows;
      return {
        ...item,
        subRows: itemsSubRows?.length ? itemsSubRows : null,
      };
    } else {
      return item;
    }
  });

export const unCheckNestedValue = (
  checkedValues: NestedCheckedType[],
  value: string,
  parentValue?: string,
): NestedCheckedType[] =>
  checkedValues.map((item) => {
    if (item.name === parentValue) {
      const subOptions = item?.subOptions?.filter((subOption) => subOption !== value);
      return {
        ...item,
        subOptions: subOptions?.length ? subOptions : null,
      };
    } else {
      return item;
    }
  });

export const getStudyMenu = (t: (value: string) => string, isTrajectoryAreaLinked: boolean) => [
  {
    name: TRAJECTORY_TYPE.AREA,
    label: t('studyDetails.@areas_links'),
    icon: StdIconId.LinkedServices,
    isDisabled: false,
  },
  {
    name: TRAJECTORY_TYPE.LOAD,
    label: t('studyDetails.@load'),
    icon: StdIconId.BatteryChargingFull,
    isDisabled: isTrajectoryAreaLinked,
  },
  {
    name: TRAJECTORY_TYPE.THERMAL_CAPACITY,
    label: t('studyDetails.@thermal'),
    icon: StdIconId.LocalFireDepartment,
    isDisabled: isTrajectoryAreaLinked,
  },
  { name: TRAJECTORY_TYPE.ENR, label: t('studyDetails.@enr'), icon: StdIconId.EnergySavingsLeaf, isDisabled: true },
  { name: TRAJECTORY_TYPE.MISC, label: t('studyDetails.@misc'), icon: StdIconId.Category, isDisabled: true },
];
