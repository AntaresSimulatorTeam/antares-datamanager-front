import { Dispatch, SetStateAction, useCallback } from 'react';
import { DbTrajectory, HypothesisRowData, RowStatus, StudyActionType, StudyDTO } from '@/shared/types';
import { TRAJECTORY_SELECTION_STATUS, TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { unlinkTrajectoryFromStudy } from '@/shared/services/trajectoryService.ts';
import { fetchWarningMessagesFromType } from '@/shared/services/warningService.ts';
import { STUDY_ACTION } from '@/shared/enum/study.ts';
import { setNestedData } from '@/shared/utils/trajectoryUtils.ts';
import { handleTrajectoryError } from '@/shared/services/hypothesisTableService.ts';
import { useUser } from '@/store/contexts/UserContext.tsx';
import { useTranslation } from 'react-i18next';

export const useTrajectoryDetach = (
  study: StudyDTO,
  dispatch: Dispatch<StudyActionType> | null,
  setData: Dispatch<SetStateAction<HypothesisRowData[]>>,
) => {
  const { user } = useUser();
  const { t } = useTranslation();

  const detachTrajectory = useCallback(
    async (
      type: TRAJECTORY_TYPE,
      indexArray: number[],
      status: RowStatus,
      trajectorySelected: DbTrajectory,
    ): Promise<void> => {
      try {
        if (!trajectorySelected || !status) return;

        if (status === 'empty') {
          await unlinkTrajectoryFromStudy(trajectorySelected.id, study.id);
        }

        const warningMessages = await fetchWarningMessagesFromType(type, study.id);

        dispatch?.({
          type: STUDY_ACTION.UPDATE_TRAJECTORY,
          payload: { trajectory: trajectorySelected, warningMessages, status },
        });

        const newEmptyTrajectory: Pick<HypothesisRowData, 'trajectory' | 'status'> = {
          trajectory: null,
          status: TRAJECTORY_SELECTION_STATUS.MISSING,
        };

        setData((prev) => setNestedData(prev, indexArray, newEmptyTrajectory));
      } catch (error) {
        if (indexArray.length && trajectorySelected?.area) {
          const message = t('studyDetails.@notificationAlert', {
            studyName: study.name,
            trajectoryName: trajectorySelected.trajectoryName,
            trajectoryType: trajectorySelected.area,
          });

          handleTrajectoryError(
            type,
            indexArray,
            { id: trajectorySelected.id, label: trajectorySelected.trajectoryName },
            trajectorySelected.area,
            user?.profile?.sub ?? '',
            setData,
            { message, content: (error as Error).message },
          );
        }
      }
    },
    [study, dispatch, setData, user?.profile?.sub, t],
  );

  return { detachTrajectory };
};
