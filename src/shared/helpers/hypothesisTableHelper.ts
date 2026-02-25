import { DbTrajectory, HypothesisRowData, TrajectoryAreaData } from '@/shared/types';
import {
  buildDefaultEmptyTrajectoryList,
  buildRowWithSubRowsData,
  convertIntoHypothesisRowWithTechnologies,
  filterRow,
  generateReadOnlyIndexMap,
  removeDuplicate,
  removeDuplicateByTechnology,
  retrieveReadOnlyArea,
} from '@/shared/utils/trajectoryUtils.ts';
import { TRAJECTORY_SELECTION_STATUS, TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { ReadOnlyObject } from '@common/data/stdTable/types/readOnly.type';
import { DsrUpdateResult } from '@/shared/types/HypothesisTable.ts';
import { getDefaultAreaNotIncludedInAreaList } from '@/shared/utils/hypothesisTableUtils.ts';
import { sortWithFixedPosition } from '@/shared/utils/sortUtils.ts';
import { fetchTrajectoriesFromTypes } from '@/shared/services/hypothesisTableService.ts';
import { getStudyTrajectories } from '@/shared/services/studyService.ts';
import { getThermalTechnologyList } from '@/shared/services/defaultConfigService.ts';
import { STSTechnology } from '@/mocks/data/list/names.ts';
import { TFunction } from 'i18next';

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
 * @param {string} value
 * @return {boolean} True if a trajectory is linked to an area for all trajectory type (expect THERMAL_CAPACITY) or at least two trajectories linked to one area and to one technology
 */
export const shouldOpenDeletionModal = (
  type: TRAJECTORY_TYPE,
  indexRow: number,
  data: HypothesisRowData[],
  value?: string,
): boolean => {
  const row = data[indexRow];
  if (!row) return false;

  const isRowTrajectoryValid = !!row.trajectory && row.status === TRAJECTORY_SELECTION_STATUS.OK;

  const subRowsWithTrajectory = (row.subRows || []).filter(
    (item) =>
      item.trajectory && item.status === TRAJECTORY_SELECTION_STATUS.OK && (!value || item.hypothesis === value),
  );

  switch (type) {
    case TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER:
    case TRAJECTORY_TYPE.STS:
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
  subRows: HypothesisRowData[] | null | undefined,
  value: string,
): DbTrajectory | null => {
  if (!subRows) return null;

  const match = subRows.find(
    (s) => s.hypothesis === value && s.trajectory && s.status === TRAJECTORY_SELECTION_STATUS.OK,
  );

  return match?.trajectory ?? null;
};

export const getInformationMessage = (
  nbRows: number,
  type?: TRAJECTORY_TYPE,
): { messageKey: string; index: number } | null => {
  switch (type) {
    case TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER:
      return { messageKey: 'thermal.@paramModulationMessage', index: 1 };
    case TRAJECTORY_TYPE.DSR:
      return { messageKey: 'dsr.@capacityModulationMessage', index: Math.max(nbRows - 1, 0) };
    default:
      return null;
  }
};

export const computeDsrDataAndReadOnly = (
  prev: HypothesisRowData[],
  nextSortedWithoutLast: HypothesisRowData[],
): DsrUpdateResult<HypothesisRowData> => {
  const lastItem = prev.length > 0 ? prev.at(-1) : undefined;

  const data = lastItem ? [...nextSortedWithoutLast, lastItem] : nextSortedWithoutLast;

  const hasSpecificTrajectory = nextSortedWithoutLast.some((row) => row.status === TRAJECTORY_SELECTION_STATUS.OK);

  const lastIndex = data.length - 1;

  const computeReadOnly = (prevReadOnly: ReadOnlyObject) => {
    const next = { ...prevReadOnly };
    for (const key of Object.keys(next)) {
      if (/^\d+$/.test(key)) delete next[key];
    }

    if (lastIndex >= 0) {
      next[lastIndex] = !hasSpecificTrajectory;
    }

    return next;
  };

  return { data, computeReadOnly };
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
  let dsrCmResult = [];

  if (trajType === TRAJECTORY_TYPE.DSR) {
    const types = [TRAJECTORY_TYPE.DSR, TRAJECTORY_TYPE.DSR_CAPACITY_MODULATION];
    result = await fetchTrajectoriesFromTypes(id, types);

    const dsrCluster = result?.[TRAJECTORY_TYPE.DSR] ?? [];
    dsrCmResult = result?.[TRAJECTORY_TYPE.DSR_CAPACITY_MODULATION] ?? [];

    const defaultEmpty = buildDefaultEmptyTrajectoryList(trajType, dsrCluster, defaultAreas);
    const all = [...dsrCluster, ...emptyAreaSelected, ...defaultEmpty];

    return {
      trajectories: removeDuplicate(all),
      dsrCmResult,
      technologies: null,
    };
  }

  // Other types
  result = await getStudyTrajectories(id, trajType);

  if (trajType === TRAJECTORY_TYPE.THERMAL_CAPACITY) {
    const thermalOptions = await getThermalTechnologyList();
    technologies = thermalOptions.map((t) => t.name);
  }

  if (trajType === TRAJECTORY_TYPE.STS) {
    technologies = STSTechnology;
  }

  const defaultEmpty = buildDefaultEmptyTrajectoryList(trajType, result, defaultAreas);
  const all = [...(result || []), ...emptyAreaSelected, ...defaultEmpty];

  const trajectories =
    trajType === TRAJECTORY_TYPE.THERMAL_CAPACITY || trajType === TRAJECTORY_TYPE.STS
      ? removeDuplicateByTechnology(all)
      : removeDuplicate(all);

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
  dsrCmResult: DbTrajectory[];
}) => {
  const defaultNotIncluded = getDefaultAreaNotIncludedInAreaList(defaultAreas ?? [], areas);

  let rows =
    trajType === TRAJECTORY_TYPE.THERMAL_CAPACITY || trajType === TRAJECTORY_TYPE.STS
      ? convertIntoHypothesisRowWithTechnologies(trajectories, defaultNotIncluded, defaultAreas, technologies ?? [])
      : trajectories
          .map((trajectory) => buildRowWithSubRowsData(trajectory, defaultAreas, defaultNotIncluded, null))
          .filter(Boolean);

  rows = sortWithFixedPosition(isStudyGenerated ? filterRow(rows) : rows);

  if (trajType === TRAJECTORY_TYPE.DSR) {
    const hasCm = dsrCmResult.length > 0;
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

  const hasSpecificTrajectory = rows.some((row) => row.status === TRAJECTORY_SELECTION_STATUS.OK);

  return {
    ...readOnlySubRows,
    [rows.length - 1]: !hasSpecificTrajectory,
  };
};
