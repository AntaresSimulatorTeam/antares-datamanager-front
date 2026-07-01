import {
  DbTrajectory,
  FetchResult,
  HypothesisRowData,
  isTrajectoryHydroType,
  isTrajectoryNuclearType,
  isTrajectoryResType,
  isTrajectorySubrowsType,
  TrajectoryAreaData,
} from '@/shared/types';
import {
  buildDefaultEmptyTrajectoryList,
  convertIntoHypothesisRowWithTechnologies,
  filterRow,
  generateReadOnlyIndexMap,
  getTrajectoryTypeByIndex,
  removeDuplicate,
  removeDuplicateByTechnology,
  retrieveReadOnlyArea,
  setNestedData,
} from '@/shared/utils/trajectoryUtils.ts';
import { TRAJECTORY_SELECTION_STATUS, TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { ReadOnlyObject } from '@common/data/stdTable/types/readOnly.type';
import { getDefaultAreaNotIncludedInAreaList } from '@/shared/utils/hypothesisTableUtils.ts';
import { fetchTrajectoriesFromTypes } from '@/shared/services/hypothesisTableService.ts';
import { getStudyTrajectories } from '@/shared/services/studyService.ts';
import { getThermalTechnologyList } from '@/shared/services/defaultConfigService.ts';
import { HydroSubRows, STSTechnology } from '@/mocks/data/list/names.ts';
import { TFunction } from 'i18next';
import { sortWithFixedPosition } from '@/shared/utils/sortUtils.ts';
import { getResTechnologyList, isParamModulationRequired } from '@/shared/services/trajectoryService.ts';
import { HypothesisType } from '@/shared/types/HypothesisTable.ts';

/**
 * Retrieve read only row of a study generated
 * @param {HypothesisRowData[]} rows
 * @return {ReadOnlyObject}
 */
export const getReadOnlyForGeneratedStudy = (rows: HypothesisRowData[]): ReadOnlyObject => {
  const areaWithoutTrajectory = rows
    .map((row) => (row.trajectory == null ? row.hypothesis : null))
    .filter(Boolean) as string[];
  return retrieveReadOnlyArea(rows, areaWithoutTrajectory);
};

/**
 * Return boolean to indicate if the deletion modal should open
 * @param {TRAJECTORY_TYPE} type
 * @param {number} indexRow - index of the paren row
 * @param {HypothesisRowData[]} data
 * @param hypothesis
 * @return {boolean} True if a trajectory is linked to an area for all trajectory type (expect THERMAL_CAPACITY) or at least two trajectories linked to one area and to one technology
 */
export const shouldOpenDeletionModal = (
  type: TRAJECTORY_TYPE,
  indexRow: number,
  data: HypothesisRowData[],
  hypothesis?: string,
): boolean => {
  const row = data[indexRow];
  if (!row) return false;

  const isRowTrajectoryValid = !!row.trajectory && row.status === TRAJECTORY_SELECTION_STATUS.OK;

  const subRowsWithTrajectory = (row.subRows || []).filter(
    (item) =>
      item.trajectory &&
      item.status === TRAJECTORY_SELECTION_STATUS.OK &&
      (!hypothesis || item.hypothesis === hypothesis),
  );

  switch (type) {
    case TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER:
    case TRAJECTORY_TYPE.STS:
    case TRAJECTORY_TYPE.RES_CAPACITY:
    case TRAJECTORY_TYPE.RES_LOAD:
    case TRAJECTORY_TYPE.HYDRO_SERIES:
    case TRAJECTORY_TYPE.HYDRO_PSP_SERIES:
      return subRowsWithTrajectory.length > 0;
    case TRAJECTORY_TYPE.THERMAL_CAPACITY:
      return isRowTrajectoryValid && subRowsWithTrajectory.length > 0;
    default:
      return isRowTrajectoryValid;
  }
};

/**
 *
 * @param {HypothesisRowData[]} data
 * @param {TrajectoryAreaData[]} areas
 * @param {{name: string}[]} defaultAreas
 */
export const getCheckedValues = (
  data: HypothesisRowData[],
  areas: TrajectoryAreaData[],
  defaultAreas: { name: string }[],
) =>
  data
    ?.map((trajectory) => {
      if (
        areas.some((area) => area.areaName === trajectory.hypothesis) ||
        defaultAreas.some((defaultArea) => defaultArea.name === trajectory.hypothesis)
      ) {
        return trajectory.hypothesis;
      }
    })
    .filter(Boolean) as string[];

export const collectTrajectoriesRecursively = (row: HypothesisRowData): DbTrajectory[] => {
  const result: DbTrajectory[] = [];

  if (row.trajectory && row.status === TRAJECTORY_SELECTION_STATUS.OK) {
    result.push(row.trajectory);
  }

  if (row.subRows?.length) {
    for (const sub of row.subRows) {
      result.push(...collectTrajectoriesRecursively(sub));
    }
  }

  return result;
};

export const getSpecificTrajectories = (subRows?: HypothesisRowData[] | null): DbTrajectory[] => {
  if (!subRows) return [];

  return subRows.filter((s) => s.trajectory && s.status === TRAJECTORY_SELECTION_STATUS.OK).map((s) => s.trajectory!);
};

export const findSpecificTrajectoryToDelete = (
  rows: HypothesisRowData[] | null | undefined,
  value: string,
): DbTrajectory | null => {
  if (!rows) return null;

  const match = rows.find((s) => s.hypothesis === value && s.trajectory && s.status === TRAJECTORY_SELECTION_STATUS.OK);

  return match?.trajectory ?? null;
};

export const getInformationMessage = (
  nbRows: number,
  type: TRAJECTORY_TYPE,
  rowId: string,
  trajectory: DbTrajectory | null,
): { messageKey: string; id: string } | null => {
  switch (type) {
    case TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER:
      return { messageKey: 'thermal.@paramModulationMessage', id: '1' };
    case TRAJECTORY_TYPE.DSR:
      return { messageKey: 'dsr.@capacityModulationMessage', id: String(Math.max(nbRows - 1, 0)) };
    case TRAJECTORY_TYPE.HYDRO_PSP_SERIES:
    case TRAJECTORY_TYPE.HYDRO_SERIES:
      return (!trajectory && rowId?.split('.')[1] === '1') ||
        trajectory?.type === TRAJECTORY_TYPE.HYDRO_TECHNICAL_PARAMETERS ||
        trajectory?.type === TRAJECTORY_TYPE.HYDRO_PSP_TECHNICAL_PARAMETERS
        ? { messageKey: 'hydro.@informationMessage', id: rowId }
        : null;
    default:
      return null;
  }
};

export interface ComputeDsrResult {
  data: HypothesisRowData[];
  readOnlyPatch: ReadOnlyObject;
}

/**
 * Recalcule le tableau DSR après ajout/suppression d’une ligne
 * et génère un patch readOnly à fusionner avec l’état existant.
 */
export interface ComputeDsrResult {
  data: HypothesisRowData[];
  readOnlyPatch: ReadOnlyObject;
  indexesToClear: number[];
}

export const computeDsrDataAndReadOnly = (
  prev: HypothesisRowData[],
  sortedSpecific: HypothesisRowData[],
): ComputeDsrResult => {
  const modulationRow = prev[prev.length - 1];
  const oldModulationIndex = prev.length - 1;

  const data = [...sortedSpecific, modulationRow];
  const newModulationIndex = data.length - 1;

  const readOnlyPatch: ReadOnlyObject = {};
  const indexesToClear: number[] = [];

  indexesToClear.push(oldModulationIndex);
  const specificRows = sortedSpecific.filter(
    (row) => row.status === TRAJECTORY_SELECTION_STATUS.OK && row.trajectory?.type === TRAJECTORY_TYPE.DSR,
  );
  const hasTimeSeries = specificRows.some((row) => row.trajectory?.hasTimeSeries === true);

  // readOnly = true si :
  // - aucune trajectoire spécifique
  // - OU au moins une trajectoire spécifique avec hasTimeSeries = true
  readOnlyPatch[newModulationIndex] = specificRows.length === 0 || !hasTimeSeries;

  return { data, readOnlyPatch, indexesToClear };
};

export const fetchAndNormalizeTrajectories = async ({
  id,
  trajType,
  defaultAreas,
  emptyAreaSelected,
}: {
  id: number;
  trajType: TRAJECTORY_TYPE;
  defaultAreas?: { name: string }[];
  emptyAreaSelected: DbTrajectory[];
}) => {
  let result;
  let technologies;
  let dsrCluster;
  let dsrCmResult = [];

  if (trajType === TRAJECTORY_TYPE.DSR) {
    const types = [TRAJECTORY_TYPE.DSR, TRAJECTORY_TYPE.DSR_CAPACITY_MODULATION];
    result = await fetchTrajectoriesFromTypes(id, types);
    dsrCluster = result?.[TRAJECTORY_TYPE.DSR] ?? [];
    dsrCmResult = result?.[TRAJECTORY_TYPE.DSR_CAPACITY_MODULATION] ?? [];

    const defaultEmpty = buildDefaultEmptyTrajectoryList(trajType, dsrCluster, defaultAreas);
    const all = [...(dsrCluster || []), ...(emptyAreaSelected || []), ...(defaultEmpty || [])];

    return {
      trajectories: removeDuplicate(all),
      dsrCmResult,
      technologies: null,
    };
  }

  // Other types
  result = await getStudyTrajectories(id, trajType);

  if (trajType === TRAJECTORY_TYPE.THERMAL_CAPACITY) {
    technologies = await getThermalTechnologyList();
  }

  if (trajType === TRAJECTORY_TYPE.STS) {
    technologies = STSTechnology;
  }

  if (isTrajectoryResType(trajType)) {
    technologies = await getResTechnologyList();
  }

  if (isTrajectoryHydroType(trajType)) {
    technologies = HydroSubRows;
  }

  let defaultEmpty: DbTrajectory[] = [];
  if (!isTrajectoryNuclearType(trajType)) {
    defaultEmpty = buildDefaultEmptyTrajectoryList(trajType, result, defaultAreas);
  }

  const all = [...(result || []), ...emptyAreaSelected, ...(defaultEmpty || [])];

  const trajectories = isTrajectorySubrowsType(trajType) ? removeDuplicateByTechnology(all) : removeDuplicate(all);

  return {
    trajectories,
    dsrCmResult: [],
    technologies,
  };
};

export const buildPayload = (trajType: TRAJECTORY_TYPE, trajectories: DbTrajectory[], dsrCmResult: DbTrajectory[]) => ({
  [trajType]: { trajectories },
  ...(dsrCmResult.length > 0 && {
    [TRAJECTORY_TYPE.DSR_CAPACITY_MODULATION]: {
      trajectories: dsrCmResult,
    },
  }),
});

export const buildHypothesisRows = ({
  trajType,
  trajectories,
  defaultAreas,
  areas,
  technologies,
  isStudyGenerated,
  t,
  dsrCmResult,
}: {
  trajType: TRAJECTORY_TYPE;
  trajectories: DbTrajectory[];
  defaultAreas: { name: string }[] | undefined;
  areas: TrajectoryAreaData[];
  technologies?: string[] | null;
  isStudyGenerated?: boolean;
  t: TFunction<'translation', undefined>;
  dsrCmResult?: DbTrajectory[] | null;
}) => {
  const defaultNotIncluded = getDefaultAreaNotIncludedInAreaList(defaultAreas ?? [], areas);

  let rows = convertIntoHypothesisRowWithTechnologies(
    trajectories,
    defaultNotIncluded,
    defaultAreas,
    technologies ?? [],
    trajType,
  );

  rows = sortWithFixedPosition(isStudyGenerated ? filterRow(rows) : rows);

  if (trajType === TRAJECTORY_TYPE.DSR) {
    const hasCm = !!dsrCmResult?.length;
    rows.push({
      hypothesis: t('dsr.@capacityModulation'),
      trajectory: hasCm ? dsrCmResult[0] : null,
      status: hasCm ? TRAJECTORY_SELECTION_STATUS.OK : TRAJECTORY_SELECTION_STATUS.MISSING,
      isDefault: false,
      isDeletable: false,
      subRows: null,
    });
  }

  return rows;
};

export const getNuclearHypothesisLabel = (type: TRAJECTORY_TYPE, t: TFunction<'translation', undefined>) => {
  switch (type) {
    case TRAJECTORY_TYPE.NUCLEAR_FR_TS_ERP:
      return t('thermal.@epr');
    case TRAJECTORY_TYPE.NUCLEAR_FR_TS_LONG_TERM:
      return t('thermal.@long_term');
    default:
      return t('thermal.@smr');
  }
};

export const buildRowsByType = ({
  rowTypes,
  subRowTypes,
  trajectoriesByType,
  t,
}: {
  rowTypes: TRAJECTORY_TYPE[];
  subRowTypes: TRAJECTORY_TYPE[];
  trajectoriesByType: FetchResult[];
  t: TFunction<'translation', undefined>;
}): HypothesisRowData[] => {
  const parentRows: HypothesisRowData[] = rowTypes.map((type) => {
    const trajectory =
      trajectoriesByType?.find((trajectoryByType) => trajectoryByType.trajType === type)?.trajectories?.[0] ?? null;
    return {
      hypothesis: type === TRAJECTORY_TYPE.NUCLEAR_FR_MODULATION ? t('thermal.@modulation') : t('thermal.@talon'),
      trajectory,
      status: trajectory ? TRAJECTORY_SELECTION_STATUS.OK : TRAJECTORY_SELECTION_STATUS.MISSING,
      isDefault: false,
      isDeletable: false,
      subRows: null,
    };
  });
  const subRows: HypothesisRowData[] = subRowTypes.map((type) => {
    const trajectory =
      trajectoriesByType?.find((trajectoryByType) => trajectoryByType.trajType === type)?.trajectories?.[0] ?? null;
    return {
      hypothesis: getNuclearHypothesisLabel(type, t),
      trajectory,
      status: trajectory ? TRAJECTORY_SELECTION_STATUS.OK : TRAJECTORY_SELECTION_STATUS.MISSING,
      isDefault: false,
      isDeletable: false,
      subRows: null,
    };
  });

  parentRows.push({
    hypothesis: t('thermal.@time_series'),
    trajectory: null,
    status: TRAJECTORY_SELECTION_STATUS.MISSING,
    isDefault: false,
    isDeletable: false,
    subRows,
  });
  return parentRows;
};

export const getHypothesisLabel = (type: TRAJECTORY_TYPE, t: TFunction<'translation', undefined>) => {
  switch (type) {
    case TRAJECTORY_TYPE.HYDRO_TECHNICAL_PARAMETERS:
    case TRAJECTORY_TYPE.HYDRO_PSP_TECHNICAL_PARAMETERS:
      return t('thermal.@parametersTechnical');
    case TRAJECTORY_TYPE.HYDRO_SERIES:
    case TRAJECTORY_TYPE.HYDRO_PSP_SERIES:
    default:
      return t('hydro.@series');
  }
};

export const buildRowsByArea = ({
  areas,
  subRowTypes,
  trajectoriesByType,
  t,
}: {
  areas: string[];
  subRowTypes: TRAJECTORY_TYPE[];
  trajectoriesByType: FetchResult[];
  t: TFunction<'translation', undefined>;
}): HypothesisRowData[] =>
  areas.map((area) => ({
    hypothesis: area,
    trajectory: null,
    status: TRAJECTORY_SELECTION_STATUS.MISSING,
    isDefault: false,
    isDeletable: false,
    subRows: subRowTypes.map((type) => {
      const trajectory =
        trajectoriesByType?.find((trajectoryByType) => trajectoryByType.trajType === type)?.trajectories?.[0] ?? null;
      const hypothesisLabel = getHypothesisLabel(type, t);
      return {
        hypothesis: hypothesisLabel,
        trajectory,
        status: trajectory?.trajectoryName ? TRAJECTORY_SELECTION_STATUS.OK : TRAJECTORY_SELECTION_STATUS.MISSING,
        isDefault: false,
        isDeletable: false,
        subRows: null,
      };
    }),
  }));

export const buildReadOnlyMap = ({
  rows,
  trajType,
  isStudyGenerated,
  defaultAreaListNotInList,
}: {
  rows: HypothesisRowData[];
  trajType: TRAJECTORY_TYPE;
  isStudyGenerated?: boolean;
  defaultAreaListNotInList: string[];
}) => {
  if (isStudyGenerated) {
    return generateReadOnlyIndexMap(rows);
  }

  // Appel correct avec les deux arguments
  const readOnlySubRows = retrieveReadOnlyArea(rows, defaultAreaListNotInList);

  if (trajType !== TRAJECTORY_TYPE.DSR) {
    return readOnlySubRows;
  }

  const hasSpecificTrajectory = rows.some(
    (row) => row.status === TRAJECTORY_SELECTION_STATUS.OK && row.trajectory?.hasTimeSeries,
  );

  return {
    ...readOnlySubRows,
    [rows.length - 1]: !hasSpecificTrajectory,
  };
};

export interface RowDeletionParams {
  type: TRAJECTORY_TYPE;
  data: HypothesisRowData[];
  hypothesis: string;
  trajectoryIds: number[];
  studyId: number;
  horizon: string;
}

export interface RowDeletionResult {
  newData: HypothesisRowData[];
  newReadOnly?: ReadOnlyObject;
  indexesToClear?: number[];
}

export const updateTableAfterRowDeletion = async ({
  type,
  data,
  hypothesis,
  trajectoryIds,
  studyId,
  horizon,
}: RowDeletionParams): Promise<RowDeletionResult> => {
  // THERMAL SPECIFIC (comme dans removeRow)
  if (type === TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER) {
    const newSubRows = data[0].subRows?.filter((s) => s.hypothesis !== hypothesis) ?? [];

    const deletedModulation = trajectoryIds.length > 1;

    let newData: HypothesisRowData[];

    if (deletedModulation) {
      newData = [
        { ...data[0], subRows: newSubRows },
        {
          ...data[1],
          trajectory: null,
          status: TRAJECTORY_SELECTION_STATUS.MISSING,
        },
        ...data.slice(2),
      ];
    } else {
      newData = [{ ...data[0], subRows: newSubRows }, ...data.slice(1)];
    }

    const isRequired = await isParamModulationRequired(studyId, horizon);

    return {
      newData,
      newReadOnly: { ['1']: !isRequired },
    };
  }

  // DSR (comme dans removeRow : on filtre + sort, pas de nested)
  if (type === TRAJECTORY_TYPE.DSR) {
    const rest = data.slice(0, -1);
    const filtered = rest.filter((r) => r.hypothesis !== hypothesis);
    const sorted = sortWithFixedPosition(filtered);
    const { data: updatedData, readOnlyPatch, indexesToClear } = computeDsrDataAndReadOnly(data, sorted);
    return { newData: updatedData, newReadOnly: readOnlyPatch, indexesToClear };
  }

  // Cas générique
  const filtered = data.filter((r) => r.hypothesis !== hypothesis);
  return { newData: sortWithFixedPosition(filtered) };
};

export interface CellDetachParams {
  type: TRAJECTORY_TYPE;
  data: HypothesisRowData[];
  additionalTrajectory: DbTrajectory | null;
  indexArray: number[];
  studyId: number;
  horizon: string;
}

export interface CellDetachResult {
  newData: HypothesisRowData[];
  newReadOnly?: ReadOnlyObject;
}

export const updateTableAfterCellDetach = async ({
  type,
  data,
  additionalTrajectory,
  indexArray,
  studyId,
  horizon,
}: CellDetachParams): Promise<CellDetachResult> => {
  const empty = {
    trajectory: null,
    status: TRAJECTORY_SELECTION_STATUS.MISSING,
  };

  // THERMAL SPECIFIC (comme dans detachTrajectory)
  if (type === TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER) {
    let baseData = data;

    if (additionalTrajectory?.type === TRAJECTORY_TYPE.THERMAL_TECHNICAL_MODULATION_PARAMETER) {
      baseData = [{ ...data[0] }, { ...data[1], ...empty }, ...data.slice(2)];
    }

    const newData = setNestedData(baseData, indexArray, empty);
    const isRequired = await isParamModulationRequired(studyId, horizon);

    return {
      newData,
      newReadOnly: { ['1']: !isRequired },
    };
  }

  // DSR (comme dans detachTrajectory)
  if (type === TRAJECTORY_TYPE.DSR) {
    let baseData = data;
    if (additionalTrajectory?.type === TRAJECTORY_TYPE.DSR_CAPACITY_MODULATION) {
      const lastIndex = Math.max(0, data?.length - 1);
      baseData = [...data.slice(0, lastIndex), { ...data[lastIndex], ...empty }];
    }
    const updated = setNestedData(baseData, indexArray, empty);
    const specific = updated.slice(0, -1);
    const sortedSpecific = sortWithFixedPosition(specific);
    // 4. On applique la logique DSR complète
    const { data: newData, readOnlyPatch } = computeDsrDataAndReadOnly(updated, sortedSpecific);

    return {
      newData,
      newReadOnly: readOnlyPatch,
    };
  }

  if (type === TRAJECTORY_TYPE.AREA) {
    const hasLinks = indexArray[0] === 0 && data[1]?.trajectory;
    const newData = data.map((item, index) =>
      index === indexArray[0] || hasLinks
        ? {
            ...item,
            trajectory: null,
            status: TRAJECTORY_SELECTION_STATUS.MISSING,
          }
        : item,
    );
    return {
      newData,
      newReadOnly: { '0': false, '1': indexArray[0] === 0 },
    };
  }

  // Cas générique nested
  const newData = setNestedData(data, indexArray, empty);
  return { newData };
};

export const getParamForFetchFSTrajectory = (
  type: TRAJECTORY_TYPE,
  indexArray: number[],
  rowsNb: number,
  hypothesis?: HypothesisType,
) => {
  let typeToUse = type;
  let areaToUse = hypothesis?.area;
  let isDefaultArea = hypothesis?.isDefault ?? false;
  const isLastIndex = indexArray[0] === Math.max(rowsNb - 1, 0);

  if (type === TRAJECTORY_TYPE.AREA) {
    typeToUse = indexArray[0] === 0 ? TRAJECTORY_TYPE.AREA : TRAJECTORY_TYPE.LINK;
    areaToUse = '';
  }
  if (type === TRAJECTORY_TYPE.DSR) {
    if (isLastIndex) {
      typeToUse = TRAJECTORY_TYPE.DSR_CAPACITY_MODULATION;
    }
    areaToUse = '';
    isDefaultArea = false;
  }
  if (type === TRAJECTORY_TYPE.STS && hypothesis?.technology) {
    areaToUse = hypothesis?.technology;
  }
  if (type === TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER) {
    if (indexArray[0] === 0 && hypothesis?.technology) {
      areaToUse = hypothesis?.technology;
    } else {
      typeToUse = getTrajectoryTypeByIndex(indexArray[0]);
      areaToUse = '';
    }
  }
  if (type === TRAJECTORY_TYPE.THERMAL_ECONOMIC_COST_PARAMETER) {
    if (indexArray[0] === 1) {
      typeToUse = TRAJECTORY_TYPE.THERMAL_ECONOMIC_PARAMETER;
    }
    areaToUse = '';
  }
  if (type === TRAJECTORY_TYPE.HYDRO_SERIES) {
    typeToUse = indexArray[1] === 0 ? TRAJECTORY_TYPE.HYDRO_SERIES : TRAJECTORY_TYPE.HYDRO_TECHNICAL_PARAMETERS;
    areaToUse = '';
  }
  if (type === TRAJECTORY_TYPE.HYDRO_PSP_SERIES) {
    typeToUse = indexArray[1] === 0 ? TRAJECTORY_TYPE.HYDRO_PSP_SERIES : TRAJECTORY_TYPE.HYDRO_PSP_TECHNICAL_PARAMETERS;
    areaToUse = '';
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
    areaToUse = '';
  }
  return { typeToUse, areaToUse, isDefaultArea };
};
