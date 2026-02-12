import { DbTrajectory, HypothesisRowData, TrajectoryAreaData } from '@/shared/types';
import { retrieveReadOnlyArea } from '@/shared/utils/trajectoryUtils.ts';
import { TRAJECTORY_SELECTION_STATUS, TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { ReadOnlyObject } from '@common/data/stdTable/types/readOnly.type';
import { DsrUpdateResult } from '@/shared/types/HypothesisTable.ts';

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
