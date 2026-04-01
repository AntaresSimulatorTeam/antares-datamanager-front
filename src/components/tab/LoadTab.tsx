/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect, useState } from 'react';
import { CheckBoxData, DbTrajectory, HypothesisRowData, RowStatus, SelectOption, TabProps } from '@/shared/types';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { useStudy, useStudyDispatch } from '@/store/contexts/StudyContext.tsx';
import { ReadOnlyObject } from '@common/data/stdTable/types/readOnly.type';
import getEditableHypothesisTableHeaders from '@/components/header/EditableHypothesisTableHeaders.tsx';
import { ImportTrajectoryModal } from '@common/modal/ImportTrajectoryModal.tsx';
import { useNewStudyModal } from '@/hooks/useNewStudyModal.ts';
import { DeletionModal } from '@common/modal/DeletionModal.tsx';
import { StudyStatus } from '@/shared/types/common/StudyStatus.type.ts';
import { PegaseHypothesisTable } from '@common/layout/PegaseHypothesisTable/PegaseHypothesisTable.tsx';
import { useFetchHypothesisTrajectories } from '@/hooks/useFetchHypothesisTrajectories.ts';
import { addRow, handleFetchTrajectoriesFS, handleTrajectorySearch } from '@/shared/services/hypothesisTableService.ts';
import { shouldOpenDeletionModal } from '@/shared/helpers/hypothesisTableHelper.ts';
import { useTrajectoryImport } from '@/hooks/useTrajectoryImport.ts';
import { useTrajectoryAttach } from '@/hooks/useTrajectoryAttach.ts';
import { useTrajectoryDetach } from '@/hooks/useTrajectoryDetach.ts';
import { useHypothesisTableRemoveRow } from '@/hooks/useHypothesisTableRemoveRow.ts';
import { CheckBoxListWithSearchBar } from '@/components/list/CheckBoxListWithSearchBar.tsx';
import { getAreaTrajectoryName } from '@/shared/utils/trajectoryUtils.ts';

export const LoadTab = ({ defaultAreas, areas, studyData }: TabProps) => {
  const studyState = useStudy();
  const dispatch = useStudyDispatch();
  const [readOnly, setReadOnly] = useState<ReadOnlyObject>({});
  const [data, setData] = useState<HypothesisRowData[]>([]);
  const [areasOptions, setAreasOptions] = useState<CheckBoxData[]>([]);
  const [checkedValues, setCheckedValues] = useState<string[]>([]);
  const { isModalOpen, toggleModal } = useNewStudyModal();
  const [isDeletionModalOpen, setIsDeletionModalOpen] = useState(false);
  const [rowIdSelected, setRowIdSelected] = useState<string>('0');
  const [optionsFS, setOptionsFS] = useState<SelectOption[]>();
  const [dbTrajectories, setDbTrajectories] = useState<DbTrajectory[]>([]);
  const [rowToDelete, setRowToDelete] = useState<{ index: number; value?: string } | null>(null);
  const { hypothesisTrajectories, areasTrajectoryOptions, dropDownListOptions, readOnlyRow } =
    useFetchHypothesisTrajectories(
      areas,
      [TRAJECTORY_TYPE.LOAD],
      defaultAreas,
      studyData?.id,
      studyData?.status,
      studyState.studyStatus,
    );
  const { fileStatus, progress, importTrajectory } = useTrajectoryImport(studyData, studyState, dispatch);
  const { attachTrajectory } = useTrajectoryAttach(studyData, studyState, dispatch);
  const { removeRow } = useHypothesisTableRemoveRow(studyData, dispatch, setData, setCheckedValues);
  const { detachTrajectory } = useTrajectoryDetach(studyData, dispatch);

  useEffect(() => {
    const mapping = [
      [areasTrajectoryOptions, setAreasOptions],
      [dropDownListOptions, setCheckedValues],
      [hypothesisTrajectories, setData],
      [readOnlyRow, setReadOnly],
    ] as const;

    mapping.forEach(([record, setter]) => {
      const value = record?.[TRAJECTORY_TYPE.LOAD];
      if (value !== undefined) {
        // @ts-ignore
        setter(value);
      }
    });
  }, [hypothesisTrajectories]);

  const handleSelectionChange = useCallback(
    async (value: string, isChecked?: boolean): Promise<void> => {
      const indexRow = data.findIndex((row) => row.hypothesis === value);
      if (isChecked) {
        addRow(TRAJECTORY_TYPE.LOAD, value, dispatch, setCheckedValues, setData);
      } else if (shouldOpenDeletionModal(TRAJECTORY_TYPE.LOAD, indexRow, data)) {
        setRowToDelete({ index: indexRow, value });
        setIsDeletionModalOpen(true);
      } else {
        await removeRow(TRAJECTORY_TYPE.LOAD, indexRow, data, value);
      }
    },
    [data, dispatch, removeRow, setCheckedValues],
  );

  return (
    <div className="flex min-h-0 w-full gap-6 xl:gap-7 2xl:gap-8">
      <CheckBoxListWithSearchBar
        checkedValues={checkedValues}
        options={areasOptions}
        handleSelectionChange={handleSelectionChange}
        dividerPosition={defaultAreas.length}
        disabled={studyState.studyStatus === StudyStatus.GENERATED || studyData.status === StudyStatus.GENERATED}
      />
      <PegaseHypothesisTable
        id="load-table"
        data={data}
        getTableHeaders={getEditableHypothesisTableHeaders}
        fileStatus={fileStatus}
        isStudyGenerated={
          studyState.studyStatus === StudyStatus.GENERATED || studyData.status === StudyStatus.GENERATED
        }
        readOnly={readOnly}
        progress={progress}
        idSelected={String(rowIdSelected)}
        handleSearch={async (fileNameContains: string, rowId: string) =>
          await handleTrajectorySearch(TRAJECTORY_TYPE.LOAD, setDbTrajectories, studyData?.horizon, {
            area: data[Number(rowId)]?.hypothesis,
            fileNameContains,
          })
        }
        handleImport={async (rowId: string) => {
          await handleFetchTrajectoriesFS(
            TRAJECTORY_TYPE.LOAD,
            rowId,
            setOptionsFS,
            setRowIdSelected,
            toggleModal,
            data[Number(rowId)]?.hypothesis,
          );
        }}
        removeRow={(value: string, rowId?: string) => {
          if (shouldOpenDeletionModal(TRAJECTORY_TYPE.LOAD, Number(rowId), data)) {
            setRowToDelete({ index: Number(rowId), value });
            setIsDeletionModalOpen(true);
          } else {
            void removeRow(TRAJECTORY_TYPE.LOAD, Number(rowId), data, value);
          }
        }}
        updateData={(rowId: string, value: unknown, status: RowStatus) => {
          const index = Number(rowId);
          const row = data[index];
          const trajectory = row?.trajectory;
          if ((status === 'empty' && trajectory) || (status === 'emptyError' && trajectory)) {
            void detachTrajectory(TRAJECTORY_TYPE.LOAD, [index], setData, data, status, row?.hypothesis);
          } else if (status === 'success') {
            const dbTrajectory = dbTrajectories.find((item) => item.id === value) ?? trajectory;
            if (dbTrajectory)
              void attachTrajectory(TRAJECTORY_TYPE.LOAD, [Number(rowId)], status, dbTrajectory, setData);
          }
        }}
        isReadOnlyEnable={true}
      />
      {isModalOpen && (
        <ImportTrajectoryModal
          options={optionsFS}
          onClose={async (value?: SelectOption) => {
            toggleModal();
            if (value != null) {
              await importTrajectory(TRAJECTORY_TYPE.LOAD, value, [Number(rowIdSelected)], data, setData);
            }
          }}
          trajectoryType={TRAJECTORY_TYPE.LOAD}
          hypothesis={getAreaTrajectoryName(rowIdSelected, data)}
        />
      )}
      {isDeletionModalOpen && (
        <DeletionModal
          onClose={() => setIsDeletionModalOpen(false)}
          handleDeletionRow={async () => {
            if (rowToDelete?.value) {
              await removeRow(TRAJECTORY_TYPE.LOAD, rowToDelete.index, data, rowToDelete?.value);
              setIsDeletionModalOpen(false);
            }
          }}
        />
      )}
    </div>
  );
};
