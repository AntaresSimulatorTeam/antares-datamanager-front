import { Dispatch, SetStateAction, useCallback } from 'react';
import { TRAJECTORY_SELECTION_STATUS, TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { HypothesisRowData, RowStatus, StudyActionType, StudyDTO, TrajectoryBackendError } from '@/shared/types';
import { ReadOnlyObject } from '@/shared/types/HypothesisTable.ts';
import { useTrajectoryDeletionLogic } from './useTrajectoryDeletionLogic';
import { handleTrajectoryError } from '@/shared/services/hypothesisTableService.ts';
import { useUser } from '@/store/contexts/UserContext.tsx';
import { useTranslation } from 'react-i18next';
import { STUDY_ACTION } from '@/shared/enum/study.ts';
import { updateTableAfterCellDetach } from '@/shared/helpers/hypothesisTableHelper.ts';
import { buildErrorTrajectory } from '@/shared/utils/trajectoryUtils.ts';

export const useTrajectoryDetach = (
  study: StudyDTO,
  dispatch: Dispatch<StudyActionType> | null,
  setReadOnly?: Dispatch<SetStateAction<ReadOnlyObject>>,
  setIsDeletionModalOpen?: Dispatch<SetStateAction<boolean>>,
  setRowIdSelected?: Dispatch<SetStateAction<string>>,
) => {
  const { user } = useUser();
  const { t } = useTranslation();
  const { computeDeletion, performBackendDeletion } = useTrajectoryDeletionLogic(study);

  const detachTrajectory = useCallback(
    async (
      type: TRAJECTORY_TYPE,
      indexArray: number[],
      setData: Dispatch<SetStateAction<HypothesisRowData[]>>,
      data: HypothesisRowData[],
      status: RowStatus,
      hypothesis: string,
    ): Promise<void> => {
      // 1. Détermination des trajectoires à supprimer
      const { trajectoryIds, trajectoryToDelete, additionalTrajectory } = computeDeletion(
        type,
        data,
        null,
        indexArray,
        hypothesis,
        status,
      );

      try {
        // 2. Suppression backend si nécessaire
        if (trajectoryToDelete && trajectoryIds?.length > 0 && status === 'empty') {
          await performBackendDeletion(trajectoryIds);
        }

        // 3. Mise à jour du store
        if (trajectoryToDelete) {
          if (trajectoryToDelete.type === TRAJECTORY_TYPE.AREA) {
            dispatch?.({ type: STUDY_ACTION.RESET_STUDY_STATE });
          } else {
            dispatch?.({
              type: STUDY_ACTION.UPDATE_TRAJECTORY,
              payload: { trajectory: trajectoryToDelete, status },
            });
          }
        }

        // 4. Mise à jour du tableau (factorisée)
        const { newData, newReadOnly } = await updateTableAfterCellDetach({
          type,
          data,
          additionalTrajectory,
          indexArray,
          studyId: study.id,
          horizon: study.horizon,
        });

        setData(newData);
        if (newReadOnly) setReadOnly?.((prev) => ({ ...prev, ...newReadOnly }));
      } catch (error) {
        if ((error as TrajectoryBackendError).message.includes('Confirmation required')) {
          setRowIdSelected?.(String(indexArray[0]));
          setIsDeletionModalOpen?.(true);
        } else {
          if (type === TRAJECTORY_TYPE.AREA) {
            const newDbTrajectory = buildErrorTrajectory(
              indexArray[0] === 0 ? TRAJECTORY_TYPE.AREA : TRAJECTORY_TYPE.LINK,
              trajectoryIds[0],
              trajectoryToDelete?.trajectoryName ?? '',
              user?.profile?.sub ?? null,
              '',
            );
            //Case: area control failed and a trajectory Links is linked to the study with ok status
            const shouldUnlink =
              indexArray[0] === 0 && data[1]?.trajectory && data[1]?.status !== TRAJECTORY_SELECTION_STATUS.ERROR;
            if (shouldUnlink && data[1]?.trajectory?.id) {
              await performBackendDeletion([data[1]?.trajectory?.id]);
              dispatch?.({
                type: STUDY_ACTION.CLEAR_TRAJECTORY_BY_TYPE,
                payload: [TRAJECTORY_TYPE.LINK],
              } as StudyActionType);
            }
            setData((prev) =>
              prev.map((item, index) => {
                if (index === indexArray[0]) {
                  return {
                    ...item,
                    trajectory: newDbTrajectory,
                    status: TRAJECTORY_SELECTION_STATUS.ERROR,
                  };
                } else if (shouldUnlink) {
                  return {
                    ...item,
                    trajectory: null,
                    status: TRAJECTORY_SELECTION_STATUS.MISSING,
                  };
                } else {
                  return item;
                }
              }),
            );

            setReadOnly?.({ '0': false, '1': false });
          }
          const message = t('studyDetails.@notificationAlert', {
            studyName: study.name,
            trajectoryName: trajectoryToDelete?.trajectoryName,
            trajectoryType: trajectoryToDelete?.area,
          });

          handleTrajectoryError(
            type,
            indexArray,
            { id: trajectoryToDelete?.id ?? 0, label: trajectoryToDelete?.trajectoryName ?? '' },
            trajectoryToDelete?.area ?? '',
            user?.profile?.sub ?? '',
            setData,
            { message, content: (error as Error)?.message },
          );
        }
      }
    },
    [
      computeDeletion,
      dispatch,
      study.id,
      study.horizon,
      study.name,
      performBackendDeletion,
      setReadOnly,
      t,
      user?.profile?.sub,
    ],
  );

  return { detachTrajectory };
};
