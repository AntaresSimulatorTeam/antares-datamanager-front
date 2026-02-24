import { Dispatch, SetStateAction, useCallback } from 'react';
import { DbTrajectory, HypothesisRowData, RowStatus, StudyActionType, StudyDTO } from '@/shared/types';
import { TRAJECTORY_SELECTION_STATUS, TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { unlinkMultipleTrajectoriesFromStudy, unlinkTrajectoryFromStudy } from '@/shared/services/trajectoryService.ts';
import { setNestedData } from '@/shared/utils/trajectoryUtils.ts';
import { handleTrajectoryError } from '@/shared/services/hypothesisTableService.ts';
import { useUser } from '@/store/contexts/UserContext.tsx';
import { useTranslation } from 'react-i18next';
import { notifyAlert } from '@/shared/notification/notification.tsx';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps.ts';
import { STUDY_ACTION } from '@/shared/enum/study.ts';
import { ReadOnlyObject } from '@/shared/types/HypothesisTable.ts';

export const useTrajectoryDetach = (
  study: StudyDTO,
  dispatch: Dispatch<StudyActionType> | null,
  setReadOnly?: Dispatch<SetStateAction<ReadOnlyObject>>,
) => {
  const { user } = useUser();
  const { t } = useTranslation();

  const detachTrajectory = useCallback(
    async (
      type: TRAJECTORY_TYPE,
      indexArray: number[],
      status: RowStatus,
      trajectorySelected: DbTrajectory,
      setData: Dispatch<SetStateAction<HypothesisRowData[]>>,
      additionalTrajectory?: DbTrajectory | null,
    ): Promise<void> => {
      try {
        if (!trajectorySelected || !status) return;

        if (status === 'empty') {
          if (additionalTrajectory) {
            const trajectoryIds = [trajectorySelected?.id, additionalTrajectory.id];
            await unlinkMultipleTrajectoriesFromStudy(study.id, trajectoryIds);
          } else {
            await unlinkTrajectoryFromStudy(trajectorySelected.id, study.id);
          }
        }
        dispatch?.({
          type: STUDY_ACTION.UPDATE_TRAJECTORY,
          payload: { trajectory: trajectorySelected, status },
        });

        const newEmptyTrajectory: Pick<HypothesisRowData, 'trajectory' | 'status'> = {
          trajectory: null,
          status: TRAJECTORY_SELECTION_STATUS.MISSING,
        };
        if (type === TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER) {
          setData((prev: HypothesisRowData[]): HypothesisRowData[] => {
            if (additionalTrajectory?.type === TRAJECTORY_TYPE.THERMAL_TECHNICAL_MODULATION_PARAMETER) {
              const newData = [
                { ...prev[0] },
                { ...prev[1], trajectory: null, status: TRAJECTORY_SELECTION_STATUS.MISSING },
                ...prev.slice(2),
              ];
              return setNestedData(newData, indexArray, newEmptyTrajectory);
            } else {
              return setNestedData(prev, indexArray, newEmptyTrajectory);
            }
          });
        } else if (type === TRAJECTORY_TYPE.DSR) {
          setData((prev) => {
            const lastIndex = Math.max(Object.keys(prev)?.length - 1, 0);
            if (additionalTrajectory?.type === TRAJECTORY_TYPE.DSR_CAPACITY_MODULATION) {
              const newData = [
                ...prev.slice(0, lastIndex),
                { ...prev[lastIndex], trajectory: null, status: TRAJECTORY_SELECTION_STATUS.MISSING },
              ];
              setReadOnly?.((prevItem) => ({ ...prevItem, [lastIndex]: true }));
              return setNestedData(newData, indexArray, newEmptyTrajectory);
            } else {
              const isLastSpecificTrajectory =
                prev.filter(
                  (item) =>
                    item?.status === TRAJECTORY_SELECTION_STATUS.OK && item?.trajectory?.type === TRAJECTORY_TYPE.DSR,
                )?.length === 1;
              setReadOnly?.((prevItem) => ({ ...prevItem, [lastIndex]: isLastSpecificTrajectory }));
              return setNestedData(prev, indexArray, newEmptyTrajectory);
            }
          });
        } else {
          setData((prev) => setNestedData(prev, indexArray, newEmptyTrajectory));
        }
      } catch (error) {
        if (!additionalTrajectory && trajectorySelected?.area) {
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
            { message, content: (error as Error)?.message },
          );
        } else {
          notifyAlert({
            icon: StdIconId.Close,
            message: 'Could not detach trajectories.',
            content: (error as Error)?.message ?? '',
            type: 'error',
            filledIcon: true,
          });
        }
      }
    },
    [study, dispatch, user?.profile?.sub, t],
  );

  return { detachTrajectory };
};
