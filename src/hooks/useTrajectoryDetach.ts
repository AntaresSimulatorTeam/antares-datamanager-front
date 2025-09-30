import { Dispatch, SetStateAction, useCallback } from 'react';
import { DbTrajectory, HypothesisRowData, RowStatus, StudyActionType, StudyDTO, StudyState } from '@/shared/types';
import { TRAJECTORY_SELECTION_STATUS, TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { unlinkTrajectoryFromStudy } from '@/shared/services/trajectoryService.ts';
import { fetchWarningMessagesFromType } from '@/shared/services/warningService.ts';
import { STUDY_ACTION } from '@/shared/enum/study.ts';
import { setNestedData } from '@/shared/utils/trajectoryUtils.ts';
import { handleTrajectoryError } from '@/shared/services/hypothesisTableService.ts';
import { useUser } from '@/store/contexts/UserContext.tsx';
import { useTranslation } from 'react-i18next';
import { isBusinessError } from '@/shared/utils/errorUtils.ts';

export const useTrajectoryDetach = (
  study: StudyDTO,
  dispatch: Dispatch<StudyActionType> | null,
  setData: Dispatch<SetStateAction<HypothesisRowData[]>>,
  studyState?: Partial<StudyState>,
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

        const newWarningMessages = await fetchWarningMessagesFromType(type, study.id);

        const warningMessages =
          type === TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER ||
          type === TRAJECTORY_TYPE.THERMAL_TECHNICAL_COMMON_PARAMETER ||
          type === TRAJECTORY_TYPE.THERMAL_TECHNICAL_MODULATION_PARAMETER
            ? [
                ...(studyState?.[TRAJECTORY_TYPE.THERMAL_PARAMETER]?.warningMessages ?? []),
                ...(newWarningMessages ?? []),
              ]
            : newWarningMessages;
        console.log('============= warningMessages', warningMessages);
        console.log('============= trajectorySelected', trajectorySelected);

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
        if (indexArray.length && trajectorySelected?.area && isBusinessError(error)) {
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
            { message, content: error.antaresErrorMessage },
          );
        }
      }
    },
    [study, dispatch, setData, user?.profile?.sub, t],
  );

  return { detachTrajectory };
};
