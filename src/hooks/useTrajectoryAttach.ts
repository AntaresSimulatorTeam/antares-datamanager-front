import { Dispatch, SetStateAction, useCallback } from 'react';
import {
  DbTrajectory,
  HypothesisRowData,
  RowStatus,
  StudyActionType,
  StudyDTO,
  TrajectoryLinkData,
} from '@/shared/types';
import { TRAJECTORY_SELECTION_STATUS, TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import {
  getTrajectoryDataByTypeAndId,
  isParamModulationRequired,
  linkTrajectoryToStudy,
} from '@/shared/services/trajectoryService.ts';
import { STUDY_ACTION } from '@/shared/enum/study.ts';
import { handleTrajectoryError } from '@/shared/services/hypothesisTableService.ts';
import { hasLinkWithHvdcCapacities, setNestedData } from '@/shared/utils/trajectoryUtils.ts';
import { useUser } from '@/store/contexts/UserContext.tsx';
import { useTranslation } from 'react-i18next';
import { ReadOnlyObject } from '@common/data/stdTable/types/readOnly.type';
import { notifyAlert } from '@/shared/notification/notification.tsx';

const handleAreaReadOnly = (
  setReadOnly?: Dispatch<SetStateAction<ReadOnlyObject>>,
  setSecondTableReadOnly?: Dispatch<SetStateAction<ReadOnlyObject>>,
) => {
  setReadOnly?.({ '0': false, '1': false });
  setSecondTableReadOnly?.({ '0': false, '1': true, '2.0': false, '2.1': false });
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
  setReadOnly?: Dispatch<SetStateAction<ReadOnlyObject>>;
  setSecondTableReadOnly?: Dispatch<SetStateAction<ReadOnlyObject>>;
}
interface UpdateReadOnlyParams {
  type: TRAJECTORY_TYPE;
  study: StudyDTO;
  newDbTrajectory: DbTrajectory;
  lastIndex: number;
  setReadOnly?: Dispatch<SetStateAction<ReadOnlyObject>>;
  setSecondTableReadOnly?: Dispatch<SetStateAction<ReadOnlyObject>>;
  hasHvdcCapacities?: boolean;
  isFlowbasedRedOnly?: boolean;
}

const updateReadOnlyState = async ({
  type,
  study,
  newDbTrajectory,
  lastIndex,
  setReadOnly,
  setSecondTableReadOnly,
  hasHvdcCapacities = false,
  isFlowbasedRedOnly = false
}: UpdateReadOnlyParams) => {
  if (type === TRAJECTORY_TYPE.AREA) {
    handleAreaReadOnly(setReadOnly, setSecondTableReadOnly);
  } else if (type === TRAJECTORY_TYPE.LINK && hasHvdcCapacities && isFlowbasedRedOnly) {
    setSecondTableReadOnly?.({ '0': false, '1': false, '2.0': false, '2.1': false });
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
  hasHvdcCapacities = false
) => {
  let lastIndex = 0;
  const newTrajectory = {
    trajectory: newDbTrajectory,
    status: TRAJECTORY_SELECTION_STATUS.OK,
    hasHvdcCapacities,
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

  if (type === TRAJECTORY_TYPE.FLOWBASED) {
    notifyAlert({
      message,
      content: error instanceof Error ? error.message : String(error),
      type: 'error',
    });
    return;
  }

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

interface AttachTrajectoryParams {
  type: TRAJECTORY_TYPE,
  indexArray: number[],
  status: RowStatus,
  trajectory: DbTrajectory,
  setData: Dispatch<SetStateAction<HypothesisRowData[]>>,
  setReadOnly?: Dispatch<SetStateAction<ReadOnlyObject>>,
  setSecondTableReadOnly?: Dispatch<SetStateAction<ReadOnlyObject>>,
  isFlowbasedRedOnly?: boolean
}

export const useTrajectoryAttach = (
  study: StudyDTO,
  dispatch?: Dispatch<StudyActionType> | null,
) => {
  const { user } = useUser();
  const { t } = useTranslation();

  const attachTrajectory = useCallback(
    async ({
      type,
      indexArray,
      status,
      trajectory,
      setData,
      setReadOnly,
      setSecondTableReadOnly,
      isFlowbasedRedOnly
    }: AttachTrajectoryParams ) => {
      try {
        const newDbTrajectory = await linkTrajectoryToStudy(type, trajectory.id, study?.id);
        let hasHvdcCapacities = false;
        if (type === TRAJECTORY_TYPE.LINK) {
          const linkData: TrajectoryLinkData[] = await getTrajectoryDataByTypeAndId(type, newDbTrajectory.id);
          hasHvdcCapacities = hasLinkWithHvdcCapacities(linkData);
        }

        if (newDbTrajectory) {
          dispatch?.({
            type: STUDY_ACTION.UPDATE_TRAJECTORY,
            payload: {
              trajectory: newDbTrajectory,
              status,
            },
          });

          const lastIndex = updateTrajectoryData(setData, indexArray, newDbTrajectory, hasHvdcCapacities);

          await updateReadOnlyState({
            type,
            study,
            newDbTrajectory,
            lastIndex,
            setReadOnly,
            setSecondTableReadOnly,
            hasHvdcCapacities,
            isFlowbasedRedOnly
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
    [study, dispatch, user?.profile?.sub, t],
  );

  return { attachTrajectory };
};
