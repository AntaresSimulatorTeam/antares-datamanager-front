import { Dispatch, SetStateAction, useCallback } from 'react';
import { DbTrajectory, HypothesisRowData, RowStatus, StudyActionType, StudyDTO, StudyState } from '@/shared/types';
import { TRAJECTORY_SELECTION_STATUS, TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { getStudyTrajectoriesWithWarnings, linkTrajectoryToStudy } from '@/shared/services/trajectoryService.ts';
import { STUDY_ACTION } from '@/shared/enum/study.ts';
import { handleTrajectoryError } from '@/shared/services/hypothesisTableService.ts';
import { isTrajectoryParameter, setNestedData } from '@/shared/utils/trajectoryUtils.ts';
import { useUser } from '@/store/contexts/UserContext.tsx';
import { useTranslation } from 'react-i18next';

export const useTrajectoryAttach = (
  study: StudyDTO,
  studyState: Partial<StudyState>,
  dispatch: Dispatch<StudyActionType> | null,
  setData: Dispatch<SetStateAction<HypothesisRowData[]>>,
) => {
  const { user } = useUser();
  const { t } = useTranslation();

  const attachTrajectory = useCallback(
    async (type: TRAJECTORY_TYPE, indexArray: number[], status: RowStatus, trajectory: DbTrajectory): Promise<void> => {
      try {
        await linkTrajectoryToStudy(type, trajectory.id, study.id);
        const result = await getStudyTrajectoriesWithWarnings(study.id, type);
        const newDbTrajectory = result?.trajectories?.find((dbTrajectory) => dbTrajectory.id === trajectory.id);

        if (newDbTrajectory) {
          const alreadyExists = studyState[newDbTrajectory.type]?.trajectories?.some(
            (item) => item.area === newDbTrajectory.area && item.technology === newDbTrajectory.technology,
          );
          const typeToAdd = isTrajectoryParameter(type) ? TRAJECTORY_TYPE.THERMAL_CAPACITY : type;

          const warnings =
            typeToAdd === TRAJECTORY_TYPE.THERMAL_CAPACITY
              ? [
                  ...(studyState?.[TRAJECTORY_TYPE.THERMAL_CAPACITY]?.warningMessages ?? []),
                  ...(result.warningMessages ?? []),
                ]
              : result.warningMessages;

          if (alreadyExists) {
            dispatch?.({
              type: STUDY_ACTION.UPDATE_TRAJECTORY,
              payload: {
                trajectory: newDbTrajectory,
                warningMessages: warnings,
                status,
              },
            });
          } else {
            dispatch?.({
              type: STUDY_ACTION.ADD_TRAJECTORIES,
              payload: {
                [typeToAdd]: {
                  trajectories: [newDbTrajectory],
                  warningMessages: warnings,
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
    [study.id, study?.name, setData, studyState, dispatch, t, user?.profile?.sub],
  );

  return { attachTrajectory };
};
