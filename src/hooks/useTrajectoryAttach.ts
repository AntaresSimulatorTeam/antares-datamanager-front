import { Dispatch, SetStateAction, useCallback } from 'react';
import { DbTrajectory, HypothesisRowData, RowStatus, StudyActionType, StudyDTO } from '@/shared/types';
import { TRAJECTORY_SELECTION_STATUS, TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { isParamModulationRequired, linkTrajectoryToStudy } from '@/shared/services/trajectoryService.ts';
import { STUDY_ACTION } from '@/shared/enum/study.ts';
import { handleTrajectoryError } from '@/shared/services/hypothesisTableService.ts';
import { setNestedData } from '@/shared/utils/trajectoryUtils.ts';
import { useUser } from '@/store/contexts/UserContext.tsx';
import { useTranslation } from 'react-i18next';
import { ReadOnlyObject } from '@common/data/stdTable/types/readOnly.type';
import { useFetchAreas } from '@/hooks/useFetchAreas.ts';

export const useTrajectoryAttach = (
  study: StudyDTO,
  dispatch?: Dispatch<StudyActionType> | null,
) => {
  const { user } = useUser();
  const { t } = useTranslation();
  const {isFlowbasedAllowed} = useFetchAreas();

  const attachTrajectory = useCallback(
    async (
      type: TRAJECTORY_TYPE,
      indexArray: number[],
      status: RowStatus,
      trajectory: DbTrajectory,
      setData: Dispatch<SetStateAction<HypothesisRowData[]>>,
      setReadOnly?: Dispatch<SetStateAction<ReadOnlyObject>>,
      setSecondTableReadOnly?: Dispatch<SetStateAction<ReadOnlyObject>>,
    ) => {
      try {
        const newDbTrajectory = await linkTrajectoryToStudy(type, trajectory.id, study?.id);

        if (newDbTrajectory) {
          dispatch?.({
            type: STUDY_ACTION.UPDATE_TRAJECTORY,
            payload: {
              trajectory: newDbTrajectory,
              status,
            },
          });

          const newTrajectory = {
            trajectory: newDbTrajectory,
            status: TRAJECTORY_SELECTION_STATUS.OK,
          };

          if (type === TRAJECTORY_TYPE.AREA) {
            const allMandatoryAreasInStudy =
              newDbTrajectory?.id != null ? await isFlowbasedAllowed(newDbTrajectory.id) : false;

            setData((prev) => setNestedData(prev, indexArray, newTrajectory));
            setReadOnly?.({ '0': false, '1': false });
            setSecondTableReadOnly?.({ '0': false, '1': !allMandatoryAreasInStudy, '2.0': false, '2.1': false });
          } else if (type === TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER) {
            const isRequired = await isParamModulationRequired(study.id, study?.horizon);

            setData((prev) => setNestedData(prev, indexArray, newTrajectory));
            setReadOnly?.((prevReadOnly) => ({ ...prevReadOnly, ['1']: !isRequired }));
          } else {
            let lastIndex = 0;
            setData((prev) => {
              lastIndex = Math.max(Object.keys(prev)?.length - 1, 0);
              return setNestedData(prev, indexArray, newTrajectory);
            });

            if (type === TRAJECTORY_TYPE.DSR) {
              setReadOnly?.((prevReadOnly) => ({ ...prevReadOnly, [lastIndex]: !newDbTrajectory.hasTimeSeries }));
            }
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
    [study.id, study?.horizon, study?.name, dispatch, isFlowbasedAllowed, t, user?.profile?.sub],
  );

  return { attachTrajectory };
};
