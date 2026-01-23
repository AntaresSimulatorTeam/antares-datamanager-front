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
import {
  filterRow,
  generateReadOnlyIndexMap,
  getAreaTrajectoryName,
  getRowDataSelected,
} from '@/shared/utils/trajectoryUtils.ts';
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
import { getCheckedValues, shouldOpenDeletionModal } from '@/shared/helpers/hypothesisTableHelper.ts';
import { OTHER_AREAS_LABEL } from '@/shared/const/studyConfig';
import { OTHER_AREAS } from '@/shared/const/studyConfig.ts';
import { AreaDeletionConfirmationModal } from '@common/modal/AreaDeletionConfirmationModal.tsx';
import { CheckBoxListWithSearchBar } from '@/components/list/CheckBoxListWithSearchBar.tsx';

const ThermalCapacityTab = ({ defaultAreas, areas, studyData }: TabProps) => {
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
  const [isStudyGenerated, setIsStudyGenerated] = useState(
    studyState.studyStatus === StudyStatus.GENERATED || studyData.status === StudyStatus.GENERATED,
  );
  const { hypothesisTrajectories, areasTrajectoryOptions, dropDownListOptions, readOnlyRow, technologyList } =
    useFetchHypothesisTrajectories(
      areas,
      studyData?.id,
      TRAJECTORY_TYPE.THERMAL_CAPACITY,
      defaultAreas,
      isStudyGenerated,
    );
  const { fileStatus, progress, importTrajectory } = useTrajectoryImport(studyData, studyState, dispatch);
  const { attachTrajectory } = useTrajectoryAttach(studyData, studyState, dispatch);
  const { removeRow } = useHypothesisTableRemoveRow(studyData, dispatch, setData, setCheckedValues);
  const { detachTrajectory } = useTrajectoryDetach(studyData, dispatch);

  useEffect(() => {
    const setThermalHypothesis = () => {
      areasTrajectoryOptions && setAreasOptions(areasTrajectoryOptions);
      dropDownListOptions && setCheckedValues(dropDownListOptions);
      hypothesisTrajectories && setData(hypothesisTrajectories);
      technologyList && setInstalledPowerTechnologies(technologyList);
      setReadOnly(readOnlyRow);
    };
    setThermalHypothesis();
  }, [areasTrajectoryOptions, dropDownListOptions, hypothesisTrajectories, technologyList, readOnlyRow]);

  useEffect(() => {
    if (studyState.studyStatus === StudyStatus.GENERATED) {
      setIsStudyGenerated(true);
      const newData = filterRow(data);
      setData(newData);
      const newCheckedValues = getCheckedValues(newData, areas, defaultAreas);
      setCheckedValues(newCheckedValues);
      const rows = generateReadOnlyIndexMap(data);
      setReadOnly(rows);
    }
  }, [studyState.studyStatus]);

  const handleSelectionChange = useCallback(
    async (value: string, isChecked?: boolean) => {
      const indexRow = data.findIndex((row) => row.hypothesis === value);
      if (isChecked) {
        addRow(
          TRAJECTORY_TYPE.THERMAL_CAPACITY,
          value,
          dispatch,
          setCheckedValues,
          setData,
          installedPowerTechnologies,
        );
      } else if (shouldOpenDeletionModal(TRAJECTORY_TYPE.THERMAL_CAPACITY, indexRow, data)) {
        setRowToDelete({ index: indexRow, value });
        setIsDeletionModalOpen(true);
      } else {
        await removeRow(TRAJECTORY_TYPE.THERMAL_CAPACITY, value, indexRow, data);
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
        isStudyGenerated={isStudyGenerated}
        readOnly={readOnly}
        progress={progress}
        idSelected={rowIdSelected}
        type={TRAJECTORY_TYPE.THERMAL_CAPACITY}
        list={installedPowerTechnologies}
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
            studyData,
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
          hypothesis={getAreaTrajectoryName(rowIdSelected, data)}
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
