import { Dispatch, SetStateAction, useCallback, useState } from 'react';
import { DbTrajectory, HypothesisRowData, RowStatus, StudyActionType, StudyDTO, StudyState } from '@/shared/types';
import { TRAJECTORY_SELECTION_STATUS, TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { linkTrajectoryToStudy } from '@/shared/services/trajectoryService.ts';
import { STUDY_ACTION } from '@/shared/enum/study.ts';
import { handleTrajectoryError } from '@/shared/services/hypothesisTableService.ts';
import { isUniqueTrajectoryType, normalize, setNestedData } from '@/shared/utils/trajectoryUtils.ts';
import { useUser } from '@/store/contexts/UserContext.tsx';
import { useTranslation } from 'react-i18next';

export const useTrajectoryAttach = (
  study: StudyDTO,
  studyState: Partial<StudyState>,
  dispatch: Dispatch<StudyActionType> | null,
) => {
  const { user } = useUser();
  const { t } = useTranslation();
  const [newDbTrajectoryAttached, setNewDbTrajectoryAttached] = useState<DbTrajectory | null>(null);

  const attachTrajectory = useCallback(
    async (
      type: TRAJECTORY_TYPE,
      indexArray: number[],
      status: RowStatus,
      trajectory: DbTrajectory,
      setData: Dispatch<SetStateAction<HypothesisRowData[]>>,
    ): Promise<void> => {
      try {
        const newDbTrajectory = await linkTrajectoryToStudy(type, trajectory.id, study.id);
        setNewDbTrajectoryAttached(newDbTrajectory);

        if (newDbTrajectory) {
          let alreadyExists = false;
          if (isUniqueTrajectoryType(newDbTrajectory.type)) {
            alreadyExists =
              studyState[newDbTrajectory.type]?.trajectories?.some((item) => item.type === newDbTrajectory.type) ??
              false;
          } else {
            alreadyExists =
              studyState[newDbTrajectory.type]?.trajectories?.some(
                (item) =>
                  normalize(item.area ?? '') === normalize(newDbTrajectory.area ?? '') &&
                  normalize(item.technology) === normalize(newDbTrajectory.technology),
              ) ?? false;
          }

          if (alreadyExists) {
            dispatch?.({
              type: STUDY_ACTION.UPDATE_TRAJECTORY,
              payload: {
                trajectory: newDbTrajectory,
                status,
              },
            });
          } else {
            dispatch?.({
              type: STUDY_ACTION.ADD_TRAJECTORIES,
              payload: {
                [type]: {
                  trajectories: [newDbTrajectory],
                },
              },
            });
          }

          const newTrajectory = {
            trajectory: newDbTrajectory,
            status: TRAJECTORY_SELECTION_STATUS.OK,
          };

          setData((prev) => setNestedData(prev, indexArray, newTrajectory));
        }
      } catch (error) {
        if (indexArray.length) {
          const message = t('studyDetails.@notificationAlert', {
            studyName: study.name,
            trajectoryName: trajectory.trajectoryName,
            trajectoryType: trajectory.area,
          });
          handleTrajectoryError(
            type,
            indexArray,
            { id: trajectory.id, label: trajectory.trajectoryName },
            trajectory.area ?? '',
            user?.profile?.sub ?? '',
            setData,
            {
              message,
              content: (error as Error).message,
            },
          );
        }
      }
    },
    [study.id, study.name, newDbTrajectoryAttached, studyState, dispatch, t, user?.profile?.sub],
  );

  return { attachTrajectory, newDbTrajectoryAttached };
};
