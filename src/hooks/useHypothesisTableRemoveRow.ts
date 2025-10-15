import { Dispatch, SetStateAction, useCallback } from 'react';
import { HypothesisRowData, StudyActionType, StudyDTO } from '@/shared/types';
import { TRAJECTORY_SELECTION_STATUS, TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { unlinkMultipleTrajectoriesFromStudy, unlinkTrajectoryFromStudy } from '@/shared/services/trajectoryService.ts';
import { STUDY_ACTION } from '@/shared/enum/study.ts';
import { sortWithFixedPosition } from '@/shared/utils/sortUtils.ts';
import { notifyAlert } from '@/shared/notification/notification.tsx';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps.ts';
import { useTranslation } from 'react-i18next';

export const useHypothesisTableRemoveRow = (
  study: StudyDTO,
  dispatch: Dispatch<StudyActionType> | null,
  setData: Dispatch<SetStateAction<HypothesisRowData[]>>,
  setCheckedValues: Dispatch<SetStateAction<string[]>>,
) => {
  const { t } = useTranslation();

  const removeRow = useCallback(
    async (type: TRAJECTORY_TYPE, value: string, indexRow: number, data: HypothesisRowData[]): Promise<void> => {
      try {
        const row = data[indexRow];
        if (indexRow != null && row?.hypothesis) {
          const { trajectory, status, subRows } = row;
          const hasTrajectoryOK =
            subRows?.some((subRow) => subRow.trajectory != null && subRow.status === TRAJECTORY_SELECTION_STATUS.OK) ||
            (trajectory && status === TRAJECTORY_SELECTION_STATUS.OK);
          let trajectoryIds = [];
          if (study.id && hasTrajectoryOK) {
            const subRowTrajectoryIds = subRows
              ?.map((subRow) => {
                if (subRow.trajectory != null && subRow.status === TRAJECTORY_SELECTION_STATUS.OK) {
                  return subRow.trajectory?.id;
                }
                return null;
              })
              .filter(Boolean) as number[];

            if (type === TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER && subRowTrajectoryIds.length === 1) {
              const paramModulationId = data[1]?.status === TRAJECTORY_SELECTION_STATUS.OK ? data[1]?.trajectory : null;
              trajectoryIds = [
                ...(paramModulationId?.id ? [paramModulationId.id] : []),
                ...(subRowTrajectoryIds ?? []),
              ].filter(Boolean);
            } else {
              trajectoryIds = [...(trajectory?.id ? [trajectory.id] : []), ...(subRowTrajectoryIds ?? [])].filter(
                Boolean,
              );
            }

            if (trajectoryIds?.length > 1) {
              await unlinkMultipleTrajectoriesFromStudy(study.id, trajectoryIds);
              dispatch?.({
                type: STUDY_ACTION.DELETE_TRAJECTORY,
                payload: { area: row.hypothesis, type },
              });
            } else {
              await unlinkTrajectoryFromStudy(trajectoryIds[0], study.id);
              dispatch?.({
                type: STUDY_ACTION.DELETE_TRAJECTORY,
                payload: { area: row.hypothesis, type },
              });
            }
          }

          if (type === TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER) {
            setData((prev: HypothesisRowData[]): HypothesisRowData[] => {
              const newSubRows = prev?.[0]?.subRows
                ? prev[0].subRows?.filter((itemData) => itemData.hypothesis !== value)
                : [];
              if (trajectoryIds?.length > 1) {
                return [
                  { ...prev[0], subRows: newSubRows },
                  { ...prev[1], trajectory: null, status: TRAJECTORY_SELECTION_STATUS.MISSING },
                  ...prev.slice(2),
                ];
              } else {
                return [{ ...prev[0], subRows: newSubRows }, ...prev.slice(1)];
              }
            });
          } else {
            const newDataSorted = sortWithFixedPosition(data?.filter((item) => item.hypothesis !== value));
            setData(newDataSorted);
          }

          if (value) {
            setCheckedValues((prev) => prev.filter((name) => name !== value));
          }
        }
      } catch (error) {
        const errorMessage = t('studyDetails.@notificationAlert', {
          studyName: study.name,
          trajectoryName: value,
          trajectoryType: data[indexRow]?.hypothesis,
        });

        notifyAlert({
          icon: StdIconId.Close,
          message: errorMessage,
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
