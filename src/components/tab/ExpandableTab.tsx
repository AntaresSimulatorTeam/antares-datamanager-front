/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import {
  CheckBoxData,
  DbTrajectory,
  HypothesisRowData,
  RowStatus,
  SelectOption,
  TableOperationRow,
  TabProps,
  TrajectoryViewData,
} from '@/shared/types';
import { useCallback, useEffect, useState } from 'react';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { useStudy, useStudyDispatch } from '@/store/contexts/StudyContext.tsx';
import { ReadOnlyObject } from '@common/data/stdTable/types/readOnly.type';
import {
  getAreaTrajectoryName,
  getRowDataSelected,
  shouldDeleteCapacityModulation,
} from '@/shared/utils/trajectoryUtils.ts';
import { StudyStatus } from '@/shared/types/common/StudyStatus.type.ts';
import { PegaseHypothesisTable } from '@common/layout/PegaseHypothesisTable/PegaseHypothesisTable.tsx';
import getExpandableHypothesisTableHeaders from '@/components/header/ExpandableHypothesisTableHeaders.tsx';
import { ImportTrajectoryModal } from '@common/modal/ImportTrajectoryModal.tsx';
import { useNewStudyModal } from '@/hooks/useNewStudyModal.ts';
import { useFetchHypothesisTrajectories } from '@/hooks/useFetchHypothesisTrajectories.ts';
import {
  addRow,
  handleFetchTrajectoriesFS,
  handleTrajectorySearch,
  handleViewTrajectory,
} from '@/shared/services/hypothesisTableService.ts';
import { useTrajectoryImport } from '@/hooks/useTrajectoryImport.ts';
import { useTrajectoryAttach } from '@/hooks/useTrajectoryAttach.ts';
import { useHypothesisTableRemoveRow } from '@/hooks/useHypothesisTableRemoveRow.ts';
import { useTrajectoryDetach } from '@/hooks/useTrajectoryDetach.ts';
import { shouldOpenDeletionModal } from '@/shared/helpers/hypothesisTableHelper.ts';
import { AreaDeletionConfirmationModal } from '@common/modal/AreaDeletionConfirmationModal.tsx';
import { CheckBoxListWithSearchBar } from '@/components/list/CheckBoxListWithSearchBar.tsx';
import { useTranslation } from 'react-i18next';
import { TrajectoryDataVisualisation } from '@common/modal/TrajectoryDataVisualisation.tsx';

const ExpandableTab = ({ defaultAreas, areas, studyData, type }: TabProps & { type: TRAJECTORY_TYPE }) => {
  const studyState = useStudy();
  const dispatch = useStudyDispatch();
  const { t } = useTranslation();
  const [checkedValues, setCheckedValues] = useState<string[]>([]);
  const [areasOptions, setAreasOptions] = useState<CheckBoxData[]>([]);
  const [data, setData] = useState<HypothesisRowData[]>([]);
  const [rowIdSelected, setRowIdSelected] = useState<string>('0');
  const [readOnly, setReadOnly] = useState<ReadOnlyObject>({});
  const [installedPowerTechnologies, setInstalledPowerTechnologies] = useState<string[]>([]);
  const { isModalOpen, toggleModal } = useNewStudyModal();
  const [optionsFS, setOptionsFS] = useState<SelectOption[]>();
  const [trajectoryData, setTrajectoryData] = useState<TrajectoryViewData | undefined>();
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [dbTrajectories, setDbTrajectories] = useState<DbTrajectory[]>([]);
  const [rowToDelete, setRowToDelete] = useState<{
    index: number;
    value?: string;
    operation?: TableOperationRow;
  } | null>(null);
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
  const { attachTrajectory } = useTrajectoryAttach(studyData, studyState, dispatch, setReadOnly);
  const { removeRow } = useHypothesisTableRemoveRow(studyData, dispatch, setData, setCheckedValues, setReadOnly);
  const { detachTrajectory } = useTrajectoryDetach(studyData, dispatch, setReadOnly);

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
        addRow(type, value, dispatch, setCheckedValues, setData, installedPowerTechnologies, [], setReadOnly);
      } else if (shouldOpenDeletionModal(type, indexRow, data)) {
        setRowToDelete({ index: indexRow, value });
        setIsDeletionModalOpen(true);
      } else {
        await removeRow(type, indexRow, data, value);
      }
    },
    [data, dispatch, installedPowerTechnologies, removeRow, type],
  );

  const handleSearch = useCallback(
    async (fileNameContains: string, rowId: string) => {
      let typeToUse = type;
      const indexArray = rowId.split('.').map(Number);
      let areaToUse = data[indexArray[0]]?.hypothesis;
      const isLastIndex = indexArray[0] === Math.max(data.length - 1, 0);
      if (type === TRAJECTORY_TYPE.DSR) {
        if (isLastIndex) typeToUse = TRAJECTORY_TYPE.DSR_CAPACITY_MODULATION;
        areaToUse = !isLastIndex ? data[indexArray[0]]?.hypothesis : '';
      }
      const technology = indexArray?.length > 1 ? data[indexArray[0]]?.subRows?.[indexArray[1]]?.hypothesis : undefined;
      return await handleTrajectorySearch(typeToUse, setDbTrajectories, studyData?.horizon, {
        area: areaToUse,
        technology,
        fileNameContains,
      });
    },
    [data, studyData?.horizon, type, setDbTrajectories],
  );

  const handleImport = useCallback(
    async (rowId: string) => {
      const indexArray = rowId.split('.').map(Number);
      let typeToUse = type;
      let areaToUse = data[indexArray[0]]?.hypothesis;
      let isDefaultArea = defaultAreas?.some((area) => area.name === data[indexArray[0]]?.hypothesis);
      const isLastIndex = indexArray[0] === Math.max(data.length - 1, 0);
      if (type === TRAJECTORY_TYPE.DSR) {
        if (isLastIndex) typeToUse = TRAJECTORY_TYPE.DSR_CAPACITY_MODULATION;
        areaToUse = '';
        isDefaultArea = false;
      }
      if (type === TRAJECTORY_TYPE.STS) {
        areaToUse = data[indexArray[0]]?.subRows?.[indexArray[1]]?.hypothesis ?? '';
      }
      await handleFetchTrajectoriesFS(
        typeToUse,
        rowId,
        setOptionsFS,
        setRowIdSelected,
        toggleModal,
        areaToUse,
        isDefaultArea,
      );
    },
    [data, defaultAreas, toggleModal, type],
  );

  const updateData = useCallback(
    (rowId: string, value: unknown, status: RowStatus) => {
      const indexArray = rowId.split('.').map(Number);
      let typeToUse = type;
      const isLastIndex = indexArray[0] === Math.max(data.length - 1, 0);
      if (type === TRAJECTORY_TYPE.DSR && isLastIndex) {
        typeToUse = TRAJECTORY_TYPE.DSR_CAPACITY_MODULATION;
      }
      if (status === 'empty' || status === 'emptyError') {
        const row = getRowDataSelected(data, indexArray) ?? null;
        if (row) {
          const hypothesis = row?.hypothesis ?? '';
          if (type === TRAJECTORY_TYPE.DSR && shouldDeleteCapacityModulation(data, indexArray[0])) {
            setRowToDelete({ index: indexArray[0], value: hypothesis, operation: 'empty' });
            setIsDeletionModalOpen(true);
          } else {
            void detachTrajectory(typeToUse, indexArray, setData, data, status, hypothesis);
          }
        }
      } else if (status === 'success') {
        const dbTrajectory =
          dbTrajectories.length > 0
            ? dbTrajectories.find((item) => item.id === value)
            : getRowDataSelected(data, indexArray)?.trajectory;
        if (dbTrajectory) {
          void attachTrajectory(typeToUse, indexArray, status, dbTrajectory, setData);
        }
      }
    },
    [attachTrajectory, data, dbTrajectories, detachTrajectory, type],
  );

  const removeTableRow = useCallback(
    (value: string, rowId?: string) => {
      if (shouldOpenDeletionModal(type, Number(rowId), data)) {
        setRowToDelete({ index: Number(rowId), value, operation: 'remove' });
        setIsDeletionModalOpen(true);
      } else {
        void removeRow(type, Number(rowId), data, value);
      }
    },
    [data, removeRow, type],
  );

  const handleCloseImportModal = useCallback(
    async (value?: SelectOption) => {
      toggleModal();
      if (value != null) {
        let typeToUse = type;
        const indexArray = rowIdSelected.split('.').map(Number);
        const isLastIndex = indexArray[0] === Math.max(data.length - 1, 0);
        if (type === TRAJECTORY_TYPE.DSR && isLastIndex) {
          typeToUse = TRAJECTORY_TYPE.DSR_CAPACITY_MODULATION;
        }
        await importTrajectory(typeToUse, value, indexArray, data, setData);
      }
    },
    [data, importTrajectory, rowIdSelected, toggleModal, type],
  );

  const getTypeToImport = useCallback(() => {
    let typeToUse = type;
    const indexArray = rowIdSelected.split('.').map(Number);
    const isLastIndex = indexArray[0] === Math.max(data.length - 1, 0);
    if (type === TRAJECTORY_TYPE.DSR && isLastIndex) {
      typeToUse = TRAJECTORY_TYPE.DSR_CAPACITY_MODULATION;
    }
    return typeToUse;
  }, [data, rowIdSelected, type]);

  const handleViewData = useCallback(
    (rowId: string) => {
      const indexArray = rowId.split('.').map(Number);
      const trajectory = data[indexArray[0]]?.subRows?.[indexArray[1]]?.trajectory;
      if (trajectory) {
        void handleViewTrajectory(trajectory, setTrajectoryData, setIsViewModalOpen, t);
      }
    },
    [data, t],
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
        handleSearch={handleSearch}
        handleImport={handleImport}
        isReadOnlyEnable={true}
        updateData={updateData}
        removeRow={removeTableRow}
        handleViewData={type === TRAJECTORY_TYPE.STS ? handleViewData : undefined}
      />
      {isModalOpen && (
        <ImportTrajectoryModal
          options={optionsFS}
          onClose={handleCloseImportModal}
          trajectoryType={getTypeToImport()}
          hypothesis={getAreaTrajectoryName(rowIdSelected, data)}
        />
      )}
      {isViewModalOpen && trajectoryData && (
        <TrajectoryDataVisualisation trajectoryData={trajectoryData} onClose={() => setIsViewModalOpen(false)} />
      )}
      {isDeletionModalOpen && (
        <AreaDeletionConfirmationModal
          isOpen={isDeletionModalOpen}
          onClose={() => setIsDeletionModalOpen(false)}
          onConfirm={async () => {
            if (rowToDelete?.value) {
              const { value, index } = rowToDelete;
              await removeRow(type, index, data, value);
              setIsDeletionModalOpen(false);
            }
          }}
          message={
            type === TRAJECTORY_TYPE.DSR &&
            rowToDelete?.index != null &&
            shouldDeleteCapacityModulation(data, rowToDelete.index)
              ? t('trajectoryDeletionModal.@confirmDeletionCapacityMessage')
              : t('trajectoryDeletionModal.@confirmDeletionMessage')
          }
        />
      )}
    </div>
  );
};

export default ExpandableTab;
