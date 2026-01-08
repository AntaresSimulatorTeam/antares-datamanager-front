import { Dispatch, SetStateAction, useCallback } from 'react';
import { DbTrajectory, HypothesisRowData, StudyActionType, StudyDTO } from '@/shared/types';
import { TRAJECTORY_SELECTION_STATUS, TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { unlinkMultipleTrajectoriesFromStudy, unlinkTrajectoryFromStudy } from '@/shared/services/trajectoryService.ts';
import { STUDY_ACTION } from '@/shared/enum/study.ts';
import { notifyAlert } from '@/shared/notification/notification.tsx';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps.ts';
import { useTranslation } from 'react-i18next';
import {
  collectTrajectoriesRecursively,
  findSpecificTrajectoryToDelete,
  getSpecificTrajectories,
} from '@/shared/helpers/hypothesisTableHelper.ts';
import { sortWithFixedPosition } from '@/shared/utils/sortUtils.ts';

export const useHypothesisTableRemoveRow = (
  study: StudyDTO,
  dispatch: Dispatch<StudyActionType> | null,
  setData: Dispatch<SetStateAction<HypothesisRowData[]>>,
  setCheckedValues: Dispatch<SetStateAction<string[]>>,
) => {
  const { t } = useTranslation();

  const removeRow = useCallback(
    async (type: TRAJECTORY_TYPE, value: string, indexRow: number, data: HypothesisRowData[]) => {
      try {
        const row = data[indexRow];
        if (!row) return;

        let trajectoryIds: number[] = [];
        let trajectoryToDelete: DbTrajectory | null = null;

        // --- CAS 1 : THERMAL SPECIFIC ---
        if (type === TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER) {
          const specificTrajectory = findSpecificTrajectoryToDelete(data[0]?.subRows, value);

          trajectoryToDelete = specificTrajectory;

          const allSpecific = getSpecificTrajectories(data[0]?.subRows);

          const isLastSpecific = allSpecific.length === 1;

          if (specificTrajectory) {
            if (isLastSpecific) {
              const modulation = data[1]?.status === TRAJECTORY_SELECTION_STATUS.OK ? data[1]?.trajectory : null;

              trajectoryIds = [...(modulation ? [modulation.id] : []), specificTrajectory.id];
            } else {
              trajectoryIds = [specificTrajectory.id];
            }
          }

          // --- CAS 2 : AUTRES TYPES (récursif) ---
        } else {
          const allTrajectories = collectTrajectoriesRecursively(row);
          trajectoryIds = allTrajectories.map((trajectory) => trajectory.id);
          trajectoryToDelete = row.trajectory;
        }

        // --- Suppression backend ---
        if (study.id && trajectoryIds.length > 0) {
          if (trajectoryIds.length > 1) {
            await unlinkMultipleTrajectoriesFromStudy(study.id, trajectoryIds);
          } else {
            await unlinkTrajectoryFromStudy(trajectoryIds[0], study.id);
          }
        }

        // --- Mise à jour du store ---
        const area =
          trajectoryToDelete?.area ??
          (type === TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER ? value : row.hypothesis);

        dispatch?.({
          type: STUDY_ACTION.DELETE_TRAJECTORY,
          payload: { area, type },
        });

        // --- Mise à jour du tableau ---
        if (type === TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER) {
          setData((prev) => {
            const newSubRows = prev[0].subRows?.filter((s) => s.hypothesis !== value) ?? [];

            const deletedModulation = trajectoryIds.length > 1;

            if (deletedModulation) {
              return [
                { ...prev[0], subRows: newSubRows },
                { ...prev[1], trajectory: null, status: TRAJECTORY_SELECTION_STATUS.MISSING },
                ...prev.slice(2),
              ];
            }

            return [{ ...prev[0], subRows: newSubRows }, ...prev.slice(1)];
          });
        } else {
          setData(sortWithFixedPosition(data.filter((r) => r.hypothesis !== value)));
        }

        // --- Mise à jour des cases cochées ---
        setCheckedValues((prev) => prev.filter((v) => v !== value));
      } catch (error) {
        notifyAlert({
          icon: StdIconId.Close,
          message: t('studyDetails.@notificationAlert', {
            studyName: study.name,
            trajectoryName: value,
            trajectoryType: data[indexRow]?.hypothesis,
          }),
          content: (error as Error).message,
          type: 'error',
          filledIcon: true,
        });
      }
    },
    [study, dispatch, setData, setCheckedValues, t],
  );

  return { removeRow };
};
