import { DbTrajectory, HypothesisRowData, HypothesisTab, RowStatus } from '@/shared/types';
import { TRAJECTORY_SELECTION_STATUS, TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { FileInputStatus } from 'rte-design-system-react';
import { ReadOnlyObject } from '@common/data/stdTable/types/readOnly.type';
import { OTHER_AREAS, OTHER_AREAS_LABEL } from '@/shared/const/studyConfig.ts';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps.ts';
import { generateId } from '@/shared/utils/defaultUtils.ts';
import { Row } from '@tanstack/react-table';
import { TFunction } from 'i18next';
import { snakeCase } from '@/shared/utils/textUtils.ts';

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
 * Get background color from a file status
 * @param {FileInputStatus | null} status
 */
export const getBgColor = (status?: FileInputStatus) => {
  switch (status) {
    case 'loading':
      return 'bg-primary-600';
    case 'success':
    case 'error':
      return `bg-${status}-600`;
    case 'empty':
    default:
      return 'bg-gray-600';
  }
};

/**
 * Generates the default label for a given area.
 *
 * @function
 * @param {string} areaName - The name of the area.
 * @returns {string} The generated label for the area. If the area is the default and its name does not
 * match `OTHER_AREAS`, the label will include the area's name and the default label. Otherwise, only the area's name is returned.
 */
export const getDefaultLabel = (areaName: string): string => (areaName === OTHER_AREAS ? OTHER_AREAS_LABEL : areaName);

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
  area: string,
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
  hasTimeSeries: false,
});

/**
 * Remove duplicate within an array of database trajectory
 * @param {DbTrajectory[]} array
 * @return {DbTrajectory[]}
 */
export const removeDuplicate = (array: DbTrajectory[]): DbTrajectory[] => {
  const map = new Map<string, DbTrajectory>();
  for (const item of array || []) {
    if (!map.has(item.area)) {
      map.set(item.area, item);
    }
  }
  return Array.from(map.values());
};

/**
 * Removes duplicate elements from an array of DbTrajectory objects based on the combination
 * of `area` and `technology` properties. The first occurrence of each combination is retained,
 * and later duplicates are removed.
 *
 * @param {DbTrajectory[]} [array] - Optional array of DbTrajectory objects to process. Defaults to an empty array if not provided.
 * @returns {DbTrajectory[]} - A new array with duplicates removed based on `area` and `technology` properties.
 */
export const removeDuplicateByTechnology = (array?: DbTrajectory[]): DbTrajectory[] =>
  (array || []).reduce((acc: DbTrajectory[], current: DbTrajectory) => {
    const x = acc.find((item) => item.area === current.area && item.technology === current.technology);
    if (!x) {
      acc.push(current);
    }
    return acc;
  }, []);

/**
 * Create row data for a hypothesis table
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
 * Create an empty database trajectory
 * @param {string} area
 * @param {TRAJECTORY_TYPE} type
 * @param {string} technology
 * @return {DbTrajectory}
 */
export const buildEmptyTrajectory = (area: string, type: TRAJECTORY_TYPE, technology?: string): DbTrajectory => ({
  id: generateId(),
  trajectoryName: '',
  type,
  version: 0,
  userName: 'user',
  creationDate: new Date(),
  area,
  technology: technology ?? '',
  hasTimeSeries: false,
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
): HypothesisRowData => {
  const isDefault = defaultAreas?.some((item: { name: string }) => item.name === trajectory.area) ?? false;
  return {
    hypothesis: getDefaultLabel(trajectory.area ?? ''),
    trajectory: trajectory.trajectoryName && !trajectory?.technology ? trajectory : null,
    status:
      trajectory.trajectoryName && !trajectory?.technology
        ? TRAJECTORY_SELECTION_STATUS.OK
        : TRAJECTORY_SELECTION_STATUS.MISSING,
    isDefault: isDefault || OTHER_AREAS === trajectory.area,
    isDeletable: !isDefault && OTHER_AREAS !== trajectory.area,
    subRows:
      trajectory.area &&
      trajectory.area !== OTHER_AREAS &&
      !areasNotInTrajectoryArea?.some((item) => item === trajectory.area) &&
      subRowOptions
        ? subRowOptions?.map((option) => {
            const hasTechnology = trajectory?.trajectoryName && option === trajectory?.technology;
            return {
              hypothesis: option,
              trajectory: hasTechnology ? trajectory : null,
              status: hasTechnology ? TRAJECTORY_SELECTION_STATUS.OK : TRAJECTORY_SELECTION_STATUS.MISSING,
              isDefault: true,
              isDeletable: false,
              subRows: null,
            };
          })
        : null,
  };
};

/**
 * Constructs an object representing a row with optional sub-rows data.
 *
 * @param {string} value - The hypothesis value for the main row.
 * @param {string[]} subRows - Array of options for sub-rows.
 * @param type
 * @param defaultAreas
 * @returns {HypothesisRowData} An object representing the row, containing details such as hypothesis, trajectory, status, isDefault, isDeletable, and optionally subRows if hasSubRows is true.
 */
export const buildEmptyRowWithSubRowsData = (
  value: string,
  subRows: string[],
  type: TRAJECTORY_TYPE,
  defaultAreas?: { name: string }[],
): HypothesisRowData => ({
  hypothesis: value,
  trajectory: null,
  status: TRAJECTORY_SELECTION_STATUS.MISSING,
  isDefault: defaultAreas?.some((area) => area.name === value) ?? false,
  isDeletable: !defaultAreas?.some((area) => area.name === value),
  subRows: subRows?.length
    ? subRows.map((option) => ({
        hypothesis: option,
        trajectory: null,
        status: TRAJECTORY_SELECTION_STATUS.MISSING,
        isDefault: !!(
          type === TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER &&
          defaultAreas?.some((area) => area.name === option)
        ),
        isDeletable: defaultAreas ? !defaultAreas?.some((area) => area.name === value) : false,
        subRows: null,
      }))
    : null,
});

/**
 * Determines if a given area is linked to any trajectory with an empty technology field in the provided trajectory list.
 *
 * @param {{ name: string; technology: string }} area - The area object containing the name and technology properties.
 * @param {string} area.name - The name of the area.
 * @param {string} area.technology - The technology associated with the area.
 * @param {DbTrajectory[]} trajectories - An array of trajectory objects to be checked against the area.
 * @returns {boolean} Returns true if the area is linked to at least one trajectory with a matching area name and an empty technology field; otherwise, false.
 */
export const isTrajectoryLinked = (area: { name: string }, trajectories: DbTrajectory[]): boolean =>
  trajectories.some((trajectory) => area.name === trajectory.area && trajectory.technology === '');

/**
 * Function to build a default list of empty trajectories based on the provided trajectory type,
 * existing trajectories, and optionally specified default areas.
 *
 * @param {TRAJECTORY_TYPE} type - The type of trajectory to build.
 * @param {DbTrajectory[]} trajectories - An array of existing trajectories used to determine unlinked default areas.
 * @param {{name: string}[]} [defaultAreas] - An optional array of default area objects with a `name` field.
 * @returns {DbTrajectory[]} An array of empty trajectory objects built for areas that are not already linked to the existing trajectories.
 */
export const buildDefaultEmptyTrajectoryList = (
  type: TRAJECTORY_TYPE,
  trajectories: DbTrajectory[],
  defaultAreas?: { name: string }[],
): DbTrajectory[] => {
  const areaDefault = [...(Array.isArray(defaultAreas) && defaultAreas.length > 0 ? defaultAreas : [])];
  type !== TRAJECTORY_TYPE.RES_ZONAL_DISTRIBUTION &&
    type !== TRAJECTORY_TYPE.RES_TECHNOLOGY_DISTRIBUTION &&
    areaDefault.push({ name: OTHER_AREAS });

  // Check if default areas (without technology) are not already linked to a trajectory
  const defaultAreasNotLinkedToTrajectory =
    trajectories.length === 0 ? areaDefault : areaDefault.filter((area) => !isTrajectoryLinked(area, trajectories));
  // Then build default empty areas
  return (defaultAreasNotLinkedToTrajectory || []).map((defaultArea) => buildEmptyTrajectory(defaultArea.name, type));
};

/**
 * Determines whether a given trajectory should have sub-rows based on specified conditions.
 *
 * @param {string[]} areasToExclude - A list of area identifiers to exclude from consideration.
 * @param {DbTrajectory} [mainEntry] - An optional trajectory data object containing information about type and area.
 * @returns {boolean} True if the trajectory should have sub-rows, otherwise false.
 */
export const shouldHaveSubRows = (areasToExclude: string[], mainEntry?: DbTrajectory): boolean => {
  if (!mainEntry) return true;

  const isInExcluded = areasToExclude.includes(mainEntry.area);
  const isOther = mainEntry.area === OTHER_AREAS;
  switch (mainEntry.type) {
    case TRAJECTORY_TYPE.STS:
    case TRAJECTORY_TYPE.RES_CAPACITY:
    case TRAJECTORY_TYPE.RES_LOAD:
    case TRAJECTORY_TYPE.RES_TECHNOLOGY_DISTRIBUTION:
      return true;
    case TRAJECTORY_TYPE.THERMAL_CAPACITY:
      return !isOther && !isInExcluded;
    case TRAJECTORY_TYPE.RES_ZONAL_DISTRIBUTION:
      return false;
    default:
      return isOther || !isInExcluded;
  }
};

const normalizeTechnology = (s: string | undefined | null) => s?.trim().toLowerCase();

/**
 * Transforms data into a structured array of hypothesis rows, enriched with associated technologies.
 *
 * @param {DbTrajectory[]} data - An array of trajectory data objects, where each object contains detailed information
 *                                about a trajectory, including its area and associated technology.
 * @param {string[]} areasNotInTrajectoryArea - A list of areas that should not be included in the main trajectory area.
 * @param {{ name: string }[] | undefined} defaultAreas - An optional array of default area objects, where each object
 *                                                       contains a name field that specifies a default area.
 *
 * @param {string[]} options - Thechnologies names array
 * @returns {HypothesisRowData[]} An array of hypothesis row objects, each containing trajectory details,
 *                                technology-specific sub-rows, and metadata like status and default indicators.
 */
export const convertIntoHypothesisRowWithTechnologies = (
  data: DbTrajectory[],
  areasNotInTrajectoryArea: string[],
  defaultAreas: { name: string }[] | undefined,
  options: string[],
): HypothesisRowData[] => {
  const groupedByArea: Record<string, DbTrajectory[]> = data.reduce(
    (acc, item) => {
      if (item.area && !acc[item.area]) acc[item.area] = [];
      item.area && acc[item.area].push(item);
      return acc;
    },
    {} as Record<string, DbTrajectory[]>,
  );

  return Object.entries(groupedByArea).map(([area, entries]) => {
    const mainEntry = entries.find((e) => e.technology === '' || e.technology == null);
    const subRows: HypothesisRowData[] | null = shouldHaveSubRows(areasNotInTrajectoryArea, mainEntry)
      ? options.map((option: string) => {
          const trajectoryTechnology: DbTrajectory | undefined = entries.find((entry) =>
            entry?.type === TRAJECTORY_TYPE.RES_TECHNOLOGY_DISTRIBUTION
              ? normalizeTechnology(entry?.technology) == snakeCase(option)
              : normalizeTechnology(entry?.technology) == normalizeTechnology(option),
          );
          return {
            hypothesis: option,
            trajectory: trajectoryTechnology?.trajectoryName ? trajectoryTechnology : null,
            status: trajectoryTechnology?.trajectoryName
              ? TRAJECTORY_SELECTION_STATUS.OK
              : TRAJECTORY_SELECTION_STATUS.MISSING,
            isDefault: false,
            isDeletable: false,
            subRows: null,
          };
        })
      : null;

    const isDefault = defaultAreas?.some((item: { name: string }) => item.name === mainEntry?.area) ?? false;
    return {
      hypothesis: getDefaultLabel(area),
      trajectory: mainEntry?.trajectoryName ? mainEntry : null,
      status:
        mainEntry?.trajectoryName && !mainEntry?.technology
          ? TRAJECTORY_SELECTION_STATUS.OK
          : TRAJECTORY_SELECTION_STATUS.MISSING,
      isDefault: isDefault || mainEntry?.area === OTHER_AREAS,
      subRows: subRows?.length ? subRows : null,
      isDeletable: !isDefault && mainEntry?.area !== OTHER_AREAS,
    };
  });
};

/**
 * Create read-only mapping from the read-only item indexes array
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
 * @param {string[]} itemsToReadOnly - Items that should be in read-only state
 *
 * @return {ReadOnlyObject}
 */
export const retrieveReadOnlyArea = (rowData: HypothesisRowData[], itemsToReadOnly: string[]): ReadOnlyObject => {
  const readOnlyIndexes: (number | null)[] = itemsToReadOnly?.map((areaName) => {
    const index = rowData.findIndex((trajectory) => areaName === trajectory.hypothesis);
    return index >= 0 ? index : null;
  });
  return buildReadOnlyRow(readOnlyIndexes);
};

/**
 * Generates a read-only map of index paths for a hierarchical data structure.
 *
 * This function creates a flattened map where each key represents the path to an item
 * in the hierarchy (using dot notation for nesting levels), and the value is a boolean
 * `true` indicating the presence of that item. The resulting map is immutable.
 *
 * @param {HypothesisRowData[]} data - The hierarchical data to process, where each item can have subRows.
 * @returns {ReadOnlyObject} A frozen record with keys representing
 * paths to items in the input hierarchy, and values always set to `true`.
 */
export const generateReadOnlyIndexMap = (data: HypothesisRowData[]): ReadOnlyObject => {
  const indexMap: Record<string, true> = {};

  function traverse(items: HypothesisRowData[], parentIndex: string = '') {
    let i = 0;
    for (const item of items) {
      const currentIndex = parentIndex ? `${parentIndex}.${i}` : `${i}`;
      indexMap[currentIndex] = true;

      if (item.subRows && item.subRows.length > 0) {
        traverse(item.subRows, currentIndex);
      }

      i += 1;
    }
  }

  traverse(data);
  return Object.freeze(indexMap);
};

/**
 * Recursive updater to reset data (error status) into data in missing status
 * @param {HypothesisRowData[]} data
 * @return {HypothesisRowData[]}
 */
export const filterRow = (data: HypothesisRowData[]): HypothesisRowData[] =>
  data
    .map((row) => {
      // 🔹 Filtrer et transformer récursivement les subRows
      const filteredSubRows = row.subRows
        ? filterRow(
            row.subRows
              .map((subRow) =>
                subRow.status === TRAJECTORY_SELECTION_STATUS.ERROR
                  ? { ...subRow, status: TRAJECTORY_SELECTION_STATUS.MISSING }
                  : subRow,
              )
              .filter(
                (subRow) => subRow.isDefault || (subRow.trajectory && subRow.status === TRAJECTORY_SELECTION_STATUS.OK),
              ),
          )
        : [];

      let updatedRow: HypothesisRowData = {
        ...row,
        subRows: filteredSubRows.length > 0 ? filteredSubRows : null,
      };

      // 🔹 Cas 1 : row.isDefault ou non supprimable
      if (row.isDefault || !row.isDeletable) {
        if (row.status === TRAJECTORY_SELECTION_STATUS.ERROR) {
          updatedRow = {
            ...updatedRow,
            status: TRAJECTORY_SELECTION_STATUS.MISSING,
            trajectory: null,
          };
        }
        return updatedRow;
      }

      // 🔹 Cas 2 : row en ERROR mais avec des subRows valides
      if (row.status === TRAJECTORY_SELECTION_STATUS.ERROR && filteredSubRows.length > 0) {
        updatedRow = {
          ...updatedRow,
          status: TRAJECTORY_SELECTION_STATUS.MISSING,
          trajectory: null,
        };
      }

      return updatedRow;
    })
    .filter(
      (row) =>
        row.isDefault ||
        !row.isDeletable ||
        row.status === TRAJECTORY_SELECTION_STATUS.OK ||
        (row.status === TRAJECTORY_SELECTION_STATUS.MISSING && row.subRows && row.subRows.length > 0),
    );

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
 * Return all tabs available for a study configuration
 * @param {TFunction<'translation', undefined>} t - Translation function
 * @param {boolean} isTrajectoryAreaLinked - Flag to indicate if an AREA trajectory is linked to the study
 * @return {HypothesisTab[]} - Array of tab data model
 */
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
  { name: TRAJECTORY_TYPE.STS, label: t('studyDetails.@sts'), icon: StdIconId.BatteryChargingFull, isDisabled: true },
  { name: TRAJECTORY_TYPE.DSR, label: t('studyDetails.@dsr'), icon: StdIconId.InkEraser, isDisabled: true },
  { name: TRAJECTORY_TYPE.MISC_CAPACITY, label: t('studyDetails.@misc'), icon: StdIconId.Category, isDisabled: true },
  {
    name: TRAJECTORY_TYPE.RES_CAPACITY,
    label: t('studyDetails.@res'),
    icon: StdIconId.EnergySavingsLeaf,
    isDisabled: true,
  },
];

/**
 * A higher-order function that checks if a given trajectory type matches a specified trajectory key.
 *
 * @param {TRAJECTORY_TYPE} trajectoryKey - The key representing the trajectory type to match.
 * @returns {function(TRAJECTORY_TYPE): boolean} A function that takes a trajectory type and returns `true`
 * if it matches the trajectory key otherwise returns `false`.
 */
export const isMatchingTrajectoryType =
  (trajectoryKey: TRAJECTORY_TYPE): ((arg0: TRAJECTORY_TYPE) => boolean) =>
  (trajectoryType: TRAJECTORY_TYPE) =>
    trajectoryType === trajectoryKey;

/**
 * Select the data row according to an index array provided
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
 * @return {{area: string, technology?: string, isDefault: boolean} | undefined}
 */
export const getAreaTrajectoryName = (
  rowIdSelected: string,
  data: HypothesisRowData[],
): { area: string; technology?: string; isDefault: boolean } | undefined => {
  const [mainIndex, subIndex] = rowIdSelected.split('.').map(Number);
  const hypothesisInfo = {} as { area: string; technology?: string; isDefault: boolean };

  const mainRow = data[mainIndex];
  if (!mainRow?.hypothesis) return;
  if (mainRow.hypothesis) {
    hypothesisInfo.area = mainRow.hypothesis;
    hypothesisInfo.isDefault = mainRow.isDefault ?? false;
  }

  const subRow = mainRow.subRows?.[subIndex];

  if (subRow?.hypothesis) {
    hypothesisInfo.technology = subRow.hypothesis;
    hypothesisInfo.isDefault = (mainRow.isDefault || subRow.isDefault) ?? false;
  }
  return hypothesisInfo;
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
export const getSubRowsList = (row: Row<HypothesisRowData>): string[] =>
  row.depth === 0
    ? (row.originalSubRows || []).reduce((acc: string[], current: HypothesisRowData) => {
        if (current.status === TRAJECTORY_SELECTION_STATUS.OK && current?.trajectory?.technology) {
          acc.push(current.trajectory.technology);
          return acc;
        } else if (current.status === TRAJECTORY_SELECTION_STATUS.OK && current?.trajectory?.area) {
          acc.push(current?.trajectory?.area);
          return acc;
        } else {
          return acc;
        }
      }, [])
    : [];

/**
 * Provide information message about number and subrow name linked to a trajectory
 * @param subRowsList
 * @param t
 * @param type
 */
export const getSubRowListWithArea = (
  subRowsList: string[],
  t: TFunction<'translation', undefined>,
  type?: TRAJECTORY_TYPE,
): { message: string; messageNb: number } => {
  if (
    type === TRAJECTORY_TYPE.THERMAL_CAPACITY ||
    type === TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER ||
    type === TRAJECTORY_TYPE.STS ||
    type === TRAJECTORY_TYPE.RES_CAPACITY ||
    type === TRAJECTORY_TYPE.RES_TECHNOLOGY_DISTRIBUTION
  ) {
    let prefix: string = '';
    if (
      type === TRAJECTORY_TYPE.THERMAL_CAPACITY ||
      type === TRAJECTORY_TYPE.STS ||
      type === TRAJECTORY_TYPE.RES_CAPACITY ||
      type === TRAJECTORY_TYPE.RES_TECHNOLOGY_DISTRIBUTION
    ) {
      prefix = t('thermal.@installedPowerInformation');
    }
    if (type === TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER) {
      prefix = t('thermal.@specificInformation');
    }
    return {
      message: `${prefix}: ${subRowsList.join(', ')}`,
      messageNb: subRowsList.length,
    };
  } else {
    return { message: '', messageNb: 0 };
  }
};

/**
 * Determines the trajectory type based on the provided index value.
 *
 * @param {number} index - The index representing a specific trajectory type.
 * @returns {TRAJECTORY_TYPE} - The trajectory type corresponding to the index provided.
 *                              Returns `TRAJECTORY_TYPE.THERMAL_TECHNICAL_COMMON_PARAMETER` for index 1,
 *                              `TRAJECTORY_TYPE.THERMAL_TECHNICAL_MODULATION_PARAMETER` for index 2,
 *                              and `TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER` for index 0 or any other value.
 */
export const getTrajectoryTypeByIndex = (index: number): TRAJECTORY_TYPE => {
  switch (index) {
    case 1:
      return TRAJECTORY_TYPE.THERMAL_TECHNICAL_MODULATION_PARAMETER;
    case 2:
      return TRAJECTORY_TYPE.THERMAL_TECHNICAL_COMMON_PARAMETER;
    case 0:
    default:
      return TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER;
  }
};

/**
 * Determines if the provided type is classified as a technical parameter type
 * within the thermal trajectory category.
 *
 * @param {TRAJECTORY_TYPE} type - The type to evaluate.
 * @returns {boolean} Returns true if the type matches any of the defined
 * thermal technical parameter categories; otherwise, returns false.
 */
export const isTechnicalParametersType = (type: TRAJECTORY_TYPE): boolean =>
  type === TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER ||
  type === TRAJECTORY_TYPE.THERMAL_TECHNICAL_MODULATION_PARAMETER ||
  type === TRAJECTORY_TYPE.THERMAL_TECHNICAL_COMMON_PARAMETER;

/**
 * Determines the file path based on the trajectory type.
 *
 * @param {TRAJECTORY_TYPE} type - The trajectory type used to select the corresponding file path.
 * @param { area: string; technology: string; isDefault: boolean } hypothesis
 * @returns {string | null} The file path associated with the given trajectory type.
 */
export const getPathFromTrajectoryType = (
  type: TRAJECTORY_TYPE,
  hypothesis?: { area: string; technology?: string; isDefault: boolean },
): string | null => {
  switch (type) {
    case TRAJECTORY_TYPE.THERMAL_ECONOMIC_PARAMETER:
      return '\\\\thermal\\economic parameters\\economic';
    case TRAJECTORY_TYPE.THERMAL_ECONOMIC_COST_PARAMETER:
      return '\\\\thermal\\economic parameters\\costs';
    case TRAJECTORY_TYPE.THERMAL_TECHNICAL_MODULATION_PARAMETER:
      return '\\\\thermal\\technical parameters\\param_modulation';
    case TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER:
    case TRAJECTORY_TYPE.THERMAL_TECHNICAL_COMMON_PARAMETER:
      return '\\\\thermal\\technical parameters';
    case TRAJECTORY_TYPE.STS:
      return hypothesis?.technology ? `\\\\STS\\${hypothesis?.technology}\\clusters` : '\\\\STS\\clusters';
    case TRAJECTORY_TYPE.DSR:
      return '\\\\DSR\\cluster';
    case TRAJECTORY_TYPE.DSR_CAPACITY_MODULATION:
      return '\\\\DSR\\capacity modulation';
    case TRAJECTORY_TYPE.MISC_CAPACITY:
      return '\\\\MISC\\installed power';
    case TRAJECTORY_TYPE.MISC_LOAD:
      return '\\\\MISC\\load factor';
    case TRAJECTORY_TYPE.RES_CAPACITY:
      return `\\\\RES\\installed power${hypothesis?.isDefault && hypothesis?.area != OTHER_AREAS_LABEL ? `\\${hypothesis?.area}` : ''}`;
    case TRAJECTORY_TYPE.RES_LOAD:
      return '\\\\RES\\load factor';
    case TRAJECTORY_TYPE.RES_TECHNOLOGY_DISTRIBUTION:
      return '\\\\RES\\technicalParameters';
    case TRAJECTORY_TYPE.RES_ZONAL_DISTRIBUTION:
      return '\\\\RES\\technicalParameters';
    default:
      return null;
  }
};

/**
 * Determines the area name according to the trajectory type and the hypothesis
 * @param {TRAJECTORY_TYPE} trajectoryType
 * @param {string | undefined } hypothesis
 * @return {string | undefined}
 */

export const getQueryParamAreaValue = (trajectoryType: TRAJECTORY_TYPE, hypothesis?: string): string | undefined => {
  let area = hypothesis === OTHER_AREAS_LABEL ? OTHER_AREAS : hypothesis;
  if (trajectoryType === TRAJECTORY_TYPE.THERMAL_CAPACITY) {
    area = hypothesis === 'FR' ? 'FR' : OTHER_AREAS;
  }
  if (
    trajectoryType === TRAJECTORY_TYPE.THERMAL_TECHNICAL_MODULATION_PARAMETER ||
    trajectoryType === TRAJECTORY_TYPE.THERMAL_TECHNICAL_COMMON_PARAMETER ||
    trajectoryType === TRAJECTORY_TYPE.THERMAL_ECONOMIC_COST_PARAMETER ||
    trajectoryType === TRAJECTORY_TYPE.THERMAL_ECONOMIC_PARAMETER ||
    trajectoryType === TRAJECTORY_TYPE.DSR_CAPACITY_MODULATION
  ) {
    area = undefined;
  }
  return area;
};

/**
 * Determines if a parameter modulation should be deleted based on the provided index and data.
 *
 * The function evaluates certain conditions:
 * 1. Checks if the index is zero, and the first data row contains exactly one subRow with a non-null trajectory
 *    and a status of `TRAJECTORY_SELECTION_STATUS.OK`.
 * 2. Verifies whether the second data row has a defined trajectory and a status of `TRAJECTORY_SELECTION_STATUS.OK`.
 *
 * If both conditions are met, the function returns `true`. Otherwise, it returns `false`.
 *
 * @param {number} index - The index of the current row being evaluated.
 * @param {HypothesisRowData[]} data - An array of hypothesis row data to be analyzed.
 * @returns {boolean} Whether the parameter modulation should be deleted.
 */
export const shouldDeleteParamModulation = (index: number, data: HypothesisRowData[]): boolean => {
  const hasOnlyOneSpecificTrajectory =
    index === 0 &&
    data[0]?.subRows?.filter((subRow) => subRow.trajectory != null && subRow.status === TRAJECTORY_SELECTION_STATUS.OK)
      ?.length === 1;
  return (
    (hasOnlyOneSpecificTrajectory && data[1].trajectory && data[1].status === TRAJECTORY_SELECTION_STATUS.OK) || false
  );
};

export const shouldDeleteCapacityModulation = (rows: HypothesisRowData[], index: number): boolean => {
  const lastIndex = rows.length - 1;
  const lastRow = rows[lastIndex];

  // La dernière ligne doit être une trajectoire OK
  const lastIsValid = !!lastRow?.trajectory && lastRow.status === TRAJECTORY_SELECTION_STATUS.OK;
  if (!lastIsValid) return false;

  const dataToCheckWithoutLastRow = rows.slice(0, lastIndex);

  // La ligne ciblée doit avoir une trajectoire avec timeSeries
  const rowAtIndex = dataToCheckWithoutLastRow[index];
  if (!rowAtIndex?.trajectory?.hasTimeSeries) return false;

  // On récupère toutes les trajectoires avec timeSeries hors dernière ligne
  const tsRows = dataToCheckWithoutLastRow
    .map((row, i) => ({ row, i }))
    .filter(({ row }) => row.trajectory?.hasTimeSeries);

  // Vérifier qu'il n'y a plus qu'une trajectoire avec TS
  return tsRows.length === 1;
};

/**
 * Determines if the given trajectory type is one of the unique trajectory types.
 *
 * This function checks if the provided trajectory type matches
 * either the `THERMAL_ECONOMIC_PARAMETER` or the
 * `THERMAL_TECHNICAL_MODULATION_PARAMETER` from the `TRAJECTORY_TYPE` enumeration.
 *
 * @param {TRAJECTORY_TYPE} type - The trajectory type to check.
 * @returns {boolean} True if the trajectory type is considered unique, false otherwise.
 */
export const isUniqueTrajectoryType = (type: TRAJECTORY_TYPE): boolean =>
  type === TRAJECTORY_TYPE.THERMAL_ECONOMIC_PARAMETER ||
  type === TRAJECTORY_TYPE.THERMAL_TECHNICAL_MODULATION_PARAMETER;

/**
 * Normalizes the given value by ensuring a valid string is returned.
 *
 * If the provided value is null or an empty string, this function returns an empty string.
 * Otherwise, it returns the original value.
 *
 * @param {string | null} value - The value to be normalized, which can be a string or null.
 * @returns {string} The normalized string.
 */
export const normalize = (value: string | null): string => (value === null || value === '' ? '' : value);
