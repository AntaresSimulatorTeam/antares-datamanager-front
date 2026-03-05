import { CheckBoxData, DbTrajectory, HypothesisRowData, RowStatus, SelectOption, TabProps } from '@/shared/types';
import { CheckBoxListWithSearchBar } from '@/components/list/CheckBoxListWithSearchBar.tsx';
import getEditableHypothesisTableHeaders from '@/components/header/EditableHypothesisTableHeaders.tsx';
import { PegaseHypothesisTable } from '@common/layout/PegaseHypothesisTable/PegaseHypothesisTable.tsx';
import { useFetchHypothesisTrajectories } from '@/hooks/useFetchHypothesisTrajectories.ts';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { useCallback, useEffect, useState } from 'react';
import { ReadOnlyObject } from '@common/data/stdTable/types/readOnly.type';
import { useStudy, useStudyDispatch } from '@/store/contexts/StudyContext.tsx';
import { addRow, handleFetchTrajectoriesFS, handleTrajectorySearch } from '@/shared/services/hypothesisTableService.ts';
import { shouldOpenDeletionModal } from '@/shared/helpers/hypothesisTableHelper.ts';
import { useHypothesisTableRemoveRow } from '@/hooks/useHypothesisTableRemoveRow.ts';
import { ImportTrajectoryModal } from '@common/modal/ImportTrajectoryModal.tsx';
import { getAreaTrajectoryName } from '@/shared/utils/trajectoryUtils.ts';
import { useTrajectoryImport } from '@/hooks/useTrajectoryImport.ts';
import { useNewStudyModal } from '@/hooks/useNewStudyModal.ts';
import { useTrajectoryDetach } from '@/hooks/useTrajectoryDetach.ts';
import { useTrajectoryAttach } from '@/hooks/useTrajectoryAttach.ts';
import { DeletionModal } from '@common/modal/DeletionModal.tsx';

const MiscInstalledPowerTab = ({ defaultAreas, areas, studyData }: TabProps) => {
  const studyState = useStudy();
  const dispatch = useStudyDispatch();
  const { isModalOpen, toggleModal } = useNewStudyModal();
  const [readOnly, setReadOnly] = useState<ReadOnlyObject>({});
  const [data, setData] = useState<HypothesisRowData[]>([]);
  const [areasOptions, setAreasOptions] = useState<CheckBoxData[]>([]);
  const [checkedValues, setCheckedValues] = useState<string[]>([]);
  const [rowToDelete, setRowToDelete] = useState<{ index: number; value?: string } | null>(null);
  const [isDeletionModalOpen, setIsDeletionModalOpen] = useState(false);
  const [optionsFS, setOptionsFS] = useState<SelectOption[]>();
  const [dbTrajectories, setDbTrajectories] = useState<DbTrajectory[]>([]);
  const [rowIdSelected, setRowIdSelected] = useState<string>('0');
  const { hypothesisTrajectories, areasTrajectoryOptions, dropDownListOptions, readOnlyRow } =
    useFetchHypothesisTrajectories(
      areas,
      TRAJECTORY_TYPE.MISC_CAPACITY,
      defaultAreas,
      studyData?.id,
      studyData?.status,
      studyState.studyStatus,
    );
  const { removeRow } = useHypothesisTableRemoveRow(studyData, dispatch, setData, setCheckedValues, setReadOnly);
  const { detachTrajectory } = useTrajectoryDetach(studyData, dispatch, setReadOnly);
  const { attachTrajectory } = useTrajectoryAttach(studyData, studyState, dispatch, setReadOnly);
  const { fileStatus, progress, importTrajectory } = useTrajectoryImport(studyData, studyState, dispatch, setReadOnly);

  useEffect(() => {
    const setMiscInstalledPowerHypothesis = () => {
      areasTrajectoryOptions && setAreasOptions(areasTrajectoryOptions);
      dropDownListOptions && setCheckedValues(dropDownListOptions);
      hypothesisTrajectories && setData(hypothesisTrajectories);
      setReadOnly(readOnlyRow);
    };
    setMiscInstalledPowerHypothesis();
  }, [hypothesisTrajectories, areasTrajectoryOptions, dropDownListOptions, readOnlyRow, studyState.studyStatus]);

  const handleSelectionChange = useCallback(
    async (value: string, isChecked?: boolean) => {
      const indexRow = data.findIndex((row) => row.hypothesis === value);
      if (isChecked) {
        addRow(TRAJECTORY_TYPE.MISC_CAPACITY, value, dispatch, setCheckedValues, setData);
      } else if (shouldOpenDeletionModal(TRAJECTORY_TYPE.MISC_CAPACITY, indexRow, data)) {
        setRowToDelete({ index: indexRow, value });
        setIsDeletionModalOpen(true);
      } else {
        await removeRow(TRAJECTORY_TYPE.MISC_CAPACITY, indexRow, data, value);
      }
    },
    [data, dispatch, removeRow],
  );

  return (
    <div className="flex h-fit w-full gap-6 xl:gap-7 2xl:gap-8">
      <CheckBoxListWithSearchBar
        checkedValues={checkedValues}
        options={areasOptions}
        handleSelectionChange={handleSelectionChange}
        dividerPosition={defaultAreas.length}
        disabled={false}
      />
      <PegaseHypothesisTable
        id="misc-capacity-table"
        data={data}
        getTableHeaders={getEditableHypothesisTableHeaders}
        fileStatus={fileStatus}
        isStudyGenerated={false}
        readOnly={readOnly}
        progress={progress}
        idSelected={String(rowIdSelected)}
        handleSearch={async (fileNameContains: string, rowId: string) =>
          await handleTrajectorySearch(TRAJECTORY_TYPE.MISC_CAPACITY, setDbTrajectories, studyData?.horizon, {
            area: data[Number(rowId)]?.hypothesis,
            fileNameContains,
          })
        }
        handleImport={async (rowId: string) => {
          await handleFetchTrajectoriesFS(
            TRAJECTORY_TYPE.MISC_CAPACITY,
            rowId,
            setOptionsFS,
            setRowIdSelected,
            toggleModal,
            data[Number(rowId)]?.hypothesis,
          );
        }}
        removeRow={(value: string, rowId?: string) => {
          if (shouldOpenDeletionModal(TRAJECTORY_TYPE.MISC_CAPACITY, Number(rowId), data)) {
            setRowToDelete({ index: Number(rowId), value });
            setIsDeletionModalOpen(true);
          } else {
            void removeRow(TRAJECTORY_TYPE.MISC_CAPACITY, Number(rowId), data, value);
          }
        }}
        updateData={(rowId: string, value: unknown, status: RowStatus) => {
          const index = Number(rowId);
          const row = data[index];
          const trajectory = row?.trajectory;
          if ((status === 'empty' && trajectory) || (status === 'emptyError' && trajectory)) {
            void detachTrajectory(TRAJECTORY_TYPE.MISC_CAPACITY, [index], setData, data, status, row?.hypothesis);
          } else if (status === 'success') {
            const dbTrajectory = dbTrajectories.find((item) => item.trajectoryName === value) ?? trajectory;
            if (dbTrajectory)
              void attachTrajectory(TRAJECTORY_TYPE.MISC_CAPACITY, [Number(rowId)], status, dbTrajectory, setData);
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
              await importTrajectory(TRAJECTORY_TYPE.MISC_CAPACITY, value, [Number(rowIdSelected)], data, setData);
            }
          }}
          trajectoryType={TRAJECTORY_TYPE.MISC_CAPACITY}
          hypothesis={getAreaTrajectoryName(rowIdSelected, data)}
        />
      )}
      {isDeletionModalOpen && (
        <DeletionModal
          onClose={() => setIsDeletionModalOpen(false)}
          handleDeletionRow={async () => {
            if (rowToDelete?.value) {
              await removeRow(TRAJECTORY_TYPE.MISC_CAPACITY, rowToDelete.index, data, rowToDelete?.value);
              setIsDeletionModalOpen(false);
            }
          }}
        />
      )}
    </div>
  );
};

export default MiscInstalledPowerTab;
