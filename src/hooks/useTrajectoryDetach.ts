import { Dispatch, SetStateAction, useCallback } from 'react';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { HypothesisRowData, RowStatus, StudyActionType, StudyDTO } from '@/shared/types';
import { ReadOnlyObject } from '@/shared/types/HypothesisTable.ts';
import { useTrajectoryDeletionLogic } from './useTrajectoryDeletionLogic';
import { handleTrajectoryError } from '@/shared/services/hypothesisTableService.ts';
import { useUser } from '@/store/contexts/UserContext.tsx';
import { useTranslation } from 'react-i18next';
import { STUDY_ACTION } from '@/shared/enum/study.ts';
import { updateTableAfterCellDetach } from '@/shared/helpers/hypothesisTableHelper.ts';

export const useTrajectoryDetach = (
  study: StudyDTO,
  dispatch: Dispatch<StudyActionType> | null,
  setReadOnly?: Dispatch<SetStateAction<ReadOnlyObject>>,
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
      );
      try {
        // 2. Suppression backend si nécessaire
        if (trajectoryToDelete && trajectoryIds?.length > 0 && status === 'empty') {
          await performBackendDeletion(trajectoryIds);
        }

        // 3. Mise à jour du store
        trajectoryToDelete &&
          dispatch?.({
            type: STUDY_ACTION.UPDATE_TRAJECTORY,
            payload: { trajectory: trajectoryToDelete, status },
          });

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
