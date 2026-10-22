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

const handleAreaReadOnly = async (
  trajectoryId: number | undefined,
  isFlowbasedAllowed: (id: number) => Promise<boolean | undefined>,
  setReadOnly?: Dispatch<SetStateAction<ReadOnlyObject>>,
  setSecondTableReadOnly?: Dispatch<SetStateAction<ReadOnlyObject>>,
) => {
  const allMandatoryAreasInStudy = trajectoryId != null ? await isFlowbasedAllowed(trajectoryId) : false;
  setReadOnly?.({ '0': false, '1': false });
  setSecondTableReadOnly?.({ '0': false, '1': !allMandatoryAreasInStudy, '2.0': false, '2.1': false });
};

const handleThermalReadOnly = async (
  studyId: number,
  horizon: string,
  setReadOnly?: Dispatch<SetStateAction<ReadOnlyObject>>,
) => {
  const isRequired = await isParamModulationRequired(studyId, horizon);
  setReadOnly?.((prevReadOnly) => ({ ...prevReadOnly, ['1']: !isRequired }));
};

const handleGenericReadOnly = (
  type: TRAJECTORY_TYPE,
  newDbTrajectory: DbTrajectory,
  lastIndex: number,
  setReadOnly?: Dispatch<SetStateAction<ReadOnlyObject>>,
) => {
  if (type === TRAJECTORY_TYPE.DSR) {
    setReadOnly?.((prevReadOnly) => ({ ...prevReadOnly, [lastIndex]: !newDbTrajectory.hasTimeSeries }));
  } else if (type === TRAJECTORY_TYPE.AREA_ME) {
    setReadOnly?.((prevReadOnly: ReadOnlyObject) =>
      Object.fromEntries(
        Object.keys(prevReadOnly).map((key) => [key, false]),
      ) as ReadOnlyObject,
    );
  }
};

interface UpdateReadOnlyParams {
  type: TRAJECTORY_TYPE;
  study: StudyDTO;
  newDbTrajectory: DbTrajectory;
  lastIndex: number;
  isFlowbasedAllowed: (id: number) => Promise<boolean | undefined>;
  setReadOnly?: Dispatch<SetStateAction<ReadOnlyObject>>;
  setSecondTableReadOnly?: Dispatch<SetStateAction<ReadOnlyObject>>;
}

const updateReadOnlyState = async ({
  type,
  study,
  newDbTrajectory,
  lastIndex,
  isFlowbasedAllowed,
  setReadOnly,
  setSecondTableReadOnly,
}: UpdateReadOnlyParams) => {
  if (type === TRAJECTORY_TYPE.AREA) {
    await handleAreaReadOnly(newDbTrajectory?.id, isFlowbasedAllowed, setReadOnly, setSecondTableReadOnly);
  } else if (type === TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER) {
    await handleThermalReadOnly(study.id, study?.horizon, setReadOnly);
  } else {
    handleGenericReadOnly(type, newDbTrajectory, lastIndex, setReadOnly);
  }
};

const updateTrajectoryData = (
  setData: Dispatch<SetStateAction<HypothesisRowData[]>>,
  indexArray: number[],
  newDbTrajectory: DbTrajectory,
) => {
  let lastIndex = 0;
  const newTrajectory = {
    trajectory: newDbTrajectory,
    status: TRAJECTORY_SELECTION_STATUS.OK,
  };

  setData((prev) => {
    lastIndex = Math.max(Object.keys(prev)?.length - 1, 0);
    return setNestedData(prev, indexArray, newTrajectory);
  });

  return lastIndex;
};

interface TrajectoryErrorParams {
  type: TRAJECTORY_TYPE;
  indexArray: number[];
  trajectory: DbTrajectory;
  study: StudyDTO;
  userSub?: string;
  error: unknown;
  t: (key: string, options?: Record<string, unknown>) => string;
  setData: Dispatch<SetStateAction<HypothesisRowData[]>>;
}

const notifyTrajectoryError = ({
  type,
  indexArray,
  trajectory,
  study,
  userSub,
  error,
  t,
  setData,
}: TrajectoryErrorParams) => {
  if (!indexArray?.length) return;

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
    userSub ?? '',
    setData,
    {
      message,
      content: (error as Error).message,
    },
    trajectory?.technology,
  );
};

export const useTrajectoryAttach = (
  study: StudyDTO,
  dispatch?: Dispatch<StudyActionType> | null,
) => {
  const { user } = useUser();
  const { t } = useTranslation();
  const { isFlowbasedAllowed } = useFetchAreas();

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

          const lastIndex = updateTrajectoryData(setData, indexArray, newDbTrajectory);

          await updateReadOnlyState({
            type,
            study,
            newDbTrajectory,
            lastIndex,
            isFlowbasedAllowed,
            setReadOnly,
            setSecondTableReadOnly,
          });
        }
      } catch (error) {
        notifyTrajectoryError({
          type,
          indexArray,
          trajectory,
          study,
          userSub: user?.profile?.sub,
          error,
          t,
          setData,
        });
      }
    },
    [study.id, study?.horizon, study?.name, dispatch, isFlowbasedAllowed, t, user?.profile?.sub],
  );

  return { attachTrajectory };
};
