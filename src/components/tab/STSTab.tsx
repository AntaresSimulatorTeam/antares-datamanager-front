/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { StudyStatus } from '@/shared/types/common/StudyStatus.type.ts';
import { PegaseHypothesisTable } from '@common/layout/PegaseHypothesisTable/PegaseHypothesisTable.tsx';
import { useFetchHypothesisTrajectories } from '@/hooks/useFetchHypothesisTrajectories.ts';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import {
  CheckBoxData,
  DbTrajectory,
  HypothesisRowData,
  RowStatus,
  SelectOption,
  TabProps,
  TrajectoryViewData,
} from '@/shared/types';
import { useCallback, useEffect, useState } from 'react';
import { ReadOnlyObject } from '@common/data/stdTable/types/readOnly.type';
import { useStudy, useStudyDispatch } from '@/store/contexts/StudyContext.tsx';
import { CheckBoxListWithSearchBar } from '@/components/list/CheckBoxListWithSearchBar.tsx';
import getExpandableHypothesisTableHeaders from '@/components/header/ExpandableHypothesisTableHeaders.tsx';
import {
  addRow,
  handleFetchTrajectoriesFS,
  handleTrajectorySearch,
  handleViewTrajectory,
} from '@/shared/services/hypothesisTableService.ts';
import { useHypothesisTableRemoveRow } from '@/hooks/useHypothesisTableRemoveRow.ts';
import {
  filterRow,
  generateReadOnlyIndexMap,
  getAreaTrajectoryName,
  getRowDataSelected,
} from '@/shared/utils/trajectoryUtils.ts';
import { getCheckedValues, shouldOpenDeletionModal } from '@/shared/helpers/hypothesisTableHelper.ts';
import { ImportTrajectoryModal } from '@common/modal/ImportTrajectoryModal.tsx';
import { useNewStudyModal } from '@/hooks/useNewStudyModal.ts';
import { useTrajectoryImport } from '@/hooks/useTrajectoryImport.ts';
import { useTrajectoryDetach } from '@/hooks/useTrajectoryDetach.ts';
import { AreaDeletionConfirmationModal } from '@common/modal/AreaDeletionConfirmationModal.tsx';
import { useTrajectoryAttach } from '@/hooks/useTrajectoryAttach.ts';
import { TrajectoryDataVisualisation } from '@common/modal/TrajectoryDataVisualisation.tsx';
import { useTranslation } from 'react-i18next';

export const STSTab = ({ defaultAreas, areas, studyData }: TabProps) => {
  const studyState = useStudy();
  const dispatch = useStudyDispatch();
  const { t } = useTranslation();
  const [readOnly, setReadOnly] = useState<ReadOnlyObject>({});
  const [optionsFS, setOptionsFS] = useState<SelectOption[]>();
  const [rowIdSelected, setRowIdSelected] = useState<string>('0.0');
  const { isModalOpen, toggleModal } = useNewStudyModal();
  const [data, setData] = useState<HypothesisRowData[]>([]);
  const [areasOptions, setAreasOptions] = useState<CheckBoxData[]>([]);
  const [checkedValues, setCheckedValues] = useState<string[]>([]);
  const [stsTechnologies, setStsTechnologies] = useState<string[]>([]);
  const [isDeletionModalOpen, setIsDeletionModalOpen] = useState(false);
  const [trajectoryData, setTrajectoryData] = useState<TrajectoryViewData | undefined>();
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState<{ index: number; value?: string } | null>(null);
  const [dbTrajectories, setDbTrajectories] = useState<DbTrajectory[]>([]);
  const [isStudyGenerated, setIsStudyGenerated] = useState(
    studyState.studyStatus === StudyStatus.GENERATED || studyData.status === StudyStatus.GENERATED,
  );
  const { hypothesisTrajectories, areasTrajectoryOptions, dropDownListOptions, readOnlyRow, technologyList } =
    useFetchHypothesisTrajectories(areas, studyData?.id, TRAJECTORY_TYPE.STS, defaultAreas, isStudyGenerated);
  const { removeRow } = useHypothesisTableRemoveRow(studyData, dispatch, setData, setCheckedValues);
  const { fileStatus, progress, importTrajectory } = useTrajectoryImport(studyData, studyState, dispatch);
  const { detachTrajectory } = useTrajectoryDetach(studyData, dispatch);
  const { attachTrajectory } = useTrajectoryAttach(studyData, studyState, dispatch);

  useEffect(() => {
    const setHypothesis = () => {
      areasTrajectoryOptions && setAreasOptions(areasTrajectoryOptions);
      dropDownListOptions && setCheckedValues(dropDownListOptions);
      hypothesisTrajectories && setData(hypothesisTrajectories);
      technologyList && setStsTechnologies(technologyList);
      setReadOnly(readOnlyRow);
    };
    setHypothesis();
  }, [hypothesisTrajectories, areasTrajectoryOptions, dropDownListOptions, readOnlyRow, technologyList]);

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
    async (value: string, isChecked: boolean) => {
      const indexRow = data.findIndex((row) => row.hypothesis === value);
      if (isChecked) {
        addRow(TRAJECTORY_TYPE.STS, value, dispatch, setCheckedValues, setData, stsTechnologies);
      } else if (shouldOpenDeletionModal(TRAJECTORY_TYPE.STS, indexRow, data)) {
        setRowToDelete({ index: indexRow, value });
        setIsDeletionModalOpen(true);
      } else if (indexRow >= 0) {
        await removeRow(TRAJECTORY_TYPE.STS, value, indexRow, data);
      }
    },
    [data, dispatch, removeRow, stsTechnologies],
  );

  return (
    <div className="flex min-h-0 w-full gap-6">
      <CheckBoxListWithSearchBar
        checkedValues={checkedValues}
        options={areasOptions}
        handleSelectionChange={handleSelectionChange}
        dividerPosition={defaultAreas.length}
        disabled={isStudyGenerated}
      />
      <PegaseHypothesisTable
        id="sts-table"
        data={data}
        getTableHeaders={getExpandableHypothesisTableHeaders}
        fileStatus={fileStatus}
        isStudyGenerated={isStudyGenerated}
        readOnly={readOnly}
        progress={progress}
        idSelected={String(rowIdSelected)}
        isReadOnlyEnable={true}
        handleSearch={async (fileNameContains: string, rowId: string) => {
          const indexArray = rowId.split('.').map(Number);
          const technology = data[indexArray[0]].subRows?.[indexArray[1]].hypothesis;
          return await handleTrajectorySearch(TRAJECTORY_TYPE.STS, setDbTrajectories, studyData?.horizon, {
            area: data[indexArray[0]]?.hypothesis,
            technology,
            fileNameContains,
          });
        }}
        handleImport={async (rowId: string) => {
          const indexArray = rowId.split('.').map(Number);
          const technology = data[indexArray[0]]?.subRows?.[indexArray[1]]?.hypothesis;
          await handleFetchTrajectoriesFS(
            TRAJECTORY_TYPE.STS,
            rowId,
            setOptionsFS,
            setRowIdSelected,
            toggleModal,
            technology,
          );
        }}
        updateData={async (rowId: string, value: unknown, status: RowStatus) => {
          const indexArray = rowId.split('.').map(Number);
          if (status === 'empty' || status === 'emptyError') {
            const current = data[indexArray[0]]?.subRows?.[indexArray[1]]?.trajectory ?? null;
            if (current) {
              await detachTrajectory(TRAJECTORY_TYPE.STS, indexArray, status, current, setData);
            }
          } else if (status === 'success') {
            const dbTrajectory =
              dbTrajectories.length > 0
                ? dbTrajectories.find((item) => item.id === value)
                : getRowDataSelected(data, indexArray)?.trajectory;
            if (dbTrajectory) {
              void attachTrajectory(TRAJECTORY_TYPE.STS, indexArray, status, dbTrajectory, setData);
            }
          }
        }}
        removeRow={(value: string, rowId?: string) => {
          if (shouldOpenDeletionModal(TRAJECTORY_TYPE.STS, Number(rowId), data)) {
            setRowToDelete({ index: Number(rowId), value });
            setIsDeletionModalOpen(true);
          } else {
            void removeRow(TRAJECTORY_TYPE.STS, value, Number(rowId), data);
          }
        }}
        type={TRAJECTORY_TYPE.STS}
        list={technologyList}
        handleViewData={(rowId: string) => {
          const indexArray = rowId.split('.').map(Number);
          const trajectory = data[indexArray[0]]?.subRows?.[indexArray[1]]?.trajectory;
          if (trajectory) {
            void handleViewTrajectory(trajectory, setTrajectoryData, setIsViewModalOpen, t);
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
              await importTrajectory(TRAJECTORY_TYPE.STS, value, indexArray, data, setData);
            }
          }}
          trajectoryType={TRAJECTORY_TYPE.STS}
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
              await removeRow(TRAJECTORY_TYPE.STS, rowToDelete?.value, rowToDelete.index, data);
              setIsDeletionModalOpen(false);
            }
          }}
        />
      )}
    </div>
  );
};
