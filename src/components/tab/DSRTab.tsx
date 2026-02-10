import { CheckBoxData, DbTrajectory, HypothesisRowData, RowStatus, SelectOption, TabProps } from '@/shared/types';
import { useEffect, useState } from 'react';
import { CheckBoxListWithSearchBar } from '@/components/list/CheckBoxListWithSearchBar.tsx';
import getExpandableHypothesisTableHeaders from '@/components/header/ExpandableHypothesisTableHeaders.tsx';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { getRowDataSelected } from '@/shared/utils/trajectoryUtils.ts';
import { shouldOpenDeletionModal } from '@/shared/helpers/hypothesisTableHelper.ts';
import { PegaseHypothesisTable } from '@common/layout/PegaseHypothesisTable/PegaseHypothesisTable.tsx';
import { StudyStatus } from '@/shared/types/common/StudyStatus.type.ts';
import { ReadOnlyObject } from '@common/data/stdTable/types/readOnly.type';
import { useFetchHypothesisTrajectories } from '@/hooks/useFetchHypothesisTrajectories.ts';
import { useStudy } from '@/store/contexts/StudyContext.tsx';

const DSRTab = ({ defaultAreas, areas, studyData }: TabProps) => {
  const studyState = useStudy();
  const [rowIdSelected, _setRowIdSelected] = useState<string>('0');
  const [readOnly, setReadOnly] = useState<ReadOnlyObject>({});
  const [areasOptions, setAreasOptions] = useState<CheckBoxData[]>([]);
  const [data, setData] = useState<HypothesisRowData[]>([]);
  const [checkedValues, setCheckedValues] = useState<string[]>([]);
  const [dbTrajectories, _setDbTrajectories] = useState<DbTrajectory[]>([]);
  const [_optionsFS, _setOptionsFS] = useState<SelectOption[]>();
  const [_isDeletionModalOpen, setIsDeletionModalOpen] = useState(false);
  const [isStudyGenerated, _setIsStudyGenerated] = useState(
    studyState.studyStatus === StudyStatus.GENERATED || studyData.status === StudyStatus.GENERATED,
  );
  const { hypothesisTrajectories, areasTrajectoryOptions, dropDownListOptions, readOnlyRow } =
    useFetchHypothesisTrajectories(areas, studyData?.id, TRAJECTORY_TYPE.DSR, defaultAreas, isStudyGenerated);

  useEffect(() => {
    const setHypothesis = () => {
      areasTrajectoryOptions && setAreasOptions(areasTrajectoryOptions);
      dropDownListOptions && setCheckedValues(dropDownListOptions);
      hypothesisTrajectories && setData(hypothesisTrajectories);
      setReadOnly(readOnlyRow);
    };
    setHypothesis();
  }, [hypothesisTrajectories, areasTrajectoryOptions, dropDownListOptions, readOnlyRow]);

  return (
    <div className="flex min-h-0 w-full gap-6">
      <CheckBoxListWithSearchBar
        checkedValues={checkedValues}
        options={areasOptions}
        handleSelectionChange={() => {}}
        dividerPosition={defaultAreas.length}
        disabled={false}
      />
      <PegaseHypothesisTable
        id="sts-table"
        data={data}
        getTableHeaders={getExpandableHypothesisTableHeaders}
        fileStatus={'empty'}
        isStudyGenerated={isStudyGenerated}
        readOnly={readOnly}
        progress={0}
        idSelected={String(rowIdSelected)}
        isReadOnlyEnable={true}
        handleSearch={(_fileNameContains: string, _rowId: string) => Promise.resolve([])}
        handleImport={async (_rowId: string) => Promise.resolve()}
        updateData={(rowId: string, value: unknown, status: RowStatus) => {
          const indexArray = rowId.split('.').map(Number);
          if (status === 'empty' || status === 'emptyError') {
            const current = data[indexArray[0]]?.subRows?.[indexArray[1]]?.trajectory ?? null;
            if (current) {
              //await detachTrajectory(TRAJECTORY_TYPE.DSR, indexArray, status, current, setData);
            }
          } else if (status === 'success') {
            const dbTrajectory =
              dbTrajectories.length > 0
                ? dbTrajectories.find((item) => item.id === value)
                : getRowDataSelected(data, indexArray)?.trajectory;
            if (dbTrajectory) {
              //void attachTrajectory(TRAJECTORY_TYPE.DSR, indexArray, status, dbTrajectory, setData);
            }
          }
        }}
        removeRow={(_value: string, rowId?: string) => {
          if (shouldOpenDeletionModal(TRAJECTORY_TYPE.DSR, Number(rowId), data)) {
            //setRowToDelete({ index: Number(rowId), value });
            setIsDeletionModalOpen(true);
          } else {
            //void removeRow(TRAJECTORY_TYPE.STS, value, Number(rowId), data);
          }
        }}
        type={TRAJECTORY_TYPE.DSR}
      />
    </div>
  );
};

export default DSRTab;
