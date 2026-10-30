import { useCallback } from 'react';
import {
  collectTrajectoriesRecursively,
  findSpecificTrajectoryToDelete,
  getSpecificTrajectories,
} from '@/shared/helpers/hypothesisTableHelper.ts';
import { TRAJECTORY_SELECTION_STATUS, TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { shouldDeleteCapacityModulation } from '@/shared/utils/trajectoryUtils.ts';
import { unlinkMultipleTrajectoriesFromStudy, unlinkTrajectoryFromStudy } from '@/shared/services/trajectoryService.ts';
import { DbTrajectory, HypothesisRowData, RowStatus, StudyDTO } from '@/shared/types';

/**
 * Structure de retour de computeDeletion
 */
export interface DeletionResult {
  trajectoryIds: number[];
  trajectoryToDelete: DbTrajectory | null;
  additionalTrajectory: DbTrajectory | null;
}

const resolveTargetRow = (
  data: HypothesisRowData[],
  indexRow: number | null,
  indexArray: number[] | null,
): HypothesisRowData => {
  const rowIndex = indexRow ?? indexArray?.[0];
  if (rowIndex == null) {
    throw new Error('computeDeletion: indexRow and indexArray are both null. One must be provided.');
  }
  return data[rowIndex]?.subRows && indexArray?.length === 2
    ? data[rowIndex].subRows[indexArray[1]]
    : data[rowIndex];
};

const computeLinkDeletion = (data: HypothesisRowData[], secondData?: HypothesisRowData[]): DeletionResult => {
  const link = data[1]?.status === TRAJECTORY_SELECTION_STATUS.OK ? data[1]?.trajectory : null;
  if (!link) {
    return { trajectoryIds: [], trajectoryToDelete: null, additionalTrajectory: null };
  }

  const flowbased = secondData?.[1]?.status === TRAJECTORY_SELECTION_STATUS.OK ? secondData[1]?.trajectory : null;

  return {
    trajectoryToDelete: link,
    additionalTrajectory: flowbased,
    trajectoryIds: flowbased ? [link.id, flowbased.id] : [link.id],
  };
};

const computeThermalDeletion = (data: HypothesisRowData[], hypothesis: string): DeletionResult => {
  const specific = findSpecificTrajectoryToDelete(data[0]?.subRows, hypothesis);
  if (!specific) {
    return { trajectoryIds: [], trajectoryToDelete: null, additionalTrajectory: null };
  }

  const allSpecific = getSpecificTrajectories(data[0]?.subRows);
  const isLastSpecific = allSpecific?.length === 1;
  const modulation =
    isLastSpecific && data[1]?.status === TRAJECTORY_SELECTION_STATUS.OK ? data[1]?.trajectory : null;

  return {
    trajectoryToDelete: specific,
    additionalTrajectory: modulation,
    trajectoryIds: modulation ? [modulation.id, specific.id] : [specific.id],
  };
};

const computeDsrDeletion = (
  data: HypothesisRowData[],
  indexArray: number[] | null,
  hypothesis: string,
): DeletionResult => {
  const specific = findSpecificTrajectoryToDelete(data, hypothesis);
  if (!specific) {
    return { trajectoryIds: [], trajectoryToDelete: null, additionalTrajectory: null };
  }

  const lastIndex = data?.length - 1;
  const shouldDeleteModulation = Boolean(indexArray && shouldDeleteCapacityModulation(data, indexArray[0]));
  const modulation =
    shouldDeleteModulation && data[lastIndex]?.status === TRAJECTORY_SELECTION_STATUS.OK
      ? data[lastIndex]?.trajectory
      : null;

  return {
    trajectoryToDelete: specific,
    additionalTrajectory: modulation,
    trajectoryIds: modulation ? [modulation.id, specific.id] : [specific.id],
  };
};

const computeAreaMeDeletion = (
  data: HypothesisRowData[],
  indexRow: number | null,
  indexArray: number[] | null,
): DeletionResult => {
  const allTrajectories = data.flatMap((row) => collectTrajectoriesRecursively(row));
  const row = resolveTargetRow(data, indexRow, indexArray);

  return {
    trajectoryIds: allTrajectories.map((t) => t.id),
    trajectoryToDelete: row?.trajectory ?? null,
    additionalTrajectory: null,
  };
};

const computeGenericDeletion = (
  data: HypothesisRowData[],
  indexRow: number | null,
  indexArray: number[] | null,
  status?: RowStatus,
): DeletionResult => {
  const row = resolveTargetRow(data, indexRow, indexArray);
  let trajectoryIds = [];
  if (status === 'empty') {
    trajectoryIds = row?.trajectory?.id ? [row.trajectory.id] : [];
  } else {
    trajectoryIds = collectTrajectoriesRecursively(row).map((t) => t.id);
  }

  return {
    trajectoryIds,
    trajectoryToDelete: row?.trajectory ?? null,
    additionalTrajectory: null,
  };
};

/**
 * Hook factorisant toute la logique de suppression/détachement de trajectoires
 */
export const useTrajectoryDeletionLogic = (study: StudyDTO) => {
  /**
   * Détermine quelles trajectoires doivent être supprimées selon :
   * - le type (THERMAL, DSR, générique)
   * - la ligne ou cellule ciblée
   * - l'hypothèse
   */
  const computeDeletion = useCallback(
    (
      type: TRAJECTORY_TYPE,
      data: HypothesisRowData[],
      indexRow: number | null,
      indexArray: number[] | null,
      hypothesis: string,
      status?: RowStatus,
      secondData?: HypothesisRowData[],
    ): DeletionResult => {
      switch (type) {
        case TRAJECTORY_TYPE.LINK:
          return computeLinkDeletion(data, secondData);
        case TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER:
          return computeThermalDeletion(data, hypothesis);
        case TRAJECTORY_TYPE.DSR:
          return computeDsrDeletion(data, indexArray, hypothesis);
        case TRAJECTORY_TYPE.AREA_ME:
          return computeAreaMeDeletion(data, indexRow, indexArray);
        default:
          return computeGenericDeletion(data, indexRow, indexArray, status);
      }
    },
    [],
  );

  /**
   * Supprime les trajectoires côté backend
   */
  const performBackendDeletion = useCallback(
    async (trajectoryIds: number[]) => {
      if (!study.id || trajectoryIds?.length === 0) return;
      if (trajectoryIds?.length > 1) {
        await unlinkMultipleTrajectoriesFromStudy(study.id, trajectoryIds);
      } else {
        await unlinkTrajectoryFromStudy(trajectoryIds[0], study.id);
      }
    },
    [study.id],
  );

  return { computeDeletion, performBackendDeletion };
};
