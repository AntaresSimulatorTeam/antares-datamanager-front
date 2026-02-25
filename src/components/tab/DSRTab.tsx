import { CheckBoxData, DbTrajectory, HypothesisRowData, RowStatus, SelectOption, TabProps } from '@/shared/types';
import { useCallback, useEffect, useState } from 'react';
import { CheckBoxListWithSearchBar } from '@/components/list/CheckBoxListWithSearchBar.tsx';
import getExpandableHypothesisTableHeaders from '@/components/header/ExpandableHypothesisTableHeaders.tsx';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { getAreaTrajectoryName } from '@/shared/utils/trajectoryUtils.ts';
import { shouldOpenDeletionModal } from '@/shared/helpers/hypothesisTableHelper.ts';
import { PegaseHypothesisTable } from '@common/layout/PegaseHypothesisTable/PegaseHypothesisTable.tsx';
import { StudyStatus } from '@/shared/types/common/StudyStatus.type.ts';
import { ReadOnlyObject } from '@common/data/stdTable/types/readOnly.type';
import { useFetchHypothesisTrajectories } from '@/hooks/useFetchHypothesisTrajectories.ts';
import { useStudy, useStudyDispatch } from '@/store/contexts/StudyContext.tsx';
import { addRow, handleFetchTrajectoriesFS } from '@/shared/services/hypothesisTableService.ts';
import { useHypothesisTableRemoveRow } from '@/hooks/useHypothesisTableRemoveRow.ts';
import { useNewStudyModal } from '@/hooks/useNewStudyModal.ts';
import { useTrajectoryAttach } from '@/hooks/useTrajectoryAttach.ts';
import { ImportTrajectoryModal } from '@common/modal/ImportTrajectoryModal.tsx';
import { useTrajectoryImport } from '@/hooks/useTrajectoryImport.ts';

const DSRTab = ({ defaultAreas, areas, studyData }: TabProps) => {
  const studyState = useStudy();
  const dispatch = useStudyDispatch();
  const { isModalOpen, toggleModal } = useNewStudyModal();
  const [rowIdSelected, setRowIdSelected] = useState<string>('0');
  const [_rowToDelete, setRowToDelete] = useState<{ index: number; value?: string } | null>(null);
  const [readOnly, setReadOnly] = useState<ReadOnlyObject>({});
  const [areasOptions, setAreasOptions] = useState<CheckBoxData[]>([]);
  const [data, setData] = useState<HypothesisRowData[]>([]);
  const [checkedValues, setCheckedValues] = useState<string[]>([]);
  const [dbTrajectories, _setDbTrajectories] = useState<DbTrajectory[]>([]);
  const [optionsFS, setOptionsFS] = useState<SelectOption[]>();
  const [_isDeletionModalOpen, setIsDeletionModalOpen] = useState(false);
  const [isStudyGenerated, _setIsStudyGenerated] = useState(
    studyState.studyStatus === StudyStatus.GENERATED || studyData.status === StudyStatus.GENERATED,
  );
  const { hypothesisTrajectories, areasTrajectoryOptions, dropDownListOptions, readOnlyRow } =
    useFetchHypothesisTrajectories(areas, studyData?.id, TRAJECTORY_TYPE.DSR, defaultAreas, isStudyGenerated);
  const { fileStatus, progress, importTrajectory } = useTrajectoryImport(studyData, studyState, dispatch, setReadOnly);
  const { removeRow } = useHypothesisTableRemoveRow(studyData, dispatch, setData, setCheckedValues, setReadOnly);
  const { attachTrajectory } = useTrajectoryAttach(studyData, studyState, dispatch);

  useEffect(() => {
    const setHypothesis = () => {
      areasTrajectoryOptions && setAreasOptions(areasTrajectoryOptions);
      dropDownListOptions && setCheckedValues(dropDownListOptions);
      hypothesisTrajectories && setData(hypothesisTrajectories);
      setReadOnly(readOnlyRow);
    };
    setHypothesis();
  }, [hypothesisTrajectories, areasTrajectoryOptions, dropDownListOptions, readOnlyRow]);

  const handleSelectionChange = useCallback(
    async (value: string, isChecked?: boolean): Promise<void> => {
      const indexRow = data.findIndex((row) => row.hypothesis === value);
      if (isChecked) {
        addRow(TRAJECTORY_TYPE.DSR, value, dispatch, setCheckedValues, setData, [], [], setReadOnly);
      } else if (shouldOpenDeletionModal(TRAJECTORY_TYPE.DSR, indexRow, data)) {
        setRowToDelete({ index: indexRow, value });
        setIsDeletionModalOpen(true);
      } else {
        try {
          await removeRow(TRAJECTORY_TYPE.DSR, value, indexRow, data);
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
        disabled={false}
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
        handleSearch={(_fileNameContains: string, _rowId: string) => Promise.resolve([])}
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
        updateData={(rowId: string, value: unknown, status: RowStatus) => {
          const index = Number(rowId);
          const trajectory = data[index]?.trajectory;
          if (status === 'empty' || status === 'emptyError') {
            //const current = data[indexArray[0]]?.subRows?.[indexArray[1]]?.trajectory ?? null;
            //if (current) {
            //await detachTrajectory(TRAJECTORY_TYPE.DSR, indexArray, status, current, setData);
            //}
          } else if (status === 'success') {
            const dbTrajectory = dbTrajectories.find((item) => item.trajectoryName === value) ?? trajectory;
            if (dbTrajectory) {
              void attachTrajectory(TRAJECTORY_TYPE.DSR, [index], status, dbTrajectory, setData);
            }
          }
        }}
        removeRow={(value: string, rowId?: string) => {
          if (shouldOpenDeletionModal(TRAJECTORY_TYPE.DSR, Number(rowId), data)) {
            setRowToDelete({ index: Number(rowId), value });
            setIsDeletionModalOpen(true);
          } else {
            void removeRow(TRAJECTORY_TYPE.DSR, value, Number(rowId), data);
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
    </div>
  );
};

export default DSRTab;
