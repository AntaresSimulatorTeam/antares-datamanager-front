import { DbTrajectory, HypothesisRowData, HypothesisTab, RowStatus, WarningMessage } from '@/shared/types';
import { TRAJECTORY_SELECTION_STATUS, TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { FileInputStatus } from 'rte-design-system-react';
import { ReadOnlyObject } from '@common/data/stdTable/types/readOnly.type';
import { OTHER_AREAS, OTHER_AREAS_LABEL } from '@/shared/const/studyConfig.ts';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps.ts';
import { generateId } from '@/shared/utils/defaultUtils.ts';
import { Row } from '@tanstack/react-table';

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
  userName: string | null,
  area?: string | null,
): DbTrajectory => ({
  id: trajectoryId,
  trajectoryName: trajectoryLabel,
  technology: '',
  type,
  version: 0,
  userName: userName ?? 'unknown_user',
  creationDate: new Date(),
  area,
  state: TRAJECTORY_SELECTION_STATUS.ERROR,
});

/**
 * Remove duplicate within an array of data base trajectory
 * @param {DbTrajectory[] | null} array
 * @return {DbTrajectory[]}
 */
export const removeDuplicate = (array?: DbTrajectory[]): DbTrajectory[] =>
  (array || []).reduce((acc: DbTrajectory[], current: DbTrajectory) => {
    const x = acc.find((item) => item.area === current.area);
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
 * @param {string} area
 * @param type
 * @return {DbTrajectory}
 */
export const buildEmptyTrajectory = (area: string, type: TRAJECTORY_TYPE): DbTrajectory => ({
  id: generateId(),
  trajectoryName: '',
  type,
  version: 0,
  userName: 'user',
  creationDate: new Date(),
  area,
  technology: '',
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
  defaultAreas?: {
    name: string;
  }[],
  areasNotInTrajectoryArea?: string[],
  subRowOptions?: string[] | null,
): HypothesisRowData => ({
  hypothesis: trajectory.area === OTHER_AREAS ? OTHER_AREAS_LABEL : (trajectory.area as string),
  trajectory: trajectory.trajectoryName && !trajectory?.technology ? trajectory : null,
  status:
    trajectory.trajectoryName && !trajectory?.technology
      ? TRAJECTORY_SELECTION_STATUS.OK
      : TRAJECTORY_SELECTION_STATUS.MISSING,
  isDefault:
    defaultAreas?.some((item: { name: string }) => item.name === trajectory.area) || OTHER_AREAS === trajectory.area,
  subRows:
    trajectory.area !== OTHER_AREAS && !areasNotInTrajectoryArea?.some((item) => item === trajectory.area)
      ? subRowOptions?.map((option) => {
          const hasTechnology = trajectory?.trajectoryName && option === trajectory?.technology;
          return {
            hypothesis: option,
            trajectory: hasTechnology ? trajectory : null,
            status: hasTechnology ? TRAJECTORY_SELECTION_STATUS.OK : TRAJECTORY_SELECTION_STATUS.MISSING,
            isDefault: true,
            subRows: null,
          };
        })
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

/**
 * Select data row according to index array provided
 * @param {HypothesisRowData[]} data
 * @param {number[]} indexArray
 * @return {HypothesisRowData | null} - Hypothesis row data
 */
export const getRowDataSelected = (data: HypothesisRowData[], indexArray: number[]): HypothesisRowData | null =>
  indexArray.length === 2 ? (data[indexArray[0]].subRows?.[indexArray[1]] ?? null) : (data[indexArray[0]] ?? null);

/**
 * Get a name composed of an area name and a technology name
 * @param {string} rowIdSelected
 * @param {HypothesisRowData[]} data
 * @return {string}
 */
export const getAreaTrajectoryName = (rowIdSelected: string, data: HypothesisRowData[]): string => {
  const [mainIndex, subIndex] = rowIdSelected.split('.').map(Number);

  const mainRow = data[mainIndex];
  if (!mainRow) return '';

  const subRow = mainRow.subRows?.[subIndex];
  const technologyName = subRow?.hypothesis ? ` - ${subRow.hypothesis}` : '';

  return `${mainRow.hypothesis ?? ''}${technologyName}`;
};

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
  const indexArray = rowId.split('.').map((item) => parseInt(item));
  const dataRowSelected = getRowDataSelected(data, indexArray);
  if (indexArray.length === 2) {
    return { hypothesis: data[indexArray[0]]?.hypothesis, technology: dataRowSelected?.hypothesis };
  } else {
    return {
      hypothesis: dataRowSelected?.hypothesis === OTHER_AREAS_LABEL ? OTHER_AREAS : dataRowSelected?.hypothesis,
      technology: undefined,
    };
  }
};

/**
 * Updates the nested data structure within a state array based on the provided row selection and new trajectory details.
 *
 * @param {HypothesisRowData[]} state - The current state containing rows of data.
 * @param {number[]} rowSelected - An array specifying the index of the row to update.
 *                                   If it contains one element, the parent row will be updated.
 *                                   If it contains two elements, a sub-row of the specified parent will be updated.
 * @param {Pick<HypothesisRowData, 'trajectory' | 'status'>} newEmptyTrajectory - An object containing the updated trajectory and status values.
 * @returns {HypothesisRowData[]} A new state array with the specified updates applied.
 */
export const setNestedData = (
  state: HypothesisRowData[],
  rowSelected: number[],
  newEmptyTrajectory: Pick<HypothesisRowData, 'trajectory' | 'status'>,
): HypothesisRowData[] =>
  state.map((item, index) => {
    if (rowSelected.length === 2 && index === rowSelected[0]) {
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

/**
 * Retrieves a list of child row technologies associated with the given row.
 *
 * This function processes rows at a depth of 0 and extracts technologies from their subrows,
 * returning them as an array of strings. If no technologies are found or the row is not at
 * depth 0, an empty array is returned.
 *
 * @param {Row<HypothesisRowData>} row - The input row containing child data and associated information.
 * @returns {string[]} An array of technology strings from the child rows, or an empty array if none are found.
 */
export const getChildrenList = (row: Row<HypothesisRowData>): string[] =>
  row.depth === 0
    ? (row.originalSubRows || []).reduce((acc: string[], current: HypothesisRowData) => {
        if (!!current?.trajectory?.technology?.length && current?.trajectory?.technology?.length > 0) {
          acc.push(current.trajectory.technology);
          return acc;
        } else {
          return acc;
        }
      }, [])
    : [];
