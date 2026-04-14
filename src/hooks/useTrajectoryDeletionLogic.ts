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
    ): DeletionResult => {
      let trajectoryIds: number[] = [];
      let trajectoryToDelete: DbTrajectory | null = null;
      let additionalTrajectory: DbTrajectory | null = null;

      // --- Cas THERMAL SPECIFIC ---
      if (type === TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER) {
        const specific = findSpecificTrajectoryToDelete(data[0]?.subRows, hypothesis);
        trajectoryToDelete = specific;

        const allSpecific = getSpecificTrajectories(data[0]?.subRows);
        const isLastSpecific = allSpecific?.length === 1;

        if (specific) {
          if (isLastSpecific) {
            const modulation = data[1]?.status === TRAJECTORY_SELECTION_STATUS.OK ? data[1]?.trajectory : null;

            additionalTrajectory = modulation;

            trajectoryIds = [...(modulation ? [modulation.id] : []), specific.id];
          } else {
            trajectoryIds = [specific.id];
          }
        }
      }

      // --- Cas DSR ---
      else if (type === TRAJECTORY_TYPE.DSR) {
        const specific = findSpecificTrajectoryToDelete(data, hypothesis);
        trajectoryToDelete = specific;

        const lastIndex = data?.length - 1;

        if (specific) {
          if (indexArray && shouldDeleteCapacityModulation(data, indexArray[0])) {
            const modulation =
              data[lastIndex]?.status === TRAJECTORY_SELECTION_STATUS.OK ? data[lastIndex]?.trajectory : null;

            additionalTrajectory = modulation;

            trajectoryIds = [...(modulation ? [modulation.id] : []), specific.id];
          } else {
            trajectoryIds = [specific.id];
          }
        }
      }
      // --- Cas générique ---
      else {
        const rowIndex = indexRow ?? indexArray?.[0];

        if (rowIndex == null) {
          throw new Error('computeDeletion: indexRow and indexArray are both null. One must be provided.');
        }

        const row =
          data[rowIndex].subRows && indexArray?.length == 2 ? data[rowIndex].subRows[indexArray[1]] : data[rowIndex];
        if (status === 'empty') {
          trajectoryIds = row?.trajectory?.id ? [row.trajectory.id] : [];
        } else {
          const allTrajectories = collectTrajectoriesRecursively(row);
          trajectoryIds = allTrajectories.map((t) => t.id);
        }
        trajectoryToDelete = row.trajectory;
      }
      return { trajectoryIds, trajectoryToDelete, additionalTrajectory };
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
