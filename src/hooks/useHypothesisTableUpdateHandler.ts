import { Dispatch, SetStateAction, useCallback } from 'react';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { DbTrajectory, HypothesisRowData, RowStatus, StudyDTO } from '@/shared/types';
import { getHypothesis, getRowDataSelected, shouldDeleteCapacityModulation } from '@/shared/utils/trajectoryUtils.ts';
import { useTrajectoryDetach } from '@/hooks/useTrajectoryDetach.ts';
import { useTrajectoryAttach } from '@/hooks/useTrajectoryAttach.ts';
import { RowToDeleteProps } from '@/shared/types/HypothesisTable.ts';
import { ReadOnlyObject } from '@common/data/stdTable/types/readOnly.type';
import { useStudyDispatch } from '@/store/contexts/StudyContext.tsx';
import { getTypeToUse } from '@/shared/helpers/hypothesisTableHelper.ts';

interface UseHypothesisTableUpdateHandlerArgs {
  studyData: StudyDTO;
  setIsDeletionModalOpen: Dispatch<SetStateAction<boolean>>;
  dbTrajectories: DbTrajectory[];
  setRowIdSelected: Dispatch<SetStateAction<string>>;
  setRowToDelete?: Dispatch<SetStateAction<RowToDeleteProps | null>>;
}

export const useHypothesisTableUpdateHandler = ({
  studyData,
  setRowToDelete,
  setIsDeletionModalOpen,
  dbTrajectories,
  setRowIdSelected,
}: UseHypothesisTableUpdateHandlerArgs) => {
  const dispatch = useStudyDispatch();
  const { attachTrajectory } = useTrajectoryAttach(
    studyData,
    dispatch,
  );
  const { detachTrajectory } = useTrajectoryDetach(
    studyData,
    dispatch,
    setIsDeletionModalOpen,
    setRowIdSelected,
  );

  interface HandleHypothesisTableUpdateArgs {
    rowId?: string;
    value?: unknown;
    status?: RowStatus;
    type: TRAJECTORY_TYPE;
    data: HypothesisRowData[];
    setData: Dispatch<SetStateAction<HypothesisRowData[]>>;
    setReadOnly: Dispatch<SetStateAction<ReadOnlyObject>>;
    setSecondTableReadOnly?: Dispatch<SetStateAction<ReadOnlyObject>>;
    secondData?: HypothesisRowData[];
    setSecondData?: Dispatch<SetStateAction<HypothesisRowData[]>>;
    shouldUpdateHvdc?: boolean;
  }

  const handleHypothesisTableUpdate = useCallback(
    async ({ rowId,
        value,
        status,
        type,
        data,
        setData,
        setReadOnly,
        setSecondTableReadOnly,
        secondData,
        setSecondData,
        shouldUpdateHvdc
    } : HandleHypothesisTableUpdateArgs) => {
      const indexArray = rowId?.split('.').map(Number) ?? [];
      const typeToUse = getTypeToUse(type, indexArray, data.length);
      if (status === 'empty' || status === 'emptyError') {
        const row = getRowDataSelected(data, indexArray) ?? null;
        if (!row) return;

        const hypothesisInfo = rowId ? getHypothesis(data, rowId) : {hypothesis: '', technology: ''};
        if (type === TRAJECTORY_TYPE.DSR && shouldDeleteCapacityModulation(data, indexArray?.[0])) {
          setRowToDelete?.({ index: indexArray?.[0], value: hypothesisInfo?.hypothesis, operation: 'empty' });
          setIsDeletionModalOpen(true);
        } else {
          await detachTrajectory({type: typeToUse, indexArray, setData, data, status, hypothesis: hypothesisInfo?.hypothesis, setReadOnly, setSecondTableReadOnly, secondData, setSecondData, shouldUpdateHvdc});
        }
      } else if (status === 'success') {
        const trajectory = dbTrajectories.length > 0 ? dbTrajectories.find((item) => item.id == value) : getRowDataSelected(data, indexArray)?.trajectory;
        if (trajectory) {
          await attachTrajectory({type: typeToUse, indexArray, status, trajectory, setData, setReadOnly, setSecondTableReadOnly, isFlowbasedRedOnly: data?.[1]?.hvdc});
        }
      }
    },
    [attachTrajectory, dbTrajectories, detachTrajectory, setIsDeletionModalOpen, setRowToDelete],
  );
  return { handleHypothesisTableUpdate };
};
