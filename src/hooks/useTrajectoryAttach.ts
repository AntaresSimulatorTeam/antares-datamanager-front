import { Dispatch, SetStateAction, useCallback } from 'react';
import { DbTrajectory, HypothesisRowData, RowStatus, StudyActionType, StudyDTO, StudyState } from '@/shared/types';
import { TRAJECTORY_SELECTION_STATUS, TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { isParamModulationRequired, linkTrajectoryToStudy } from '@/shared/services/trajectoryService.ts';
import { STUDY_ACTION } from '@/shared/enum/study.ts';
import { handleTrajectoryError } from '@/shared/services/hypothesisTableService.ts';
import { isUniqueTrajectoryType, normalize, setNestedData } from '@/shared/utils/trajectoryUtils.ts';
import { useUser } from '@/store/contexts/UserContext.tsx';
import { useTranslation } from 'react-i18next';
import { ReadOnlyObject } from '@common/data/stdTable/types/readOnly.type';

export const useTrajectoryAttach = (
  study: StudyDTO,
  studyState: Partial<StudyState>,
  dispatch: Dispatch<StudyActionType> | null,
  setReadOnly?: Dispatch<SetStateAction<ReadOnlyObject>>,
) => {
  const { user } = useUser();
  const { t } = useTranslation();

  const attachTrajectory = useCallback(
    async (
      type: TRAJECTORY_TYPE,
      indexArray: number[],
      status: RowStatus,
      trajectory: DbTrajectory,
      setData: Dispatch<SetStateAction<HypothesisRowData[]>>,
    ) => {
      try {
        const newDbTrajectory = await linkTrajectoryToStudy(type, trajectory.id, study?.id);

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
          let newData: HypothesisRowData[] = [];
          if (type === TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER) {
            const isRequired = await isParamModulationRequired(study.id, study?.horizon);
            setData((prev) => {
              newData = setNestedData(prev, indexArray, newTrajectory);
              setReadOnly?.((prevReadOnly) => ({ ...prevReadOnly, ['1']: !isRequired }));
              return newData;
            });
          } else {
            setData((prev) => {
              newData = setNestedData(prev, indexArray, newTrajectory);
              type === TRAJECTORY_TYPE.AREA && setReadOnly?.({ '0': false, '1': false });
              if (type === TRAJECTORY_TYPE.DSR) {
                const hasTrajectoryWithTS =
                  newData.some(
                    (row) => row.status === TRAJECTORY_SELECTION_STATUS.OK && row?.trajectory?.hasTimeSeries,
                  ) || newDbTrajectory.hasTimeSeries;
                setReadOnly?.((prevReadOnly) => {
                  const lastIndex = Math.max(Object.keys(prev)?.length - 1, 0);
                  return { ...prevReadOnly, [lastIndex]: !hasTrajectoryWithTS };
                });
              }
              return newData;
            });
          }
        }
      } catch (error) {
        if (indexArray?.length) {
          const message = t('studyDetails.@notificationAlert', {
            studyName: study?.name,
            trajectoryName: trajectory?.trajectoryName,
            trajectoryType: trajectory?.area,
          });
          handleTrajectoryError(
            type,
            indexArray,
            { id: trajectory?.id, label: trajectory?.trajectoryName },
            trajectory?.area ?? '',
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
    [study.id, study?.horizon, study?.name, studyState, dispatch, setReadOnly, t, user?.profile?.sub],
  );

  return { attachTrajectory };
};
