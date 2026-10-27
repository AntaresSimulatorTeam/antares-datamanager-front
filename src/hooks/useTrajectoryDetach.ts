import { Dispatch, SetStateAction, useCallback } from 'react';
import { TRAJECTORY_SELECTION_STATUS, TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import {
  DbTrajectory,
  HypothesisRowData,
  RowStatus,
  StudyActionType,
  StudyDTO,
  TrajectoryBackendError,
} from '@/shared/types';
import { ReadOnlyObject } from '@/shared/types/HypothesisTable.ts';
import { useTrajectoryDeletionLogic } from './useTrajectoryDeletionLogic';
import { handleTrajectoryError } from '@/shared/services/hypothesisTableService.ts';
import { useUser } from '@/store/contexts/UserContext.tsx';
import { useTranslation } from 'react-i18next';
import { STUDY_ACTION } from '@/shared/enum/study.ts';
import { updateTableAfterCellDetach } from '@/shared/helpers/hypothesisTableHelper.ts';
import { buildErrorTrajectory, buildReadOnlyRow } from '@/shared/utils/trajectoryUtils.ts';
import { updateStudy } from '@/shared/services/studyService.ts';

interface BackendDeletionParams {
  trajectoryToDelete: DbTrajectory | null;
  trajectoryIds: number[];
  status: RowStatus;
  studyId: number;
  performBackendDeletion: (ids: number[]) => Promise<void>;
}

const executeBackendDeletion = async ({
  trajectoryToDelete,
  trajectoryIds,
  status,
  studyId,
  performBackendDeletion,
}: BackendDeletionParams): Promise<{ hvdcValue?: boolean; recalculateValue?: boolean }> => {
  if (!trajectoryToDelete || !trajectoryIds?.length || status !== 'empty') {
    return {};
  }

  await performBackendDeletion(trajectoryIds);

  let hvdcValue: boolean | undefined;
  let recalculateValue: boolean | undefined;

  if (trajectoryToDelete.type === TRAJECTORY_TYPE.LINK) {
    await updateStudy({ hvdc: false }, studyId);
    hvdcValue = false;
  }
  if (trajectoryToDelete.type === TRAJECTORY_TYPE.FLOWBASED) {
    await updateStudy({ recalculate: false }, studyId);
    recalculateValue = false;
  }

  return { hvdcValue, recalculateValue };
};

const updateStoreAfterDetach = (
  trajectoryToDelete: DbTrajectory | null,
  status: RowStatus,
  dispatch: Dispatch<StudyActionType> | null,
) => {
  if (!trajectoryToDelete || status === 'emptyError') return;

  if (trajectoryToDelete.type === TRAJECTORY_TYPE.AREA) {
    dispatch?.({
      type: STUDY_ACTION.CLEAR_TRAJECTORY_BY_TYPE,
      payload: [TRAJECTORY_TYPE.AREA],
    });
  } else {
    dispatch?.({
      type: STUDY_ACTION.UPDATE_TRAJECTORY,
      payload: { trajectory: trajectoryToDelete, status },
    });
  }
};

interface ApplyTableUpdateParams {
  type: TRAJECTORY_TYPE;
  data: HypothesisRowData[];
  additionalTrajectory: DbTrajectory | null;
  indexArray: number[];
  study: StudyDTO;
  options: { hvdcValue?: boolean; recalculateValue?: boolean };
  trajectoryToDelete: DbTrajectory | null;
  setData: Dispatch<SetStateAction<HypothesisRowData[]>>;
  setReadOnly?: Dispatch<SetStateAction<ReadOnlyObject>>;
  setSecondTableReadOnly?: Dispatch<SetStateAction<ReadOnlyObject>>;
}

const applyTableDetachUpdate = async ({
  type,
  data,
  additionalTrajectory,
  indexArray,
  study,
  options,
  trajectoryToDelete,
  setData,
  setReadOnly,
  setSecondTableReadOnly,
}: ApplyTableUpdateParams) => {
  const { newData, newReadOnly } = await updateTableAfterCellDetach({
    type,
    data,
    additionalTrajectory,
    indexArray,
    studyId: study.id,
    horizon: study.horizon,
    options,
  });

  setData(newData);
  if (newReadOnly) {
    setReadOnly?.((prev) => ({ ...prev, ...newReadOnly }));
    if (trajectoryToDelete?.type === TRAJECTORY_TYPE.AREA) {
      setSecondTableReadOnly?.(buildReadOnlyRow(['0', '1', '2.0', '2.1']));
    }
  }
};

interface AreaDetachErrorParams {
  indexArray: number[];
  trajectoryIds: number[];
  trajectoryToDelete: DbTrajectory | null;
  data: HypothesisRowData[];
  userSub?: string | null;
  dispatch: Dispatch<StudyActionType> | null;
  setData: Dispatch<SetStateAction<HypothesisRowData[]>>;
  setReadOnly?: Dispatch<SetStateAction<ReadOnlyObject>>;
  performBackendDeletion: (ids: number[]) => Promise<void>;
}

const handleAreaDetachError = async ({
  indexArray,
  trajectoryIds,
  trajectoryToDelete,
  data,
  userSub,
  dispatch,
  setData,
  setReadOnly,
  performBackendDeletion,
}: AreaDetachErrorParams) => {
  const newDbTrajectory = buildErrorTrajectory(
    indexArray[0] === 0 ? TRAJECTORY_TYPE.AREA : TRAJECTORY_TYPE.LINK,
    trajectoryIds[0],
    trajectoryToDelete?.trajectoryName ?? '',
    userSub ?? null,
    '',
  );

  const shouldUnlink =
    indexArray[0] === 0 && data[1]?.trajectory && data[1]?.status !== TRAJECTORY_SELECTION_STATUS.ERROR;

  if (shouldUnlink && data[1]?.trajectory?.id) {
    await performBackendDeletion([data[1]?.trajectory?.id]);
    dispatch?.({
      type: STUDY_ACTION.CLEAR_TRAJECTORY_BY_TYPE,
      payload: [TRAJECTORY_TYPE.LINK],
    });
  }

  setData((prev) =>
    prev.map((item, index) => {
      if (index === indexArray[0]) {
        return {
          ...item,
          trajectory: newDbTrajectory,
          status: TRAJECTORY_SELECTION_STATUS.ERROR,
        };
      }
      if (shouldUnlink) {
        return {
          ...item,
          trajectory: null,
          status: TRAJECTORY_SELECTION_STATUS.MISSING,
        };
      }
      return item;
    }),
  );

  setReadOnly?.({ '0': false, '1': false });
};

interface DetachErrorParams {
  error: unknown;
  type: TRAJECTORY_TYPE;
  indexArray: number[];
  trajectoryIds: number[];
  trajectoryToDelete: DbTrajectory | null;
  data: HypothesisRowData[];
  study: StudyDTO;
  userSub?: string | null;
  dispatch: Dispatch<StudyActionType> | null;
  t: (key: string, options?: Record<string, unknown>) => string;
  setData: Dispatch<SetStateAction<HypothesisRowData[]>>;
  setReadOnly?: Dispatch<SetStateAction<ReadOnlyObject>>;
  performBackendDeletion: (ids: number[]) => Promise<void>;
  setIsDeletionModalOpen?: Dispatch<SetStateAction<boolean>>;
  setRowIdSelected?: Dispatch<SetStateAction<string>>;
}

const handleDetachError = async ({
  error,
  type,
  indexArray,
  trajectoryIds,
  trajectoryToDelete,
  data,
  study,
  userSub,
  dispatch,
  t,
  setData,
  setReadOnly,
  performBackendDeletion,
  setIsDeletionModalOpen,
  setRowIdSelected,
}: DetachErrorParams) => {
  if ((error as TrajectoryBackendError).message?.includes('Confirmation required')) {
    setRowIdSelected?.(String(indexArray[0]));
    setIsDeletionModalOpen?.(true);
    return;
  }

  if (type === TRAJECTORY_TYPE.AREA) {
    await handleAreaDetachError({
      indexArray,
      trajectoryIds,
      trajectoryToDelete,
      data,
      userSub,
      dispatch,
      setData,
      setReadOnly,
      performBackendDeletion,
    });
  }

  const message = t('studyDetails.@notificationAlert', {
    studyName: study.name,
    trajectoryName: trajectoryToDelete?.trajectoryName,
    trajectoryType: trajectoryToDelete?.area,
  });

  handleTrajectoryError(
    type,
    indexArray,
    { id: trajectoryToDelete?.id ?? 0, label: trajectoryToDelete?.trajectoryName ?? '' },
    trajectoryToDelete?.area ?? '',
    userSub ?? '',
    setData,
    { message, content: (error as Error)?.message },
    trajectoryToDelete?.technology,
  );
};

export const useTrajectoryDetach = (
  study: StudyDTO,
  dispatch: Dispatch<StudyActionType> | null,
  setIsDeletionModalOpen?: Dispatch<SetStateAction<boolean>>,
  setRowIdSelected?: Dispatch<SetStateAction<string>>,
) => {
  const { user } = useUser();
  const { t } = useTranslation();
  const { computeDeletion, performBackendDeletion } = useTrajectoryDeletionLogic(study);

  const detachTrajectory = useCallback(
    async (
      type: TRAJECTORY_TYPE,
      indexArray: number[],
      setData: Dispatch<SetStateAction<HypothesisRowData[]>>,
      data: HypothesisRowData[],
      status: RowStatus,
      hypothesis: string,
      setReadOnly: Dispatch<SetStateAction<ReadOnlyObject>>,
      setSecondTableReadOnly?: Dispatch<SetStateAction<ReadOnlyObject>>,
    ): Promise<void> => {
      const { trajectoryIds, trajectoryToDelete, additionalTrajectory } = computeDeletion(
        type,
        data,
        null,
        indexArray,
        hypothesis,
        status,
      );

      try {
        const options = await executeBackendDeletion({
          trajectoryToDelete,
          trajectoryIds,
          status,
          studyId: study.id,
          performBackendDeletion,
        });

        updateStoreAfterDetach(trajectoryToDelete, status, dispatch);

        await applyTableDetachUpdate({
          type,
          data,
          additionalTrajectory,
          indexArray,
          study,
          options,
          trajectoryToDelete,
          setData,
          setReadOnly,
          setSecondTableReadOnly,
        });
      } catch (error) {
        await handleDetachError({
          error,
          type,
          indexArray,
          trajectoryIds,
          trajectoryToDelete,
          data,
          study,
          userSub: user?.profile?.sub,
          dispatch,
          t,
          setData,
          setReadOnly,
          performBackendDeletion,
          setIsDeletionModalOpen,
          setRowIdSelected,
        });
      }
    },
    [
      computeDeletion,
      dispatch,
      study,
      performBackendDeletion,
      t,
      user?.profile?.sub,
      setIsDeletionModalOpen,
      setRowIdSelected,
    ],
  );

  return { detachTrajectory };
};
