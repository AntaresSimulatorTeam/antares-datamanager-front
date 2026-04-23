import { Dispatch, SetStateAction, useCallback } from 'react';
import { useTrajectoryDeletionLogic } from './useTrajectoryDeletionLogic';
import { HypothesisRowData, StudyActionType, StudyDTO } from '@/shared/types';
import { ReadOnlyObject } from '@/shared/types/HypothesisTable.ts';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { STUDY_ACTION } from '@/shared/enum/study.ts';
import { notifyAlert } from '@/shared/notification/notification.tsx';
import { useTranslation } from 'react-i18next';
import { updateTableAfterRowDeletion } from '@/shared/helpers/hypothesisTableHelper.ts';

export const useHypothesisTableRemoveRow = (
  study: StudyDTO,
  dispatch: Dispatch<StudyActionType> | null,
  setData: Dispatch<SetStateAction<HypothesisRowData[]>>,
  setCheckedValues: Dispatch<SetStateAction<string[]>>,
  setReadOnly?: Dispatch<SetStateAction<ReadOnlyObject>>,
) => {
  const { t } = useTranslation();
  const { computeDeletion, performBackendDeletion } = useTrajectoryDeletionLogic(study);

  const removeRow = useCallback(
    async (type: TRAJECTORY_TYPE, indexRow: number, data: HypothesisRowData[], hypothesis: string): Promise<void> => {
      try {
        // 1. Détermination des trajectoires à supprimer
        const { trajectoryIds, trajectoryToDelete } = computeDeletion(type, data, indexRow, null, hypothesis);

        // 2. Suppression backend
        await performBackendDeletion(trajectoryIds);

        // 3. Mise à jour du store
        const area =
          trajectoryToDelete?.area ??
          (type === TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER ? hypothesis : data[indexRow]?.hypothesis);

        dispatch?.({
          type: STUDY_ACTION.DELETE_TRAJECTORY,
          payload: { area, type },
        });

        // 4. Mise à jour du tableau (factorisée)
        const { newData, newReadOnly } = await updateTableAfterRowDeletion({
          type,
          data,
          hypothesis,
          trajectoryIds,
          studyId: study.id,
          horizon: study.horizon,
        });

        setData(newData);
        if (newReadOnly) setReadOnly?.((prev) => ({ ...prev, ...newReadOnly }));

        // 5. Mise à jour des cases cochées
        setCheckedValues((prev) => prev.filter((v) => v !== hypothesis));
      } catch (error) {
        notifyAlert({
          icon: 'check',
          message: t('studyDetails.@notificationAlert', {
            studyName: study.name,
            trajectoryName: hypothesis,
            trajectoryType: data[indexRow]?.hypothesis,
          }),
          content: (error as Error).message,
          type: 'error',
          filledIcon: true,
        });
      }
    },
    [
      computeDeletion,
      performBackendDeletion,
      dispatch,
      study.id,
      study.horizon,
      study.name,
      setData,
      setCheckedValues,
      setReadOnly,
      t,
    ],
  );

  return { removeRow };
};
