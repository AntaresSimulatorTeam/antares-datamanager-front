import { DbTrajectory, HypothesisRowData, HypothesisTab, NestedCheckedType, RowStatus } from '@/shared/types';
import { TRAJECTORY_SELECTION_STATUS, TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { FileInputStatus } from 'rte-design-system-react';
import { ReadOnlyObject } from '@common/data/stdTable/types/readOnly.type';
import { OTHER_AREAS, OTHER_AREAS_LABEL } from '@/shared/const/studyConfig.ts';
import { ThermalOptions } from '@/mocks/data/list/names.ts';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps.ts';
import { generateId } from '@/shared/utils/defaultUtils.ts';

/**
 * Get trajectory status from row status
 * @param {RowStatus | null} status
 */
export const getStatus = (status?: RowStatus) => {
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

/**
 * Get background color from file status
 * @param {FileInputStatus | null} status
 */
export const getBgColor = (status?: FileInputStatus) => {
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

/**
 * Create row data for a trajectory with error status
 * @param {TRAJECTORY_TYPE} type
 * @param {number} trajectoryId
 * @param {string} trajectoryLabel
 * @param {string | null} userName
 * @param {string | null} area
 */
export const buildErrorTrajectory = (
  type: TRAJECTORY_TYPE,
  trajectoryId: number,
  trajectoryLabel: string,
  userName?: string,
  area?: string,
): DbTrajectory => ({
  id: trajectoryId,
  trajectoryName: trajectoryLabel,
  type,
  version: 0,
  userName: userName ?? 'unknown_user',
  creationDate: new Date(),
  loadArea: area,
  state: TRAJECTORY_SELECTION_STATUS.ERROR,
});

/**
 * Remove duplicate within an array of data base trajectory
 * @param {DbTrajectory[] | null} array
 * @return {DbTrajectory[]}
 */
export const removeDuplicate = (array?: DbTrajectory[]): DbTrajectory[] =>
  (array || []).reduce((acc: DbTrajectory[], current: DbTrajectory) => {
    const x = acc.find((item) => item.loadArea === current.loadArea);
    if (!x) {
      acc.push(current);
    }
    return acc;
  }, []);

/**
 * Create row data for hypothesis table
 * @param {string} areaName
 * @param {boolean} isDefault
 * @param {DbTrajectory | null} trajectory
 * @return {HypothesisRowData}
 */
export const buildRowData = (areaName: string, isDefault: boolean, trajectory?: DbTrajectory): HypothesisRowData => ({
  hypothesis: areaName === OTHER_AREAS ? OTHER_AREAS_LABEL : areaName,
  trajectory: trajectory?.trajectoryName ? trajectory : null,
  status: trajectory?.trajectoryName ? TRAJECTORY_SELECTION_STATUS.OK : TRAJECTORY_SELECTION_STATUS.MISSING,
  isDefault,
});

/**
 * Create empty data base trajectory
 * @param {string} areaName
 * @param type
 * @return {DbTrajectory}
 */
export const buildEmptyTrajectory = (areaName: string, type: TRAJECTORY_TYPE): DbTrajectory => ({
  id: Math.floor(generateId()),
  trajectoryName: '',
  type,
  version: 0,
  userName: 'user',
  creationDate: new Date(),
  loadArea: areaName,
  state: TRAJECTORY_SELECTION_STATUS.MISSING,
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

/**
 * Create read only mapping from the read only item indexes array
 * @param {(number | null)[]} indexes
 * @return {ReadOnlyObject}
 */
export const buildReadOnlyRow = (indexes?: (number | null)[]): ReadOnlyObject => {
  const readOnlyRows = {};
  (indexes || []).forEach((readOnlyIndex) => {
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

/**
 * Add data to nested row
 * @param data
 * @param newRow
 * @param parentValue
 * @return {HypothesisRowData[]}
 */
export const addNestedRow = (
  data: HypothesisRowData[],
  newRow: HypothesisRowData,
  parentValue?: string,
): HypothesisRowData[] =>
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

/**
 * Add checked nested value to nested value list
 * @param {NestedCheckedType[]} checkedValues
 * @param {string} value
 * @param {string | null} parentValue
 * @return {NestedCheckedType[]}
 */
export const checkNestedValue = (
  checkedValues: NestedCheckedType[],
  value: string,
  parentValue?: string,
): NestedCheckedType[] =>
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

/**
 * Remove and sub row if parent is checked
 * @param {HypothesisRowData[]} data
 * @param {string} value
 * @param {string} parentValue
 * @return {HypothesisRowData[]}
 */
export const removeRowAndSubRow = (
  data: HypothesisRowData[],
  value: string,
  parentValue: string,
): HypothesisRowData[] =>
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

/**
 * Unchecked value from checked value list
 * @param {NestedCheckedType[]} checkedValues
 * @param {string} value
 * @param {string | null} parentValue
 * @return {NestedCheckedType[]}
 */
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

export const getStudyMenu = (t: (value: string) => string, isTrajectoryAreaLinked: boolean): HypothesisTab[] => [
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

export const isMatchingTrajectoryType = (trajectoryKey: TRAJECTORY_TYPE) => (trajectoryType: TRAJECTORY_TYPE) =>
  trajectoryType === trajectoryKey;
