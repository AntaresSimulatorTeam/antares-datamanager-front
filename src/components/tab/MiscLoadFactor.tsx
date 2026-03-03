import { CheckBoxData, HypothesisRowData, RowStatus, TabProps } from '@/shared/types';
import { CheckBoxListWithSearchBar } from '@/components/list/CheckBoxListWithSearchBar.tsx';
import getEditableHypothesisTableHeaders from '@/components/header/EditableHypothesisTableHeaders.tsx';
import { PegaseHypothesisTable } from '@common/layout/PegaseHypothesisTable/PegaseHypothesisTable.tsx';
import { useStudy, useStudyDispatch } from '@/store/contexts/StudyContext.tsx';
import { useCallback, useEffect, useState } from 'react';
import { ReadOnlyObject } from '@common/data/stdTable/types/readOnly.type';
import { useFetchHypothesisTrajectories } from '@/hooks/useFetchHypothesisTrajectories.ts';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { addRow } from '@/shared/services/hypothesisTableService.ts';
import { useHypothesisTableRemoveRow } from '@/hooks/useHypothesisTableRemoveRow.ts';

const MiscLoadFactorTab = ({ defaultAreas, areas, studyData }: TabProps) => {
  const studyState = useStudy();
  const dispatch = useStudyDispatch();
  const [readOnly, setReadOnly] = useState<ReadOnlyObject>({});
  const [data, setData] = useState<HypothesisRowData[]>([]);
  const [areasOptions, setAreasOptions] = useState<CheckBoxData[]>([]);
  const [checkedValues, setCheckedValues] = useState<string[]>([]);

  const { hypothesisTrajectories, areasTrajectoryOptions, dropDownListOptions, readOnlyRow } =
    useFetchHypothesisTrajectories(
      areas,
      TRAJECTORY_TYPE.MISC_LOAD,
      defaultAreas,
      studyData?.id,
      studyData?.status,
      studyState.studyStatus,
    );
  const { removeRow } = useHypothesisTableRemoveRow(studyData, dispatch, setData, setCheckedValues);

  useEffect(() => {
    const setMiscLoadHypothesis = () => {
      areasTrajectoryOptions && setAreasOptions(areasTrajectoryOptions);
      dropDownListOptions && setCheckedValues(dropDownListOptions);
      hypothesisTrajectories && setData(hypothesisTrajectories);
      setReadOnly(readOnlyRow);
    };
    setMiscLoadHypothesis();
  }, [hypothesisTrajectories, areasTrajectoryOptions, dropDownListOptions, readOnlyRow, studyState.studyStatus]);

  const handleSelectionChange = useCallback(
    async (value: string, isChecked?: boolean) => {
      const indexRow = data.findIndex((row) => row.hypothesis === value);
      if (isChecked) {
        addRow(TRAJECTORY_TYPE.MISC_LOAD, value, dispatch, setCheckedValues, setData);
      } else {
        await removeRow(TRAJECTORY_TYPE.MISC_LOAD, indexRow, data, value);
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
        id="misc-load-factor-table"
        data={data}
        getTableHeaders={getEditableHypothesisTableHeaders}
        fileStatus={'empty'}
        isStudyGenerated={false}
        readOnly={readOnly}
        progress={0}
        idSelected={'0'}
        removeRow={(value: string, rowId?: string) => {
          void removeRow(TRAJECTORY_TYPE.MISC_LOAD, Number(rowId), data, value);
        }}
        updateData={(_rowId: string, _value: unknown, _status: RowStatus) => Promise.resolve()}
        isReadOnlyEnable={true}
      />
    </div>
  );
};

export default MiscLoadFactorTab;
