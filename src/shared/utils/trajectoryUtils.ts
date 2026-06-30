import {
  DbTrajectory,
  HypothesisRowData,
  isTrajectoryHydroType,
  isTrajectoryResType,
  RowStatus,
  StdTabItemProps,
  TechnologyType,
} from '@/shared/types';
import { TRAJECTORY_SELECTION_STATUS, TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { FileInputStatus } from 'rte-design-system-react';
import { ReadOnlyObject } from '@common/data/stdTable/types/readOnly.type';
import { OTHER_AREAS, OTHER_AREAS_LABEL } from '@/shared/const/studyConfig.ts';
import { generateId } from '@/shared/utils/defaultUtils.ts';
import { Row } from '@tanstack/react-table';
import { TFunction } from 'i18next';
import { normalizeTechnology, sentenceCase, snakeCase, snakeCaseUnderscore } from '@/shared/utils/textUtils.ts';
import {
  TRAJECTORY_DSR_CAPACITY_MODULATION,
  TRAJECTORY_DSR_CLUSTER,
  TRAJECTORY_ENDPOINT,
  TRAJECTORY_HYDRO_SERIES,
  TRAJECTORY_HYDRO_TECHNICAL_PARAMETERS,
  TRAJECTORY_MISC_INSTALLED_POWER,
  TRAJECTORY_MISC_LOAD_FACTOR,
  TRAJECTORY_NUCLEAR_FR_MODULATION,
  TRAJECTORY_NUCLEAR_FR_TALON,
  TRAJECTORY_NUCLEAR_TS_EPR,
  TRAJECTORY_NUCLEAR_TS_LT,
  TRAJECTORY_NUCLEAR_TS_SMR,
  TRAJECTORY_RES_INSTALLED_POWER,
  TRAJECTORY_RES_LOAD_FACTOR,
  TRAJECTORY_RES_TECHNOLOGY_DISTRIBUTION,
  TRAJECTORY_RES_ZONAL_DISTRIBUTION,
  TRAJECTORY_STS,
  TRAJECTORY_THERMAL_COMMON_PARAMETER_IMPORT,
  TRAJECTORY_THERMAL_COSTS_PARAMETER_IMPORT,
  TRAJECTORY_THERMAL_ECONOMIC_PARAMETER_IMPORT,
  TRAJECTORY_THERMAL_INSTALLED_POWER_IMPORT,
  TRAJECTORY_THERMAL_MODULATION_PARAMETER_IMPORT,
  TRAJECTORY_THERMAL_SPECIFIC_PARAMETER_IMPORT,
} from '@/shared/const/apiEndPoint.ts';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps.ts';
import { HypothesisType, SearchParams } from '@/shared/types/HypothesisTable.ts';

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
 * Determines whether a given trajectory should have sub-rows based on specified conditions.
 *
 * @param {string[]} areasToExclude - A list of area identifiers to exclude from consideration.
 * @param {DbTrajectory} [mainEntry] - An optional trajectory data object containing information about type and area.
 * @returns {boolean} True if the trajectory should have sub-rows, otherwise false.
 */
export const shouldHaveSubRows = (areasToExclude: string[], mainEntry: DbTrajectory | null): boolean => {
  if (!mainEntry) return true;

  const isInExcluded = areasToExclude.includes(mainEntry.area);
  const isOther = mainEntry.area === OTHER_AREAS;
  switch (mainEntry.type) {
    case TRAJECTORY_TYPE.STS:
    case TRAJECTORY_TYPE.RES_CAPACITY:
    case TRAJECTORY_TYPE.RES_LOAD:
    case TRAJECTORY_TYPE.RES_TECHNOLOGY_DISTRIBUTION:
    case TRAJECTORY_TYPE.HYDRO_SERIES:
    case TRAJECTORY_TYPE.HYDRO_TECHNICAL_PARAMETERS:
      return !isInExcluded;
    case TRAJECTORY_TYPE.THERMAL_CAPACITY:
      return !isOther && !isInExcluded;
    case TRAJECTORY_TYPE.RES_ZONAL_DISTRIBUTION:
      return false;
    default:
      return isOther || !isInExcluded;
  }
};

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

export const shouldBeDeletable = (
  type?: TRAJECTORY_TYPE,
  defaultAreas?: { name: string }[],
  trajectory?: DbTrajectory | null,
): boolean => {
  if (!trajectory) return false;
  const isDefault = defaultAreas?.some((item: { name: string }) => item.name === trajectory.area) ?? false;
  return !isDefault && OTHER_AREAS !== trajectory.area && type === TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER;
};

const normalizeOption = (str: string): string => str.toLowerCase().replace(/_/g, ' ').replace(/\s+/g, ' ').trim();

const typeNameContains = (value: string, typeName: string): boolean => {
  const normalizedValue = normalizeOption(value);
  const normalizedType = normalizeOption(typeName.replace('HYDRO_', ''));
  return normalizedType.includes(normalizedValue);
};

export const findTechnologyMatch = (entries: DbTrajectory[], option: string) =>
  entries.find((entry) => {
    if (
      entry.type === TRAJECTORY_TYPE.RES_CAPACITY ||
      entry.type === TRAJECTORY_TYPE.RES_TECHNOLOGY_DISTRIBUTION ||
      entry.type === TRAJECTORY_TYPE.RES_LOAD
    ) {
      return normalizeTechnology(entry.technology) === snakeCaseUnderscore(option);
    }
    if (isTrajectoryHydroType(entry.type)) {
      return typeNameContains(option, entry.type);
    }
    return normalizeTechnology(entry.technology) === normalizeTechnology(option);
  });

const computeStatus = (trajectory: DbTrajectory | null) =>
  trajectory?.trajectoryName ? TRAJECTORY_SELECTION_STATUS.OK : TRAJECTORY_SELECTION_STATUS.MISSING;

const computeIsDefault = (area: string | undefined, defaultAreas?: { name: string }[]) =>
  defaultAreas?.some((a) => a.name === area) ?? false;

const buildRow = ({
  hypothesis,
  trajectory,
  isDefault,
  isDeletable,
}: {
  hypothesis: string;
  trajectory: DbTrajectory | null;
  isDefault: boolean;
  isDeletable: boolean;
}): HypothesisRowData => ({
  hypothesis,
  trajectory: trajectory?.trajectoryName ? trajectory : null,
  status: computeStatus(trajectory),
  isDefault,
  isDeletable,
  subRows: null,
});

const buildSubRows = (
  entries: DbTrajectory[],
  options: string[],
  defaultAreas?: { name: string }[],
): HypothesisRowData[] =>
  options.map((option) => {
    const matchedTech = findTechnologyMatch(entries, option);
    return buildRow({
      hypothesis: option,
      trajectory: matchedTech ?? null,
      isDefault: false,
      isDeletable: shouldBeDeletable(matchedTech?.type, defaultAreas, matchedTech ?? null),
    });
  });

export const buildRowWithSubRows = ({
  hypothesis,
  trajectory,
  techEntries,
  options,
  defaultAreas,
  areasNotInTrajectoryArea,
}: {
  hypothesis: string;
  trajectory: DbTrajectory | null;
  techEntries?: DbTrajectory[];
  options: string[];
  defaultAreas?: { name: string }[];
  areasNotInTrajectoryArea: string[];
}): HypothesisRowData => {
  const isDefault = computeIsDefault(hypothesis, defaultAreas);
  const isOtherArea = hypothesis === OTHER_AREAS_LABEL;

  const baseRow = buildRow({
    hypothesis,
    trajectory,
    isDefault: isDefault || isOtherArea,
    isDeletable: !isDefault && !isOtherArea,
  });

  // Si aucune subrow n'est attendue
  if (!shouldHaveSubRows(areasNotInTrajectoryArea, trajectory)) {
    return { ...baseRow, subRows: null };
  }

  // On génère toujours une subrow par option
  const subRows = buildSubRows(techEntries ?? [], options, defaultAreas);

  return { ...baseRow, subRows };
};

export const mergeSubRows = (subRows: HypothesisRowData[]) => {
  const map = new Map<string, HypothesisRowData>();

  for (const sr of subRows) {
    const key = sr.hypothesis;

    // Si la clé n'existe pas encore → on stocke
    if (!map.has(key)) {
      map.set(key, sr);
      continue;
    }

    const existing = map.get(key);

    // Si le nouveau a une trajectory et pas l'existant → on remplace
    if (!existing?.trajectory && sr.trajectory) {
      map.set(key, sr);
    }
  }

  return Array.from(map.values());
};

export const mergeRows = (rows: HypothesisRowData[]): HypothesisRowData[] => {
  const map = new Map<string, HypothesisRowData>();

  rows.forEach((row) => {
    const key = row.hypothesis;

    if (!map.has(key)) {
      map.set(key, { ...row });
      return;
    }

    const existing = map.get(key)!;

    // Fusion des subRows
    const mergedSubRows = [...(existing.subRows ?? []), ...(row.subRows ?? [])];

    existing.subRows = mergeSubRows(mergedSubRows);

    // Priorité à la row qui a une trajectory
    if (!existing.trajectory && row.trajectory) {
      existing.trajectory = row.trajectory;
    }
  });

  return [...map.values()];
};

export const convertIntoHypothesisRowWithTechnologies = (
  data: DbTrajectory[],
  areasNotInTrajectoryArea: string[],
  defaultAreas: { name: string }[] | undefined,
  options: string[],
  trajectoryType?: TRAJECTORY_TYPE,
): HypothesisRowData[] => {
  const groupedByArea: Record<string, DbTrajectory[]> = data.reduce<Record<string, DbTrajectory[]>>((acc, item) => {
    if (item.area) {
      acc[item.area] = acc[item.area] || [];
      acc[item.area].push(item);
    }
    return acc;
  }, {});

  const allAreas = new Set([
    ...Object.keys(groupedByArea),
    ...areasNotInTrajectoryArea,
    ...(defaultAreas?.map((a) => a.name) ?? []),
  ]);

  return Array.from(allAreas).map((area) => {
    const entries = groupedByArea[area] ?? [];
    let parentEntry = null;
    let techEntries;
    if (isTrajectoryHydroType(trajectoryType)) {
      techEntries = entries.filter((e) => e.trajectoryName.length > 0 && e.type === trajectoryType);
    } else {
      parentEntry = entries.find((e) => !e.technology || e.technology.trim() === '') ?? null;
      techEntries = entries.filter((e) => e.technology && e.technology.trim() !== '');
    }
    return buildRowWithSubRows({
      hypothesis: getDefaultLabel(area),
      trajectory: parentEntry,
      techEntries,
      options,
      defaultAreas,
      areasNotInTrajectoryArea,
    });
  });
};

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
  trajectories.some(
    (trajectory) => area.name === trajectory.area && (trajectory.technology === '' || trajectory.technology == null),
  );

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
 * @return {StdTabItemProps[]} - Array of tab data model
 */
export const getStudyMenu = (t: (value: string) => string, isTrajectoryAreaLinked: boolean): StdTabItemProps[] => [
  {
    id: TRAJECTORY_TYPE.AREA,
    panelId: TRAJECTORY_TYPE.AREA,
    label: t('studyDetails.@areas_links'),
    icon: StdIconId.LinkedServices, //'share',
    disabled: false,
  },
  {
    id: TRAJECTORY_TYPE.LOAD,
    panelId: TRAJECTORY_TYPE.LOAD,
    label: t('studyDetails.@load'),
    icon: StdIconId.Monitoring, //'monitoring',
    disabled: isTrajectoryAreaLinked,
  },
  {
    id: TRAJECTORY_TYPE.THERMAL_CAPACITY,
    panelId: TRAJECTORY_TYPE.THERMAL_CAPACITY,
    label: t('studyDetails.@thermal'),
    icon: StdIconId.LocalFireDepartment, //'fire',
    disabled: isTrajectoryAreaLinked,
  },
  {
    id: TRAJECTORY_TYPE.STS,
    panelId: TRAJECTORY_TYPE.STS,
    label: t('studyDetails.@sts'),
    icon: StdIconId.BatteryChargingFull, //'battery-charging-full',
    disabled: true,
  },
  {
    id: TRAJECTORY_TYPE.DSR,
    panelId: TRAJECTORY_TYPE.DSR,
    label: t('studyDetails.@dsr'),
    icon: StdIconId.InkEraser, //'eraser',
    disabled: true,
  },
  {
    id: TRAJECTORY_TYPE.MISC_CAPACITY,
    panelId: TRAJECTORY_TYPE.MISC_CAPACITY,
    label: t('studyDetails.@misc'),
    icon: StdIconId.Category, //'category',
    disabled: true,
  },
  {
    id: TRAJECTORY_TYPE.RES_CAPACITY,
    panelId: TRAJECTORY_TYPE.RES_CAPACITY,
    label: t('studyDetails.@res'),
    icon: StdIconId.EnergySavingsLeaf, //'eco',
    disabled: true,
  },
  {
    id: TRAJECTORY_TYPE.HYDRO_SERIES,
    panelId: TRAJECTORY_TYPE.HYDRO_SERIES,
    label: t('studyDetails.@hydro'),
    icon: StdIconId.Water, //'water',
    disabled: true,
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
 * @param options
 * @return {{area: string, technology?: string, isDefault: boolean} | undefined}
 */
export const getAreaTrajectoryName = (
  rowIdSelected: string,
  data: HypothesisRowData[],
  options?: TechnologyType[],
): HypothesisType | undefined => {
  const [mainIndex, subIndex] = rowIdSelected.split('.').map(Number);
  const hypothesisInfo = {} as { area: string; technology?: string; isDefault: boolean };

  const mainRow = data[mainIndex];
  if (!mainRow?.hypothesis) return;
  if (mainRow.hypothesis) {
    hypothesisInfo.area = mainRow.hypothesis === OTHER_AREAS_LABEL ? OTHER_AREAS : mainRow.hypothesis;
    hypothesisInfo.isDefault = (mainRow.isDefault && mainRow.hypothesis !== OTHER_AREAS_LABEL) ?? false;
  }

  const subRow = mainRow.subRows?.[subIndex];

  if (subRow?.hypothesis) {
    const subRowHypothesis = subRow.hypothesis === OTHER_AREAS_LABEL ? OTHER_AREAS : subRow.hypothesis;
    const option = options ? options.find((opt) => opt.label === subRowHypothesis) : null;
    if (option) {
      hypothesisInfo.technology = option.code;
    } else {
      hypothesisInfo.technology = subRowHypothesis;
    }
    hypothesisInfo.isDefault =
      ((mainRow.isDefault && mainRow.hypothesis !== OTHER_AREAS_LABEL) || subRow.isDefault) ?? false;
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
    isTrajectoryResType(type)
  ) {
    const prefix =
      type === TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER
        ? t('thermal.@specificInformation')
        : t('thermal.@installedPowerInformation');
    const subRowsListLabel = isTrajectoryResType(type) ? subRowsList.map((item) => sentenceCase(item)) : subRowsList;
    return {
      message: `${prefix}: ${subRowsListLabel.join(', ')}`,
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
export const getPathFromTrajectoryType = (type: TRAJECTORY_TYPE, hypothesis?: HypothesisType): string | null => {
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
    case TRAJECTORY_TYPE.HYDRO_SERIES:
      return '\\\\hydro\\series';
    case TRAJECTORY_TYPE.HYDRO_TECHNICAL_PARAMETERS:
      return '\\\\hydro\\technical_parameters';
    case TRAJECTORY_TYPE.HYDRO_PSP_SERIES:
      return '\\\\PSP_virtual\\series';
    case TRAJECTORY_TYPE.HYDRO_PSP_TECHNICAL_PARAMETERS:
      return '\\\\PSP_virtual\\technical_parameters';
    case TRAJECTORY_TYPE.NUCLEAR_FR_MODULATION:
      return '\\\\specific_nuclear\\Modulation';
    case TRAJECTORY_TYPE.NUCLEAR_FR_TALON:
      return '\\\\specific_nuclear\\Talon_nuc';
    case TRAJECTORY_TYPE.NUCLEAR_FR_TS_ERP:
      return '\\\\specific_nuclear\\TS_dispo\\EPR\\';
    case TRAJECTORY_TYPE.NUCLEAR_FR_TS_LONG_TERM:
      return '\\\\specific_nuclear\\TS_dispo';
    case TRAJECTORY_TYPE.NUCLEAR_FR_TS_SMR:
      return '\\\\specific_nuclear\\TS_dispo\\SMR\\';
    default:
      return null;
  }
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

const hasValidTrajectory = (row?: HypothesisRowData) =>
  !!row?.trajectory && row?.status === TRAJECTORY_SELECTION_STATUS.OK;

const hasValidTrajectoryTechnology = (row?: HypothesisRowData) =>
  row?.subRows?.some((subRow) => !!subRow.trajectory && subRow.status === TRAJECTORY_SELECTION_STATUS.OK);

export const getDeletionModalMessage = (type: TRAJECTORY_TYPE, index: number, data: HypothesisRowData[]) => {
  const row = data[index];

  if (type === TRAJECTORY_TYPE.DSR && shouldDeleteCapacityModulation(data, index)) {
    return 'trajectoryDeletionModal.@confirmDeletionCapacityMessage';
  }

  if (type === TRAJECTORY_TYPE.HYDRO_SERIES || type === TRAJECTORY_TYPE.HYDRO_PSP_SERIES) {
    return 'trajectoryDeletionModal.@confirmDeleteHydroMessage';
  }

  if (type === TRAJECTORY_TYPE.THERMAL_CAPACITY) {
    const hasTrajectory = hasValidTrajectory(row);
    const hasTrajectoryTech = hasValidTrajectoryTechnology(row);

    if (hasTrajectory && hasTrajectoryTech) {
      return 'trajectoryDeletionModal.@confirmDeleteMessage';
    }
  }

  return 'trajectoryDeletionModal.@confirmDeletionMessage';
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

export const getUrlApiUploadTrajectory = (
  trajectoryType: TRAJECTORY_TYPE,
  studyId: number,
  trajectoryName: string,
  horizon: string,
  area?: string,
  isCivilYear?: boolean,
  subArea?: string,
) => {
  switch (trajectoryType) {
    case TRAJECTORY_TYPE.LOAD:
      return `${TRAJECTORY_ENDPOINT}/load?area=${area}&trajectoryToUse=${trajectoryName}&horizon=${horizon}&studyId=${studyId}`;
    case TRAJECTORY_TYPE.THERMAL_CAPACITY:
      return `${TRAJECTORY_THERMAL_INSTALLED_POWER_IMPORT}?area=${area}&trajectoryToUse=${trajectoryName}&horizon=${horizon}&studyId=${studyId}&isCivilYear=${isCivilYear}&technology=${subArea ?? ''}`;
    case TRAJECTORY_TYPE.THERMAL_TECHNICAL_COMMON_PARAMETER:
      return `${TRAJECTORY_THERMAL_COMMON_PARAMETER_IMPORT}?trajectoryToUse=${trajectoryName}&horizon=${horizon}&studyId=${studyId}`;
    case TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER:
      return `${TRAJECTORY_THERMAL_SPECIFIC_PARAMETER_IMPORT}?area=${subArea ?? ''}&trajectoryToUse=${trajectoryName}&horizon=${horizon}&studyId=${studyId}`;
    case TRAJECTORY_TYPE.THERMAL_TECHNICAL_MODULATION_PARAMETER:
      return `${TRAJECTORY_THERMAL_MODULATION_PARAMETER_IMPORT}?area=${subArea ?? ''}&trajectoryToUse=${trajectoryName}&horizon=${horizon}&studyId=${studyId}`;
    case TRAJECTORY_TYPE.THERMAL_ECONOMIC_COST_PARAMETER:
      return `${TRAJECTORY_THERMAL_COSTS_PARAMETER_IMPORT}?trajectoryToUse=${trajectoryName}&horizon=${horizon}&studyId=${studyId}`;
    case TRAJECTORY_TYPE.THERMAL_ECONOMIC_PARAMETER:
      return `${TRAJECTORY_THERMAL_ECONOMIC_PARAMETER_IMPORT}?trajectoryToUse=${trajectoryName}&horizon=${horizon}&studyId=${studyId}`;
    case TRAJECTORY_TYPE.STS:
      return `${TRAJECTORY_STS}?area=${area}&technology=${subArea}&trajectoryToUse=${trajectoryName}&horizon=${horizon}&studyId=${studyId}&isCivilYear=${isCivilYear}`;
    case TRAJECTORY_TYPE.DSR:
      return `${TRAJECTORY_DSR_CLUSTER}?area=${area}&trajectoryToUse=${trajectoryName}&horizon=${horizon}&studyId=${studyId}&isCivilYear=${isCivilYear}`;
    case TRAJECTORY_TYPE.DSR_CAPACITY_MODULATION:
      return `${TRAJECTORY_DSR_CAPACITY_MODULATION}?trajectoryToUse=${trajectoryName}&horizon=${horizon}&studyId=${studyId}`;
    case TRAJECTORY_TYPE.MISC_CAPACITY:
      return `${TRAJECTORY_MISC_INSTALLED_POWER}?area=${area}&trajectoryToUse=${trajectoryName}&horizon=${horizon}&studyId=${studyId}&isCivilYear=${isCivilYear}`;
    case TRAJECTORY_TYPE.MISC_LOAD:
      return `${TRAJECTORY_MISC_LOAD_FACTOR}?area=${area}&trajectoryToUse=${trajectoryName}&horizon=${horizon}&studyId=${studyId}`;
    case TRAJECTORY_TYPE.RES_CAPACITY:
      return `${TRAJECTORY_RES_INSTALLED_POWER}?area=${area}&technology=${subArea ?? ''}&trajectoryToUse=${trajectoryName}&horizon=${horizon}&studyId=${studyId}&isCivilYear=${isCivilYear}`;
    case TRAJECTORY_TYPE.RES_LOAD:
      return `${TRAJECTORY_RES_LOAD_FACTOR}?area=${area}&technology=${subArea ? encodeURIComponent(snakeCase(subArea)) : ''}&trajectoryToUse=${trajectoryName}&horizon=${horizon}&studyId=${studyId}`;
    case TRAJECTORY_TYPE.RES_TECHNOLOGY_DISTRIBUTION:
      return `${TRAJECTORY_RES_TECHNOLOGY_DISTRIBUTION}?area=${area}${subArea ? `&technology=${encodeURIComponent(snakeCaseUnderscore(subArea))}` : ''}&trajectoryToUse=${trajectoryName}&horizon=${horizon}&studyId=${studyId}&isCivilYear=${isCivilYear}`;
    case TRAJECTORY_TYPE.RES_ZONAL_DISTRIBUTION:
      return `${TRAJECTORY_RES_ZONAL_DISTRIBUTION}?area=${area}&technology=${subArea ?? ''}&trajectoryToUse=${trajectoryName}&horizon=${horizon}&studyId=${studyId}&isCivilYear=${isCivilYear}`;
    case TRAJECTORY_TYPE.HYDRO_SERIES:
      return `${TRAJECTORY_HYDRO_SERIES}?area=${area}&trajectoryToUse=${trajectoryName}&horizon=${horizon}&studyId=${studyId}&isCivilYear=${isCivilYear}`;
    case TRAJECTORY_TYPE.HYDRO_PSP_SERIES:
      return `${TRAJECTORY_HYDRO_SERIES}?area=${area}&trajectoryToUse=${trajectoryName}&horizon=${horizon}&studyId=${studyId}&isCivilYear=${isCivilYear}&isPsp=true`;
    case TRAJECTORY_TYPE.HYDRO_TECHNICAL_PARAMETERS:
      return `${TRAJECTORY_HYDRO_TECHNICAL_PARAMETERS}?area=${area}&trajectoryToUse=${trajectoryName}&horizon=${horizon}&studyId=${studyId}&isCivilYear=${isCivilYear}`;
    case TRAJECTORY_TYPE.HYDRO_PSP_TECHNICAL_PARAMETERS:
      return `${TRAJECTORY_HYDRO_TECHNICAL_PARAMETERS}?area=${area}&trajectoryToUse=${trajectoryName}&horizon=${horizon}&studyId=${studyId}&isCivilYear=${isCivilYear}&isPsp=true`;
    case TRAJECTORY_TYPE.NUCLEAR_FR_MODULATION:
      return `${TRAJECTORY_NUCLEAR_FR_MODULATION}?area=FR&trajectoryToUse=${trajectoryName}&horizon=${horizon}&studyId=${studyId}&isCivilYear=${isCivilYear}`;
    case TRAJECTORY_TYPE.NUCLEAR_FR_TALON:
      return `${TRAJECTORY_NUCLEAR_FR_TALON}?area=&trajectoryToUse=${trajectoryName}&horizon=${horizon}&studyId=${studyId}&isCivilYear=${isCivilYear}`;
    case TRAJECTORY_TYPE.NUCLEAR_FR_TS_ERP:
      return `${TRAJECTORY_NUCLEAR_TS_EPR}?area=&trajectoryToUse=${trajectoryName}&horizon=${horizon}&studyId=${studyId}&isCivilYear=${isCivilYear}`;
    case TRAJECTORY_TYPE.NUCLEAR_FR_TS_LONG_TERM:
      return `${TRAJECTORY_NUCLEAR_TS_LT}?area=FR&trajectoryToUse=${trajectoryName}&horizon=${horizon}&studyId=${studyId}&isCivilYear=${isCivilYear}`;
    case TRAJECTORY_TYPE.NUCLEAR_FR_TS_SMR:
      return `${TRAJECTORY_NUCLEAR_TS_SMR}?area=&trajectoryToUse=${trajectoryName}&horizon=${horizon}&studyId=${studyId}&isCivilYear=${isCivilYear}`;

    default:
      return `${TRAJECTORY_ENDPOINT}?trajectoryType=${trajectoryType}&trajectoryToUse=${trajectoryName}&horizon=${horizon}&studyId=${studyId}`;
  }
};

export const isEmptyRow = (
  type: TRAJECTORY_TYPE,
  hypothesis: string,
  rowDepth: number,
  t: TFunction<'translation', undefined>,
) =>
  hypothesis === t('thermal.@specific') ||
  hypothesis === t('thermal.@time_series') ||
  ((type === TRAJECTORY_TYPE.STS ||
    type === TRAJECTORY_TYPE.HYDRO_SERIES ||
    type === TRAJECTORY_TYPE.HYDRO_PSP_SERIES) &&
    rowDepth === 0);

export const getItemsMenu = (
  trajectoryType: TRAJECTORY_TYPE,
  t: TFunction<'translation', undefined>,
  defaultAreas: { name: string }[],
) => {
  if (trajectoryType === TRAJECTORY_TYPE.THERMAL_CAPACITY) {
    return [
      {
        id: TRAJECTORY_TYPE.THERMAL_CAPACITY,
        panelId: TRAJECTORY_TYPE.THERMAL_CAPACITY,
        label: t('misc.@installedPower'),
      },
      {
        id: TRAJECTORY_TYPE.THERMAL_PARAMETER,
        panelId: TRAJECTORY_TYPE.THERMAL_PARAMETER,
        label: t('thermal.@parameters'),
      },
      {
        id: TRAJECTORY_TYPE.NUCLEAR_FR_MODULATION,
        panelId: TRAJECTORY_TYPE.NUCLEAR_FR_MODULATION,
        label: t('thermal.@nuclearFR'),
      },
    ];
  } else if (trajectoryType === TRAJECTORY_TYPE.HYDRO_SERIES) {
    return [
      { id: TRAJECTORY_TYPE.HYDRO_SERIES, panelId: TRAJECTORY_TYPE.HYDRO_SERIES, label: t('hydro.@capacity') },
      {
        id: TRAJECTORY_TYPE.HYDRO_PSP_SERIES,
        panelId: TRAJECTORY_TYPE.HYDRO_PSP_SERIES,
        label: t('hydro.@psp_virtual'),
      },
    ];
  } else {
    const itemsTab = [
      { id: trajectoryType, panelId: trajectoryType, label: t('misc.@installedPower') },
      {
        id: trajectoryType === TRAJECTORY_TYPE.RES_CAPACITY ? TRAJECTORY_TYPE.RES_LOAD : TRAJECTORY_TYPE.MISC_LOAD,
        panelId: trajectoryType === TRAJECTORY_TYPE.RES_CAPACITY ? TRAJECTORY_TYPE.RES_LOAD : TRAJECTORY_TYPE.MISC_LOAD,
        label: t('misc.@loadFactor'),
      },
    ];
    if (trajectoryType === TRAJECTORY_TYPE.RES_CAPACITY) {
      defaultAreas.length > 0 &&
        itemsTab.push({
          id: TRAJECTORY_TYPE.RES_ZONAL_DISTRIBUTION,
          panelId: TRAJECTORY_TYPE.RES_ZONAL_DISTRIBUTION,
          label: t('res.@distribution'),
        });
    }
    return itemsTab;
  }
};

export const getModalTile = (tabType: TRAJECTORY_TYPE, hypothesis?: HypothesisType) => {
  const technology =
    isTrajectoryResType(tabType) && hypothesis?.technology
      ? sentenceCase(hypothesis.technology)
      : hypothesis?.technology;
  const area = hypothesis?.area === OTHER_AREAS ? OTHER_AREAS_LABEL : hypothesis?.area;
  return `${area ?? tabType}${technology ? ' - ' : ''}${technology ?? ''}`;
};

export const getFetchParams = (
  type: TRAJECTORY_TYPE,
  indexArray: number[],
  options?: SearchParams,
): { typeToUse: TRAJECTORY_TYPE; areaToUse: string; technology?: string } => {
  let typeToUse = type;
  let areaToUse = options?.area ?? '';
  let technology: string =
    (options?.technologies || []).find((opt) => opt.label === options?.technology)?.code ??
    (options?.technology as string);

  if (type === TRAJECTORY_TYPE.AREA) {
    typeToUse = indexArray[0] === 0 ? TRAJECTORY_TYPE.AREA : TRAJECTORY_TYPE.LINK;
    areaToUse = '';
  }
  if (type === TRAJECTORY_TYPE.DSR) {
    if (options?.isLastIndex) {
      typeToUse = TRAJECTORY_TYPE.DSR_CAPACITY_MODULATION;
      areaToUse = '';
    } else {
      areaToUse = options?.area ?? '';
    }
  }

  if (type === TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER) {
    if (indexArray[0] === 0 && options?.technology) {
      areaToUse = options?.technology;
    } else {
      typeToUse = getTrajectoryTypeByIndex(indexArray[0]);
    }
  }
  if (type === TRAJECTORY_TYPE.THERMAL_ECONOMIC_COST_PARAMETER) {
    if (indexArray[0] === 1) {
      typeToUse = TRAJECTORY_TYPE.THERMAL_ECONOMIC_PARAMETER;
    }
  }
  if (type === TRAJECTORY_TYPE.NUCLEAR_FR_MODULATION) {
    if (indexArray.length === 2) {
      if (indexArray[1] === 0) {
        typeToUse = TRAJECTORY_TYPE.NUCLEAR_FR_TS_ERP;
      }
      if (indexArray[1] === 1) {
        typeToUse = TRAJECTORY_TYPE.NUCLEAR_FR_TS_LONG_TERM;
      }
      if (indexArray[1] === 2) {
        typeToUse = TRAJECTORY_TYPE.NUCLEAR_FR_TS_SMR;
      }
    } else if (indexArray[0] === 1) {
      typeToUse = TRAJECTORY_TYPE.NUCLEAR_FR_TALON;
    }
    technology = '';
    areaToUse = '';
  }
  if (type === TRAJECTORY_TYPE.HYDRO_SERIES) {
    typeToUse = indexArray[1] === 0 ? TRAJECTORY_TYPE.HYDRO_SERIES : TRAJECTORY_TYPE.HYDRO_TECHNICAL_PARAMETERS;
    technology = '';
  }
  if (type === TRAJECTORY_TYPE.HYDRO_PSP_SERIES) {
    typeToUse = indexArray[1] === 0 ? TRAJECTORY_TYPE.HYDRO_PSP_SERIES : TRAJECTORY_TYPE.HYDRO_PSP_TECHNICAL_PARAMETERS;
    technology = '';
  }
  return { typeToUse, areaToUse, technology };
};
