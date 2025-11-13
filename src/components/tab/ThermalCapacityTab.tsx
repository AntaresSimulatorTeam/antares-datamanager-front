/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import {
  CheckBoxData,
  DbTrajectory,
  HypothesisRowData,
  LocationStudy,
  RowStatus,
  SelectOption,
  TabProps,
} from '@/shared/types';
import { useCallback, useEffect, useState } from 'react';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { useStudy, useStudyDispatch } from '@/store/contexts/StudyContext.tsx';
import { ReadOnlyObject } from '@common/data/stdTable/types/readOnly.type';
import { generateReadOnlyIndexMap, getAreaTrajectoryName, getRowDataSelected } from '@/shared/utils/trajectoryUtils.ts';
import { StudyStatus } from '@/shared/types/common/StudyStatus.type.ts';
import { PegaseHypothesisTable } from '@common/layout/PegaseHypothesisTable/PegaseHypothesisTable.tsx';
import getExpandableHypothesisTableHeaders from '@/components/header/ExpandableHypothesisTableHeaders.tsx';
import { ImportTrajectoryModal } from '@common/modal/ImportTrajectoryModal.tsx';
import { useNewStudyModal } from '@/hooks/useNewStudyModal.ts';
import { useLocation } from 'react-router-dom';
import { useFetchHypothesisTrajectories } from '@/hooks/useFetchHypothesisTrajectories.ts';
import { addRow, handleFetchTrajectoriesFS, handleTrajectorySearch } from '@/shared/services/hypothesisTableService.ts';
import { useTrajectoryImport } from '@/hooks/useTrajectoryImport.ts';
import { useTrajectoryAttach } from '@/hooks/useTrajectoryAttach.ts';
import { useHypothesisTableRemoveRow } from '@/hooks/useHypothesisTableRemoveRow.ts';
import { useTrajectoryDetach } from '@/hooks/useTrajectoryDetach.ts';
import { shouldOpenDeletionModal } from '@/shared/helpers/hypothesisTableHelper.ts';
import { OTHER_AREAS_LABEL } from '@/shared/const/studyConfig';
import { OTHER_AREAS } from '@/shared/const/studyConfig.ts';
import { AreaDeletionConfirmationModal } from '@common/modal/AreaDeletionConfirmationModal.tsx';
import { CheckBoxListWithSearchBar } from '@/components/list/CheckBoxListWithSearchBar.tsx';
import { ThermalOptions } from '@/mocks/data/list/names.ts';

const ThermalCapacityTab = ({ defaultAreas, areas }: TabProps) => {
  const studyState = useStudy();
  const location = useLocation();
  const study = (location.state as LocationStudy)?.study;
  const dispatch = useStudyDispatch();
  const [checkedValues, setCheckedValues] = useState<string[]>([]);
  const [areasOptions, setAreasOptions] = useState<CheckBoxData[]>([]);
  const [data, setData] = useState<HypothesisRowData[]>([]);
  const [rowIdSelected, setRowIdSelected] = useState<string>('0');
  const [readOnly, setReadOnly] = useState<ReadOnlyObject>({});
  const { isModalOpen, toggleModal } = useNewStudyModal();
  const [optionsFS, setOptionsFS] = useState<SelectOption[]>();
  const [dbTrajectories, setDbTrajectories] = useState<DbTrajectory[]>([]);
  const [rowToDelete, setRowToDelete] = useState<{ index: number; value?: string } | null>(null);
  const [isDeletionModalOpen, setIsDeletionModalOpen] = useState(false);
  const [isStudyGenerated, setIsStudyGenerated] = useState(
    studyState.studyStatus === StudyStatus.GENERATED || study.status === StudyStatus.GENERATED,
  );
  const { hypothesisTrajectories, areasTrajectoryOptions, dropDownListOptions, readOnlyRow } =
    useFetchHypothesisTrajectories(
      areas,
      study?.id,
      TRAJECTORY_TYPE.THERMAL_CAPACITY,
      defaultAreas,
      isStudyGenerated,
      ThermalOptions,
    );
  const { fileStatus, progress, importTrajectory } = useTrajectoryImport(study, studyState, dispatch);
  const { attachTrajectory } = useTrajectoryAttach(study, studyState, dispatch);
  const { removeRow } = useHypothesisTableRemoveRow(study, dispatch, setData, setCheckedValues);
  const { detachTrajectory } = useTrajectoryDetach(study, dispatch);

  useEffect(() => {
    const setThermalHypothesis = () => {
      areasTrajectoryOptions && setAreasOptions(areasTrajectoryOptions);
      dropDownListOptions && setCheckedValues(dropDownListOptions);
      hypothesisTrajectories && setData(hypothesisTrajectories);
      setReadOnly(readOnlyRow);
    };
    setThermalHypothesis();
  }, [areas, areasTrajectoryOptions, defaultAreas, dropDownListOptions, hypothesisTrajectories, readOnlyRow]);

  useEffect(() => {
    if (isStudyGenerated) {
      setIsStudyGenerated(true);
      const rows = generateReadOnlyIndexMap(data);
      setReadOnly(rows);
    }
  }, [isStudyGenerated]);

  const handleSelectionChange = useCallback(
    async (value: string, isChecked?: boolean) => {
      {
        const indexRow = data.findIndex((row) => row.hypothesis === value);
        if (isChecked) {
          addRow(TRAJECTORY_TYPE.THERMAL_CAPACITY, value, dispatch, setCheckedValues, setData);
        } else if (shouldOpenDeletionModal(TRAJECTORY_TYPE.THERMAL_CAPACITY, indexRow, data)) {
          setRowToDelete({ index: indexRow, value });
          setIsDeletionModalOpen(true);
        } else {
          await removeRow(TRAJECTORY_TYPE.THERMAL_CAPACITY, value, indexRow, data);
        }
      }
    },
    [data, dispatch, removeRow, setCheckedValues, setData],
  );

  return (
    <div className="flex h-fit w-full gap-6 xl:gap-7 2xl:gap-8">
      <CheckBoxListWithSearchBar
        checkedValues={checkedValues}
        options={areasOptions}
        handleSelectionChange={handleSelectionChange}
        dividerPosition={defaultAreas.length}
        disabled={isStudyGenerated}
      />
      <PegaseHypothesisTable
        id="thermal-table"
        data={data}
        getTableHeaders={getExpandableHypothesisTableHeaders}
        fileStatus={fileStatus}
        studyState={studyState?.studyStatus ?? StudyStatus.IN_PROGRESS}
        readOnly={readOnly}
        progress={progress}
        idSelected={rowIdSelected}
        type={TRAJECTORY_TYPE.THERMAL_CAPACITY}
        handleSearch={async (value: string, rowId: string) => {
          const indexArray = rowId.split('.').map(Number);
          const area =
            data[indexArray[0]]?.hypothesis === OTHER_AREAS_LABEL ? OTHER_AREAS : data[indexArray[0]]?.hypothesis;
          const technology =
            indexArray?.length > 1 ? data[indexArray[0]]?.subRows?.[indexArray[1]]?.hypothesis : undefined;
          return await handleTrajectorySearch(
            TRAJECTORY_TYPE.THERMAL_CAPACITY,
            value,
            area,
            setDbTrajectories,
            study,
            technology,
          );
        }}
        handleImport={async (rowId: string) => {
          const indexArray = rowId.split('.').map(Number);
          await handleFetchTrajectoriesFS(
            TRAJECTORY_TYPE.THERMAL_CAPACITY,
            rowId,
            setOptionsFS,
            setRowIdSelected,
            toggleModal,
            data[indexArray[0]]?.hypothesis,
          );
        }}
        isReadOnlyEnable={true}
        updateData={(rowId: string, value: unknown, status: RowStatus) => {
          const indexArray = rowId.split('.').map(Number);
          if (status === 'empty' || status === 'emptyError') {
            const trajectorySelected: DbTrajectory | null = getRowDataSelected(data, indexArray)?.trajectory ?? null;
            if (trajectorySelected) {
              void detachTrajectory(TRAJECTORY_TYPE.THERMAL_CAPACITY, indexArray, status, trajectorySelected, setData);
            }
          } else if (status === 'success') {
            const dbTrajectory =
              dbTrajectories.length > 0
                ? dbTrajectories.find((item) => item.id === value)
                : getRowDataSelected(data, indexArray)?.trajectory;
            if (dbTrajectory) {
              void attachTrajectory(TRAJECTORY_TYPE.THERMAL_CAPACITY, indexArray, status, dbTrajectory, setData);
            }
          }
        }}
        removeRow={(value: string, rowId?: string) => {
          if (shouldOpenDeletionModal(TRAJECTORY_TYPE.THERMAL_CAPACITY, Number(rowId), data)) {
            setRowToDelete({ index: Number(rowId), value });
            setIsDeletionModalOpen(true);
          } else {
            void removeRow(TRAJECTORY_TYPE.THERMAL_CAPACITY, value, Number(rowId), data);
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
              await importTrajectory(TRAJECTORY_TYPE.THERMAL_CAPACITY, value, indexArray, data, setData);
            }
          }}
          trajectoryType={TRAJECTORY_TYPE.THERMAL_CAPACITY}
          area={getAreaTrajectoryName(rowIdSelected, data)}
        />
      )}
      {isDeletionModalOpen && (
        <AreaDeletionConfirmationModal
          isOpen={isDeletionModalOpen}
          onClose={() => setIsDeletionModalOpen(false)}
          onConfirm={async () => {
            if (rowToDelete?.value) {
              await removeRow(TRAJECTORY_TYPE.THERMAL_CAPACITY, rowToDelete?.value, rowToDelete.index, data);
              setIsDeletionModalOpen(false);
            }
          }}
        />
      )}
    </div>
  );
};

export default ThermalCapacityTab;
