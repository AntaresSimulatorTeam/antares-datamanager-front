import {
  CheckBoxData,
  DbTrajectory,
  HypothesisRowData,
  RowStatus,
  SelectOption,
  TableOperationRow,
  TabProps,
} from '@/shared/types';
import { useCallback, useEffect, useState } from 'react';
import { CheckBoxListWithSearchBar } from '@/components/list/CheckBoxListWithSearchBar.tsx';
import getExpandableHypothesisTableHeaders from '@/components/header/ExpandableHypothesisTableHeaders.tsx';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { getAreaTrajectoryName, shouldDeleteCapacityModulation } from '@/shared/utils/trajectoryUtils.ts';
import { shouldOpenDeletionModal } from '@/shared/helpers/hypothesisTableHelper.ts';
import { PegaseHypothesisTable } from '@common/layout/PegaseHypothesisTable/PegaseHypothesisTable.tsx';
import { StudyStatus } from '@/shared/types/common/StudyStatus.type.ts';
import { ReadOnlyObject } from '@common/data/stdTable/types/readOnly.type';
import { useFetchHypothesisTrajectories } from '@/hooks/useFetchHypothesisTrajectories.ts';
import { useStudy, useStudyDispatch } from '@/store/contexts/StudyContext.tsx';
import { addRow, handleFetchTrajectoriesFS, handleTrajectorySearch } from '@/shared/services/hypothesisTableService.ts';
import { useHypothesisTableRemoveRow } from '@/hooks/useHypothesisTableRemoveRow.ts';
import { useNewStudyModal } from '@/hooks/useNewStudyModal.ts';
import { useTrajectoryAttach } from '@/hooks/useTrajectoryAttach.ts';
import { ImportTrajectoryModal } from '@common/modal/ImportTrajectoryModal.tsx';
import { useTrajectoryImport } from '@/hooks/useTrajectoryImport.ts';
import { useTrajectoryDetach } from '@/hooks/useTrajectoryDetach.ts';
import { AreaDeletionConfirmationModal } from '@common/modal/AreaDeletionConfirmationModal.tsx';
import { useTranslation } from 'react-i18next';

const DSRTab = ({ defaultAreas, areas, studyData }: TabProps) => {
  const studyState = useStudy();
  const dispatch = useStudyDispatch();
  const { isModalOpen, toggleModal } = useNewStudyModal();
  const { t } = useTranslation();
  const [rowIdSelected, setRowIdSelected] = useState<string>('0');
  const [rowToDelete, setRowToDelete] = useState<{
    index: number;
    value?: string;
    operation: TableOperationRow;
  } | null>(null);
  const [readOnly, setReadOnly] = useState<ReadOnlyObject>({});
  const [areasOptions, setAreasOptions] = useState<CheckBoxData[]>([]);
  const [data, setData] = useState<HypothesisRowData[]>([]);
  const [checkedValues, setCheckedValues] = useState<string[]>([]);
  const [dbTrajectories, setDbTrajectories] = useState<DbTrajectory[]>([]);
  const [optionsFS, setOptionsFS] = useState<SelectOption[]>();
  const [isDeletionModalOpen, setIsDeletionModalOpen] = useState(false);
  const { hypothesisTrajectories, areasTrajectoryOptions, dropDownListOptions, readOnlyRow } =
    useFetchHypothesisTrajectories(
      areas,
      [TRAJECTORY_TYPE.DSR],
      defaultAreas,
      studyData?.id,
      studyData?.status,
      studyState.studyStatus,
    );
  const { fileStatus, progress, importTrajectory } = useTrajectoryImport(studyData, studyState, dispatch, setReadOnly);
  const { removeRow } = useHypothesisTableRemoveRow(studyData, dispatch, setData, setCheckedValues, setReadOnly);
  const { attachTrajectory } = useTrajectoryAttach(studyData, studyState, dispatch, setReadOnly);
  const { detachTrajectory } = useTrajectoryDetach(studyData, dispatch, setReadOnly);

  useEffect(() => {
    const mapping = [
      [areasTrajectoryOptions, setAreasOptions],
      [dropDownListOptions, setCheckedValues],
      [hypothesisTrajectories, setData],
      [readOnlyRow, setReadOnly],
    ] as const;

    mapping.forEach(([record, setter]) => {
      const value = record?.[TRAJECTORY_TYPE.DSR];
      if (value !== undefined) {
        // @ts-ignore
        setter(value);
      }
    });
  }, [hypothesisTrajectories, areasTrajectoryOptions, dropDownListOptions, readOnlyRow, studyState.studyStatus]);

  const handleSelectionChange = useCallback(
    async (value: string, isChecked?: boolean): Promise<void> => {
      const indexRow = data.findIndex((row) => row.hypothesis === value);
      if (isChecked) {
        addRow(TRAJECTORY_TYPE.DSR, value, dispatch, setCheckedValues, setData, [], [], setReadOnly);
      } else if (shouldOpenDeletionModal(TRAJECTORY_TYPE.DSR, indexRow, data)) {
        setRowToDelete({ index: indexRow, value, operation: 'remove' });
        setIsDeletionModalOpen(true);
      } else {
        try {
          await removeRow(TRAJECTORY_TYPE.DSR, indexRow, data, value);
        } catch {
          // silent handler
        }
      }
    },
    [data, dispatch, removeRow, setCheckedValues],
  );

  return (
    <div className="flex min-h-0 w-full gap-6">
      <CheckBoxListWithSearchBar
        checkedValues={checkedValues}
        options={areasOptions}
        handleSelectionChange={handleSelectionChange}
        dividerPosition={defaultAreas.length}
        disabled={studyState.studyStatus === StudyStatus.GENERATED || studyData.status === StudyStatus.GENERATED}
      />
      <PegaseHypothesisTable
        id="sts-table"
        data={data}
        getTableHeaders={getExpandableHypothesisTableHeaders}
        fileStatus={fileStatus}
        isStudyGenerated={
          studyState.studyStatus === StudyStatus.GENERATED || studyData.status === StudyStatus.GENERATED
        }
        readOnly={readOnly}
        progress={progress}
        idSelected={String(rowIdSelected)}
        isReadOnlyEnable={true}
        handleSearch={async (fileNameContains: string, rowId: string) => {
          const isLastIndex = Number(rowId) === Math.max(data.length - 1, 0);
          const type = isLastIndex ? TRAJECTORY_TYPE.DSR_CAPACITY_MODULATION : TRAJECTORY_TYPE.DSR;
          const area = !isLastIndex ? data[Number(rowId)]?.hypothesis : '';
          return await handleTrajectorySearch(type, setDbTrajectories, studyData?.horizon, {
            area,
            fileNameContains,
          });
        }}
        handleImport={async (rowId: string) => {
          const isLastIndex = Number(rowId) === Math.max(data.length - 1, 0);
          await handleFetchTrajectoriesFS(
            isLastIndex ? TRAJECTORY_TYPE.DSR_CAPACITY_MODULATION : TRAJECTORY_TYPE.DSR,
            rowId,
            setOptionsFS,
            setRowIdSelected,
            toggleModal,
          );
        }}
        updateData={async (rowId: string, value: unknown, status: RowStatus) => {
          const index = Number(rowId);
          const row = data[index];
          const trajectory = row?.trajectory;
          const isLastIndex = index === Math.max(data.length - 1, 0);
          const type = isLastIndex ? TRAJECTORY_TYPE.DSR_CAPACITY_MODULATION : TRAJECTORY_TYPE.DSR;
          if (status === 'empty' || status === 'emptyError') {
            if (trajectory) {
              const hypothesis = row?.hypothesis ?? '';
              if (type === TRAJECTORY_TYPE.DSR && shouldDeleteCapacityModulation(data, index)) {
                setRowToDelete({ index, value: hypothesis, operation: 'empty' });
                setIsDeletionModalOpen(true);
              } else {
                await detachTrajectory(type, [index], setData, data, status, hypothesis);
              }
            }
          } else if (status === 'success') {
            const dbTrajectory = dbTrajectories.find((item) => item.id === value) ?? trajectory;
            if (dbTrajectory) {
              void attachTrajectory(type, [index], status, dbTrajectory, setData);
            }
          }
        }}
        removeRow={(value: string, rowId?: string) => {
          const index = Number(rowId ?? '0');
          const isLastIndex = index === Math.max(data.length - 1, 0);
          const type = isLastIndex ? TRAJECTORY_TYPE.DSR_CAPACITY_MODULATION : TRAJECTORY_TYPE.DSR;
          if (type === TRAJECTORY_TYPE.DSR && shouldOpenDeletionModal(TRAJECTORY_TYPE.DSR, index, data)) {
            setRowToDelete({ index, value, operation: 'remove' });
            setIsDeletionModalOpen(true);
          } else {
            void removeRow(TRAJECTORY_TYPE.DSR, index, data, value);
          }
        }}
        type={TRAJECTORY_TYPE.DSR}
      />
      {isModalOpen && (
        <ImportTrajectoryModal
          options={optionsFS}
          onClose={async (value?: SelectOption) => {
            toggleModal();
            if (value != null) {
              const isLastIndex = Number(rowIdSelected) === Math.max(data.length - 1, 0);
              const type = isLastIndex ? TRAJECTORY_TYPE.DSR_CAPACITY_MODULATION : TRAJECTORY_TYPE.DSR;
              await importTrajectory(type, value, [Number(rowIdSelected)], data, setData);
            }
          }}
          trajectoryType={
            Number(rowIdSelected) === Math.max(data.length - 1, 0)
              ? TRAJECTORY_TYPE.DSR_CAPACITY_MODULATION
              : TRAJECTORY_TYPE.DSR
          }
          hypothesis={getAreaTrajectoryName(rowIdSelected, data)}
        />
      )}
      {isDeletionModalOpen && (
        <AreaDeletionConfirmationModal
          isOpen={isDeletionModalOpen}
          onClose={() => setIsDeletionModalOpen(false)}
          onConfirm={async () => {
            if (rowToDelete?.value) {
              const { value, index, operation } = rowToDelete;
              if (operation === 'remove') {
                await removeRow(TRAJECTORY_TYPE.DSR, index, data, value);
              } else if (data?.[index]?.trajectory) {
                await detachTrajectory(TRAJECTORY_TYPE.DSR, [index], setData, data, 'empty', data?.[index]?.hypothesis);
              }
              setIsDeletionModalOpen(false);
            }
          }}
          message={
            rowToDelete?.index != null && shouldDeleteCapacityModulation(data, rowToDelete.index)
              ? t('trajectoryDeletionModal.@confirmDeletionCapacityMessage')
              : t('trajectoryDeletionModal.@confirmDeletionMessage')
          }
        />
      )}
    </div>
  );
};

export default DSRTab;
