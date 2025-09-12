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
          console.log('=================== hasTrajectoryOK', hasTrajectoryOK);
          if (study.id && hasTrajectoryOK) {
            const subRowTrajectoryIds = subRows
              ?.map((subRow) => {
                if (subRow.trajectory != null && subRow.status === TRAJECTORY_SELECTION_STATUS.OK) {
                  return subRow.trajectory?.id;
                }
                return null;
              })
              .filter(Boolean) as number[];

            const trajectoryIds = subRowTrajectoryIds
              ? ([trajectory?.id, ...subRowTrajectoryIds].filter(Boolean) as number[])
              : trajectory?.id
                ? [trajectory?.id]
                : [];

            if (trajectoryIds?.length > 1) {
              await unlinkMultipleTrajectoriesFromStudy(study.id, trajectoryIds);
            } else {
              await unlinkTrajectoryFromStudy(trajectoryIds[0], study.id);
            }
          }

          dispatch?.({
            type: STUDY_ACTION.DELETE_TRAJECTORY,
            payload: { area: row.hypothesis, type },
          });

          const newDataSorted = sortWithFixedPosition(data?.filter((item) => item.hypothesis !== value));
          setData(newDataSorted);

          if (value) {
            setCheckedValues((prev) => prev.filter((name) => name !== value));
          }
        }
      } catch (error) {
        console.log('=================== error', error);
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
