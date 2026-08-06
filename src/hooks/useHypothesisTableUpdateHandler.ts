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
  setIsDeletionModalOpen: Dispatch<SetStateAction<boolean>>;
  dbTrajectories: DbTrajectory[];
  setRowIdSelected: Dispatch<SetStateAction<string>>;
  setReadOnly?: Dispatch<SetStateAction<ReadOnlyObject>>;
  setRowToDelete?: Dispatch<SetStateAction<RowToDeleteProps | null>>;
  setSecondTableReadOnly?: Dispatch<SetStateAction<ReadOnlyObject>>;
}

export const useHypothesisTableUpdateHandler = ({
  studyData,
  setRowToDelete,
  setIsDeletionModalOpen,
  dbTrajectories,
  setRowIdSelected,
  setReadOnly,
  setSecondTableReadOnly,
}: UseHypothesisTableUpdateHandlerArgs) => {
  const studyState = useStudy();
  const dispatch = useStudyDispatch();
  const { attachTrajectory } = useTrajectoryAttach(
    studyData,
    studyState,
    dispatch,
    setReadOnly,
    setSecondTableReadOnly,
  );
  const { detachTrajectory } = useTrajectoryDetach(
    studyData,
    dispatch,
    setReadOnly,
    setIsDeletionModalOpen,
    setRowIdSelected,
    setSecondTableReadOnly,
  );

  const handleHypothesisTableUpdate = useCallback(
    async (
      rowId: string,
      value: unknown,
      status: RowStatus,
      type: TRAJECTORY_TYPE,
      data: HypothesisRowData[],
      setData: Dispatch<SetStateAction<HypothesisRowData[]>>,
    ) => {
      const indexArray = rowId.split('.').map(Number);
      let typeToUse = type;
      const isLastIndex = indexArray[0] === Math.max(data.length - 1, 0);
      if (type === TRAJECTORY_TYPE.AREA) {
        typeToUse = indexArray[0] === 0 ? TRAJECTORY_TYPE.AREA : TRAJECTORY_TYPE.LINK;
      }
      if (type === TRAJECTORY_TYPE.ADEQUACY_PATCH) {
        if (indexArray.length > 1) {
          typeToUse = indexArray[0] === 0 ? TRAJECTORY_TYPE.SETTINGS : TRAJECTORY_TYPE.SETTINGS;// TODO: replace scenario builder
        } else {
          typeToUse = indexArray[0] === 0 ? TRAJECTORY_TYPE.ADEQUACY_PATCH : TRAJECTORY_TYPE.FLOWBASED;
        }
      }
      if (type === TRAJECTORY_TYPE.DSR && isLastIndex) {
        typeToUse = TRAJECTORY_TYPE.DSR_CAPACITY_MODULATION;
      }
      if (type === TRAJECTORY_TYPE.HYDRO_SERIES && indexArray.length === 2 && indexArray[1] === 1) {
        typeToUse = TRAJECTORY_TYPE.HYDRO_TECHNICAL_PARAMETERS;
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
    [attachTrajectory, dbTrajectories, detachTrajectory, setIsDeletionModalOpen, setRowToDelete],
  );
  return { handleHypothesisTableUpdate };
};
