/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { CheckBoxData, DbTrajectory, HypothesisRowData, RowStatus, SelectOption, TabProps } from '@/shared/types';
import { useCallback, useEffect, useState } from 'react';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { useStudy, useStudyDispatch } from '@/store/contexts/StudyContext.tsx';
import { ReadOnlyObject } from '@common/data/stdTable/types/readOnly.type';
import { getAreaTrajectoryName, getRowDataSelected } from '@/shared/utils/trajectoryUtils.ts';
import { StudyStatus } from '@/shared/types/common/StudyStatus.type.ts';
import { PegaseHypothesisTable } from '@common/layout/PegaseHypothesisTable/PegaseHypothesisTable.tsx';
import getExpandableHypothesisTableHeaders from '@/components/header/ExpandableHypothesisTableHeaders.tsx';
import { ImportTrajectoryModal } from '@common/modal/ImportTrajectoryModal.tsx';
import { useNewStudyModal } from '@/hooks/useNewStudyModal.ts';
import { useFetchHypothesisTrajectories } from '@/hooks/useFetchHypothesisTrajectories.ts';
import { addRow, handleFetchTrajectoriesFS, handleTrajectorySearch } from '@/shared/services/hypothesisTableService.ts';
import { useTrajectoryImport } from '@/hooks/useTrajectoryImport.ts';
import { useTrajectoryAttach } from '@/hooks/useTrajectoryAttach.ts';
import { useHypothesisTableRemoveRow } from '@/hooks/useHypothesisTableRemoveRow.ts';
import { useTrajectoryDetach } from '@/hooks/useTrajectoryDetach.ts';
import { shouldOpenDeletionModal } from '@/shared/helpers/hypothesisTableHelper.ts';
import { AreaDeletionConfirmationModal } from '@common/modal/AreaDeletionConfirmationModal.tsx';
import { CheckBoxListWithSearchBar } from '@/components/list/CheckBoxListWithSearchBar.tsx';

const ExpandableTab = ({ defaultAreas, areas, studyData, type }: TabProps & { type: TRAJECTORY_TYPE }) => {
  const studyState = useStudy();
  const dispatch = useStudyDispatch();
  const [checkedValues, setCheckedValues] = useState<string[]>([]);
  const [areasOptions, setAreasOptions] = useState<CheckBoxData[]>([]);
  const [data, setData] = useState<HypothesisRowData[]>([]);
  const [rowIdSelected, setRowIdSelected] = useState<string>('0');
  const [readOnly, setReadOnly] = useState<ReadOnlyObject>({});
  const [installedPowerTechnologies, setInstalledPowerTechnologies] = useState<string[]>([]);
  const { isModalOpen, toggleModal } = useNewStudyModal();
  const [optionsFS, setOptionsFS] = useState<SelectOption[]>();
  const [dbTrajectories, setDbTrajectories] = useState<DbTrajectory[]>([]);
  const [rowToDelete, setRowToDelete] = useState<{ index: number; value?: string } | null>(null);
  const [isDeletionModalOpen, setIsDeletionModalOpen] = useState(false);
  const { hypothesisTrajectories, areasTrajectoryOptions, dropDownListOptions, readOnlyRow, technologyList } =
    useFetchHypothesisTrajectories(
      areas,
      [type],
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
      [technologyList, setInstalledPowerTechnologies],
      [hypothesisTrajectories, setData],
      [readOnlyRow, setReadOnly],
    ] as const;

    mapping.forEach(([record, setter]) => {
      const value = record?.[type];
      if (value !== undefined) {
        // @ts-ignore
        setter(value);
      }
    });
  }, [
    areasTrajectoryOptions,
    dropDownListOptions,
    hypothesisTrajectories,
    technologyList,
    readOnlyRow,
    studyState.studyStatus,
    type,
  ]);

  const handleSelectionChange = useCallback(
    async (value: string, isChecked?: boolean) => {
      const indexRow = data.findIndex((row) => row.hypothesis === value);
      if (isChecked) {
        addRow(type, value, dispatch, setCheckedValues, setData, installedPowerTechnologies);
      } else if (shouldOpenDeletionModal(type, indexRow, data)) {
        setRowToDelete({ index: indexRow, value });
        setIsDeletionModalOpen(true);
      } else {
        await removeRow(type, indexRow, data, value);
      }
    },
    [data, dispatch, installedPowerTechnologies, removeRow, type],
  );

  return (
    <div className="flex h-fit w-full gap-6 xl:gap-7 2xl:gap-8">
      <CheckBoxListWithSearchBar
        checkedValues={checkedValues}
        options={areasOptions}
        handleSelectionChange={handleSelectionChange}
        dividerPosition={defaultAreas.length}
        disabled={studyState.studyStatus === StudyStatus.GENERATED || studyData.status === StudyStatus.GENERATED}
      />
      <PegaseHypothesisTable
        id="thermal-table"
        data={data}
        getTableHeaders={getExpandableHypothesisTableHeaders}
        fileStatus={fileStatus}
        isStudyGenerated={
          studyState.studyStatus === StudyStatus.GENERATED || studyData.status === StudyStatus.GENERATED
        }
        readOnly={readOnly}
        progress={progress}
        idSelected={rowIdSelected}
        type={type}
        list={installedPowerTechnologies}
        handleSearch={async (fileNameContains: string, rowId: string) => {
          const indexArray = rowId.split('.').map(Number);
          const technology =
            indexArray?.length > 1 ? data[indexArray[0]]?.subRows?.[indexArray[1]]?.hypothesis : undefined;
          return await handleTrajectorySearch(type, setDbTrajectories, studyData?.horizon, {
            area: data[indexArray[0]]?.hypothesis,
            technology,
            fileNameContains,
          });
        }}
        handleImport={async (rowId: string) => {
          const indexArray = rowId.split('.').map(Number);
          const isDefaultArea = defaultAreas?.some((area) => area.name === data[indexArray[0]]?.hypothesis);
          await handleFetchTrajectoriesFS(
            type,
            rowId,
            setOptionsFS,
            setRowIdSelected,
            toggleModal,
            data[indexArray[0]]?.hypothesis,
            isDefaultArea,
          );
        }}
        isReadOnlyEnable={true}
        updateData={(rowId: string, value: unknown, status: RowStatus) => {
          const indexArray = rowId.split('.').map(Number);
          if (status === 'empty' || status === 'emptyError') {
            const row = getRowDataSelected(data, indexArray) ?? null;
            if (row) {
              void detachTrajectory(type, indexArray, setData, data, status, row?.hypothesis);
            }
          } else if (status === 'success') {
            const dbTrajectory =
              dbTrajectories.length > 0
                ? dbTrajectories.find((item) => item.id === value)
                : getRowDataSelected(data, indexArray)?.trajectory;
            if (dbTrajectory) {
              void attachTrajectory(type, indexArray, status, dbTrajectory, setData);
            }
          }
        }}
        removeRow={(value: string, rowId?: string) => {
          if (shouldOpenDeletionModal(type, Number(rowId), data)) {
            setRowToDelete({ index: Number(rowId), value });
            setIsDeletionModalOpen(true);
          } else {
            void removeRow(type, Number(rowId), data, value);
          }
        }}
      />
      {isModalOpen && (
        <ImportTrajectoryModal
          options={optionsFS}
          onClose={async (value?: SelectOption) => {
            toggleModal();
            if (value != null) {
              const indexArray = rowIdSelected.split('.').map(Number);
              await importTrajectory(type, value, indexArray, data, setData);
            }
          }}
          trajectoryType={type}
          hypothesis={getAreaTrajectoryName(rowIdSelected, data)}
        />
      )}
      {isDeletionModalOpen && (
        <AreaDeletionConfirmationModal
          isOpen={isDeletionModalOpen}
          onClose={() => setIsDeletionModalOpen(false)}
          onConfirm={async () => {
            if (rowToDelete?.value) {
              await removeRow(type, rowToDelete.index, data, rowToDelete?.value);
              setIsDeletionModalOpen(false);
            }
          }}
        />
      )}
    </div>
  );
};

export default ExpandableTab;
