import { CheckBoxData, HypothesisRowData, RowStatus, TabProps } from '@/shared/types';
import { CheckBoxListWithSearchBar } from '@/components/list/CheckBoxListWithSearchBar.tsx';
import getEditableHypothesisTableHeaders from '@/components/header/EditableHypothesisTableHeaders.tsx';
import { PegaseHypothesisTable } from '@common/layout/PegaseHypothesisTable/PegaseHypothesisTable.tsx';
import { useFetchHypothesisTrajectories } from '@/hooks/useFetchHypothesisTrajectories.ts';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { useCallback, useEffect, useState } from 'react';
import { ReadOnlyObject } from '@common/data/stdTable/types/readOnly.type';
import { useStudy, useStudyDispatch } from '@/store/contexts/StudyContext.tsx';
import { addRow } from '@/shared/services/hypothesisTableService.ts';
import { shouldOpenDeletionModal } from '@/shared/helpers/hypothesisTableHelper.ts';
import { useHypothesisTableRemoveRow } from '@/hooks/useHypothesisTableRemoveRow.ts';

const MiscInstalledPowerTab = ({ defaultAreas, areas, studyData }: TabProps) => {
  const studyState = useStudy();
  const dispatch = useStudyDispatch();
  const [readOnly, setReadOnly] = useState<ReadOnlyObject>({});
  const [data, setData] = useState<HypothesisRowData[]>([]);
  const [areasOptions, setAreasOptions] = useState<CheckBoxData[]>([]);
  const [checkedValues, setCheckedValues] = useState<string[]>([]);
  const [_rowToDelete, setRowToDelete] = useState<{ index: number; value?: string } | null>(null);
  const [_isDeletionModalOpen, setIsDeletionModalOpen] = useState(false);
  const { hypothesisTrajectories, areasTrajectoryOptions, dropDownListOptions, readOnlyRow } =
    useFetchHypothesisTrajectories(
      areas,
      TRAJECTORY_TYPE.MISC_CAPACITY,
      defaultAreas,
      studyData?.id,
      studyData?.status,
      studyState.studyStatus,
    );
  const { removeRow } = useHypothesisTableRemoveRow(studyData, dispatch, setData, setCheckedValues);

  useEffect(() => {
    const setLoadHypothesis = () => {
      areasTrajectoryOptions && setAreasOptions(areasTrajectoryOptions);
      dropDownListOptions && setCheckedValues(dropDownListOptions);
      hypothesisTrajectories && setData(hypothesisTrajectories);
      setReadOnly(readOnlyRow);
    };
    setLoadHypothesis();
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
        fileStatus={'empty'}
        isStudyGenerated={false}
        readOnly={readOnly}
        progress={0}
        idSelected={'0'}
        handleSearch={async (_fileNameContains: string, _rowId: string) => Promise.resolve([])}
        handleImport={async (_rowId: string) => Promise.resolve()}
        removeRow={(value: string, rowId?: string) => {
          if (shouldOpenDeletionModal(TRAJECTORY_TYPE.MISC_CAPACITY, Number(rowId), data)) {
            setRowToDelete({ index: Number(rowId), value });
            setIsDeletionModalOpen(true);
          } else {
            void removeRow(TRAJECTORY_TYPE.MISC_CAPACITY, Number(rowId), data, value);
          }
        }}
        updateData={(_rowId: string, _value: unknown, _status: RowStatus) => Promise.resolve()}
        isReadOnlyEnable={true}
      />
    </div>
  );
};

export default MiscInstalledPowerTab;
