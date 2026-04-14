import { Dispatch, SetStateAction, useCallback } from 'react';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { DbTrajectory, HypothesisRowData, RowStatus, StudyDTO } from '@/shared/types';
import { getRowDataSelected, shouldDeleteCapacityModulation } from '@/shared/utils/trajectoryUtils.ts';
import { useTrajectoryDetach } from '@/hooks/useTrajectoryDetach.ts';
import { useTrajectoryAttach } from '@/hooks/useTrajectoryAttach.ts';
import { RowToDeleteProps } from '@/shared/types/HypothesisTable.ts';
import { ReadOnlyObject } from '@common/data/stdTable/types/readOnly.type';
import { useStudy, useStudyDispatch } from '@/store/contexts/StudyContext.tsx';

interface UseHypothesisTableUpdateHandlerArgs {
  studyData: StudyDTO;
  data: HypothesisRowData[];
  type: TRAJECTORY_TYPE;
  setData: Dispatch<SetStateAction<HypothesisRowData[]>>;
  setIsDeletionModalOpen: Dispatch<SetStateAction<boolean>>;
  dbTrajectories: DbTrajectory[];
  setRowIdSelected: Dispatch<SetStateAction<string>>;
  setReadOnly?: Dispatch<SetStateAction<ReadOnlyObject>>;
  setRowToDelete?: Dispatch<SetStateAction<RowToDeleteProps | null>>;
}

export const useHypothesisTableUpdateHandler = ({
  studyData,
  data,
  type,
  setData,
  setRowToDelete,
  setIsDeletionModalOpen,
  dbTrajectories,
  setRowIdSelected,
  setReadOnly,
}: UseHypothesisTableUpdateHandlerArgs) => {
  const studyState = useStudy();
  const dispatch = useStudyDispatch();
  const { attachTrajectory } = useTrajectoryAttach(studyData, studyState, dispatch, setReadOnly);
  const { detachTrajectory } = useTrajectoryDetach(
    studyData,
    dispatch,
    setReadOnly,
    setIsDeletionModalOpen,
    setRowIdSelected,
  );

  const handleHypothesisTableUpdate = useCallback(
    async (rowId: string, value: unknown, status: RowStatus) => {
      const indexArray = rowId.split('.').map(Number);
      let typeToUse = type;
      const isLastIndex = indexArray[0] === Math.max(data.length - 1, 0);
      if (type === TRAJECTORY_TYPE.AREA) {
        typeToUse = indexArray[0] === 0 ? TRAJECTORY_TYPE.AREA : TRAJECTORY_TYPE.LINK;
      }
      if (type === TRAJECTORY_TYPE.DSR && isLastIndex) {
        typeToUse = TRAJECTORY_TYPE.DSR_CAPACITY_MODULATION;
      }
      if (status === 'empty' || status === 'emptyError') {
        const row = getRowDataSelected(data, indexArray) ?? null;
        if (row) {
          const hypothesis = row?.hypothesis ?? '';
          if (type === TRAJECTORY_TYPE.DSR && shouldDeleteCapacityModulation(data, indexArray[0])) {
            setRowToDelete?.({ index: indexArray[0], value: hypothesis, operation: 'empty' });
            setIsDeletionModalOpen(true);
          } else {
            await detachTrajectory(typeToUse, indexArray, setData, data, status, hypothesis);
          }
        }
      } else if (status === 'success') {
        const dbTrajectory =
          dbTrajectories.length > 0
            ? dbTrajectories.find((item) => item.id === value)
            : getRowDataSelected(data, indexArray)?.trajectory;
        if (dbTrajectory) {
          await attachTrajectory(typeToUse, indexArray, status, dbTrajectory, setData);
        }
      }
    },
    [attachTrajectory, data, dbTrajectories, detachTrajectory, setData, setIsDeletionModalOpen, setRowToDelete, type],
  );
  return { handleHypothesisTableUpdate };
};
