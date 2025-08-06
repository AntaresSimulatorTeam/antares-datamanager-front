import { DbTrajectory, HypothesisRowData, HypothesisTab, RowStatus, WarningMessage } from '@/shared/types';
import { TRAJECTORY_SELECTION_STATUS, TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { FileInputStatus } from 'rte-design-system-react';
import { ReadOnlyObject } from '@common/data/stdTable/types/readOnly.type';
import { OTHER_AREAS, OTHER_AREAS_LABEL } from '@/shared/const/studyConfig.ts';
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
 * Removes duplicate objects from an array of WarningMessage objects based on their 'id' property.
 *
 * @param {WarningMessage[]} [array] - Optional array of WarningMessage objects to process.
 * @returns {WarningMessage[]} A new array containing only unique WarningMessage objects by 'id'.
 */
export const removeDuplicateById = (array?: WarningMessage[]): WarningMessage[] =>
  (array || []).reduce((acc: WarningMessage[], current: WarningMessage) => {
    const x = acc.find((item) => item.id === current.id);
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
  id: generateId(),
  trajectoryName: '',
  type,
  version: 0,
  userName: 'user',
  creationDate: new Date(),
  loadArea: areaName,
  state: TRAJECTORY_SELECTION_STATUS.MISSING,
});

/**
 * Generates row data with optional sub-rows based on a trajectory and associated options.
 *
 * @param {DbTrajectory} trajectory - The trajectory object containing load area and other properties.
 * @param {string[]} subRowOptions - An array of sub-row options to be considered for sub-rows.
 * @param {{name: string}[]} [defaultAreas] - An optional array of default areas used to check if a trajectory is default.
 * @param {string[]} [areasNotInTrajectoryArea] - An optional array of area names not included in the trajectory's area.
 *
 * @returns {HypothesisRowData} An object representing the row data, which includes the trajectory hypothesis, status, default status, and optional sub-rows data.
 */
export const buildRowWithSubRowsData = (
  trajectory: DbTrajectory,
  subRowOptions: string[],
  defaultAreas?: {
    name: string;
  }[],
  areasNotInTrajectoryArea?: string[],
): HypothesisRowData => ({
  hypothesis: trajectory.loadArea === OTHER_AREAS ? OTHER_AREAS_LABEL : (trajectory.loadArea as string),
  trajectory: trajectory ?? null,
  status: trajectory.trajectoryName ? TRAJECTORY_SELECTION_STATUS.OK : TRAJECTORY_SELECTION_STATUS.MISSING,
  isDefault:
    defaultAreas?.some((item: { name: string }) => item.name === trajectory.loadArea) ||
    OTHER_AREAS === trajectory.loadArea,
  subRows:
    trajectory.loadArea !== OTHER_AREAS && !areasNotInTrajectoryArea?.some((item) => item === trajectory.loadArea)
      ? subRowOptions.map((option) => ({
          hypothesis: option,
          trajectory: null,
          status: TRAJECTORY_SELECTION_STATUS.MISSING,
          isDefault: true,
          subRows: null,
        }))
      : null,
});

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

export const getRowDataSelected = (data: HypothesisRowData[], indexArray: number[]): HypothesisRowData | undefined =>
  indexArray.length === 2 ? data[indexArray[0]].subRows?.[indexArray[1]] : data[indexArray[0]];

/**
 * Retrieves the hypothesis and technology values based on selected row data.
 *
 * This function processes a list of data and current row selection to determine
 * the hypothesis and technology information from the respective data structure.
 *
 * @param {HypothesisRowData[]} data - The array of hypothesis row data.
 * @param {string} rowId - The selected row information, containing the index and optionally the parent index.
 * @returns {{ hypothesis: string, technology: string | undefined }} An object containing the hypothesis string and optionally the technology string if available.
 */
export const getHypothesis = (
  data: HypothesisRowData[],
  rowId: string,
): { hypothesis: string | undefined; technology: string | undefined } => {
  const dataRowSelected = getRowDataSelected(
    data,
    rowId.split('.').map((item) => parseInt(item)),
  );
  const indexArray = rowId.split('.').map((item) => parseInt(item));
  if (indexArray.length === 2) {
    return { hypothesis: data[indexArray[0]]?.hypothesis, technology: dataRowSelected?.hypothesis };
  } else {
    return {
      hypothesis: dataRowSelected?.hypothesis === OTHER_AREAS_LABEL ? OTHER_AREAS : dataRowSelected?.hypothesis,
      technology: undefined,
    };
  }
};

export const setNestedData = (
  state: HypothesisRowData[],
  rowSelected: number[],
  newEmptyTrajectory: Pick<HypothesisRowData, 'trajectory' | 'status'>,
) =>
  state.map((item, index) => {
    if (rowSelected.length === 2 && index === rowSelected[1]) {
      return {
        ...item,
        subRows: item.subRows?.map((subItem, subIndex) =>
          subIndex === rowSelected[1]
            ? {
                ...subItem,
                ...newEmptyTrajectory,
              }
            : subItem,
        ),
      };
    } else if (rowSelected.length === 1 && index === rowSelected[0]) {
      return {
        ...item,
        ...newEmptyTrajectory,
      };
    } else {
      return item;
    }
  });
