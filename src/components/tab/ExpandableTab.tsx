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
  TabProps,
  TechnologyType,
  TrajectoryViewData,
} from '@/shared/types';
import { useCallback, useEffect, useState } from 'react';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { useStudy, useStudyDispatch } from '@/store/contexts/StudyContext.tsx';
import { ReadOnlyObject } from '@common/data/stdTable/types/readOnly.type';
import { getAreaTrajectoryName, getDeletionModalMessage } from '@/shared/utils/trajectoryUtils.ts';
import { StudyStatus } from '@/shared/types/common/StudyStatus.type.ts';
import { PegaseHypothesisTable } from '@common/layout/PegaseHypothesisTable/PegaseHypothesisTable.tsx';
import getExpandableHypothesisTableHeaders from '@/components/header/ExpandableHypothesisTableHeaders.tsx';
import { ImportTrajectoryModal } from '@common/modal/ImportTrajectoryModal.tsx';
import { useNewStudyModal } from '@/hooks/useNewStudyModal.ts';
import { useFetchHypothesisTrajectories } from '@/hooks/useFetchHypothesisTrajectories.ts';
import { addRow, handleViewTrajectory } from '@/shared/services/hypothesisTableService.ts';
import { useTrajectoryImport } from '@/hooks/useTrajectoryImport.ts';
import { useHypothesisTableRemoveRow } from '@/hooks/useHypothesisTableRemoveRow.ts';
import { useTrajectorySearchHandler } from '@/hooks/useTrajectorySearchHandler.ts';
import { getParamForFetchFSTrajectory, shouldOpenDeletionModal } from '@/shared/helpers/hypothesisTableHelper.ts';
import { AreaDeletionConfirmationModal } from '@common/modal/AreaDeletionConfirmationModal.tsx';
import { CheckBoxList } from '@/components/list/CheckBoxList.tsx';
import { useTranslation } from 'react-i18next';
import { TrajectoryDataVisualisation } from '@common/modal/TrajectoryDataVisualisation.tsx';
import { useTrajectoryFetchFromFSHandler } from '@/hooks/useTrajectoryFetchFromFSHandler.ts';
import { HypothesisType, RowToDeleteProps } from '@/shared/types/HypothesisTable.ts';
import { useHypothesisTableUpdateHandler } from '@/hooks/useHypothesisTableUpdateHandler.ts';
import { useTrajectoryDetach } from '@/hooks/useTrajectoryDetach.ts';

const ExpandableTab = ({
  defaultAreas,
  areas,
  studyData,
  tabType,
  types,
}: TabProps & { tabType: TRAJECTORY_TYPE; types: TRAJECTORY_TYPE[] }) => {
  const studyState = useStudy();
  const dispatch = useStudyDispatch();
  const { t } = useTranslation();
  const [checkedValues, setCheckedValues] = useState<string[]>([]);
  const [areasOptions, setAreasOptions] = useState<CheckBoxData[]>([]);
  const [data, setData] = useState<HypothesisRowData[]>([]);
  const [rowIdSelected, setRowIdSelected] = useState<string>('0');
  const [readOnly, setReadOnly] = useState<ReadOnlyObject>({});
  const [technologies, setTechnologies] = useState<TechnologyType[]>([]);
  const [technologiesLabel, setTechnologiesLabel] = useState<string[]>([]);
  const { isModalOpen, toggleModal } = useNewStudyModal();
  const [optionsFS, setOptionsFS] = useState<SelectOption[]>();
  const [trajectoryData, setTrajectoryData] = useState<TrajectoryViewData | undefined>();
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [dbTrajectories, setDbTrajectories] = useState<DbTrajectory[]>([]);
  const [rowToDelete, setRowToDelete] = useState<RowToDeleteProps | null>(null);
  const [isDeletionModalOpen, setIsDeletionModalOpen] = useState(false);
  const { hypothesisTrajectories, areasTrajectoryOptions, dropDownListOptions, readOnlyRow, technologyList } =
    useFetchHypothesisTrajectories(
      areas,
      types,
      defaultAreas,
      studyData?.id,
      studyData?.status,
      studyState.studyStatus,
    );
  const { fileStatus, progress, importTrajectory } = useTrajectoryImport(studyData, studyState, dispatch, setReadOnly);
  const { removeRow } = useHypothesisTableRemoveRow(studyData, dispatch, setData, setCheckedValues, setReadOnly);
  const { handleSearch } = useTrajectorySearchHandler({
    studyHorizon: studyData.horizon,
    setDbTrajectories,
  });
  const { handleFetchFromFS } = useTrajectoryFetchFromFSHandler();

  const { handleHypothesisTableUpdate } = useHypothesisTableUpdateHandler({
    studyData,
    setRowIdSelected,
    setIsDeletionModalOpen,
    dbTrajectories,
    setReadOnly,
    setRowToDelete,
  });

  const { detachTrajectory } = useTrajectoryDetach(
    studyData,
    dispatch,
    setReadOnly,
    setIsDeletionModalOpen,
    setRowIdSelected,
  );

  useEffect(() => {
    const mapping = [
      [areasTrajectoryOptions, setAreasOptions],
      [dropDownListOptions, setCheckedValues],
      [technologyList, setTechnologies],
      [hypothesisTrajectories, setData],
      [readOnlyRow, setReadOnly],
    ] as const;

    mapping.forEach(([record, setter]) => {
      const value = record?.[tabType];
      if (value !== undefined) {
        // @ts-ignore
        setter(value);
      }
    });

    if (tabType && technologyList?.[tabType]) {
      const labels = technologyList[tabType].map((technology) => technology.label);
      setTechnologiesLabel(labels);
    }
  }, [
    areasTrajectoryOptions,
    dropDownListOptions,
    hypothesisTrajectories,
    technologyList,
    readOnlyRow,
    studyState.studyStatus,
    tabType,
  ]);

  const handleSelectionChange = useCallback(
    async (value: string, isChecked?: boolean) => {
      const indexRow = data.findIndex((row) => row.hypothesis === value);
      if (isChecked) {
        addRow(tabType, value, dispatch, setCheckedValues, setData, technologiesLabel, [], setReadOnly);
      } else if (shouldOpenDeletionModal(tabType, indexRow, data)) {
        setRowToDelete({ index: indexRow, value });
        setIsDeletionModalOpen(true);
      } else {
        await removeRow(tabType, indexRow, data, value);
      }
    },
    [data, tabType, dispatch, technologiesLabel, removeRow],
  );

  const removeTableRow = useCallback(
    (value: string, rowId?: string) => {
      if (shouldOpenDeletionModal(tabType, Number(rowId), data)) {
        setRowToDelete({ index: Number(rowId), value, operation: 'remove' });
        setIsDeletionModalOpen(true);
      } else {
        void removeRow(tabType, Number(rowId), data, value);
      }
    },
    [data, removeRow, tabType],
  );

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

  const handleTrajectorySearch = useCallback(async (fileNameContains: string, rowId: string) => {
    const indexArray = rowId.split('.').map(Number);
    const rowIndex = indexArray?.[0];
    const subIndex = indexArray?.[1];
    return await handleSearch(tabType, indexArray, {
      area: data[rowIndex]?.hypothesis,
      technology: data[rowIndex]?.subRows?.[subIndex]?.hypothesis,
      isLastIndex: rowIndex === Math.max(data.length - 1, 0),
      technologies,
      fileNameContains,
    });
  }, [data, handleSearch, tabType, technologies]);

  const handleTrajectoryFetchFromFS = useCallback(async (rowId: string) => {
    const hypothesis = getAreaTrajectoryName(rowId, data, technologies);
    const { typeToUse, areaToUse, isDefaultArea } = getParamForFetchFSTrajectory(
      tabType,
      rowId.split('.').map(Number),
      data.length,
      hypothesis,
    );
    const results = await handleFetchFromFS({ typeToUse, areaToUse, isDefaultArea });
    setOptionsFS(results);
    setRowIdSelected(rowId);
    toggleModal();
  }, [data, handleFetchFromFS, tabType, technologies, toggleModal]);

  return (
    <div className="flex h-fit w-full gap-6 pb-4 xl:gap-7 2xl:gap-8">
      {!!areasOptions?.length && (
        <CheckBoxList
          checkedValues={checkedValues}
          options={areasOptions}
          handleSelectionChange={handleSelectionChange}
          disabled={studyState.studyStatus === StudyStatus.GENERATED || studyData.status === StudyStatus.GENERATED}
        />
      )}

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
        type={tabType}
        list={technologiesLabel}
        handleSearch={handleTrajectorySearch}
        handleImport={handleTrajectoryFetchFromFS}
        isReadOnlyEnable={true}
        updateData={(rowId: string, value: unknown, status: RowStatus) => {
          void handleHypothesisTableUpdate(rowId, value, status, tabType, data, setData);
        }}
        removeRow={removeTableRow}
        handleViewData={tabType === TRAJECTORY_TYPE.STS ? handleViewData : undefined}
      />
      {isModalOpen && (
        <ImportTrajectoryModal
          options={optionsFS}
          onClose={async (
            typeToUse?: TRAJECTORY_TYPE,
            value?: SelectOption,
            hypothesis?: HypothesisType,
            indexArray?: number[],
          ) => {
            toggleModal();
            if (value) {
              await importTrajectory(setData, value, typeToUse, indexArray, hypothesis);
            }
          }}
          tabType={tabType}
          hypothesis={getAreaTrajectoryName(rowIdSelected, data, technologies)}
          indexArray={rowIdSelected?.split('.').map(Number)}
          rowsNb={data.length}
        />
      )}
      {isViewModalOpen && trajectoryData && (
        <TrajectoryDataVisualisation trajectoryData={trajectoryData} onClose={() => setIsViewModalOpen(false)} />
      )}
        <AreaDeletionConfirmationModal
          isOpen={isDeletionModalOpen}
          onClose={() => setIsDeletionModalOpen(false)}
          onConfirm={async () => {
            if (!rowToDelete?.value) return;
            const { value, index, operation } = rowToDelete;
            if (operation === 'empty') {
              await detachTrajectory(tabType, [index], setData, data, 'empty', value);
            } else {
              await removeRow(tabType, index, data, value);
            }
            setIsDeletionModalOpen(false);
          }}
          message={
            rowToDelete?.index == null
              ? t('trajectoryDeletionModal.@confirmDeletionMessage')
              : t(`${getDeletionModalMessage(tabType, rowToDelete.index, data)}`)
          }
        />
    </div>
  );
};

export default ExpandableTab;
