/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { StudyStatus } from '@/shared/types/common/StudyStatus.type.ts';
import { PegaseHypothesisTable } from '@common/layout/PegaseHypothesisTable/PegaseHypothesisTable.tsx';
import { useFetchHypothesisTrajectories } from '@/hooks/useFetchHypothesisTrajectories.ts';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { CheckBoxData, HypothesisRowData, SelectOption, TabProps } from '@/shared/types';
import { useCallback, useEffect, useState } from 'react';
import { ReadOnlyObject } from '@common/data/stdTable/types/readOnly.type';
import { useStudy, useStudyDispatch } from '@/store/contexts/StudyContext.tsx';
import { CheckBoxListWithSearchBar } from '@/components/list/CheckBoxListWithSearchBar.tsx';
import getExpandableHypothesisTableHeaders from '@/components/header/ExpandableHypothesisTableHeaders.tsx';
import { addRow, handleFetchTrajectoriesFS } from '@/shared/services/hypothesisTableService.ts';
import { useHypothesisTableRemoveRow } from '@/hooks/useHypothesisTableRemoveRow.ts';
import { filterRow, generateReadOnlyIndexMap, getAreaTrajectoryName } from '@/shared/utils/trajectoryUtils.ts';
import { getCheckedValues } from '@/shared/helpers/hypothesisTableHelper.ts';
import { ImportTrajectoryModal } from '@common/modal/ImportTrajectoryModal.tsx';
import { useNewStudyModal } from '@/hooks/useNewStudyModal.ts';

const STSTab = ({ defaultAreas, areas, studyData }: TabProps) => {
  const studyState = useStudy();
  const dispatch = useStudyDispatch();
  const [readOnly, setReadOnly] = useState<ReadOnlyObject>({});
  const [optionsFS, setOptionsFS] = useState<SelectOption[]>();
  const [rowIdSelected, setRowIdSelected] = useState<string>('0.0');
  const { isModalOpen, toggleModal } = useNewStudyModal();
  const [data, setData] = useState<HypothesisRowData[]>([]);
  const [areasOptions, setAreasOptions] = useState<CheckBoxData[]>([]);
  const [checkedValues, setCheckedValues] = useState<string[]>([]);
  const [stsTechnologies, setStsTechnologies] = useState<string[]>([]);
  const [isStudyGenerated, setIsStudyGenerated] = useState(
    studyState.studyStatus === StudyStatus.GENERATED || studyData.status === StudyStatus.GENERATED,
  );
  const { hypothesisTrajectories, areasTrajectoryOptions, dropDownListOptions, readOnlyRow, technologyList } =
    useFetchHypothesisTrajectories(areas, studyData?.id, TRAJECTORY_TYPE.STS, defaultAreas, isStudyGenerated);
  const { removeRow } = useHypothesisTableRemoveRow(studyData, dispatch, setData, setCheckedValues);

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
        fileStatus={'empty'}
        isStudyGenerated={isStudyGenerated}
        readOnly={readOnly}
        progress={0}
        idSelected={'0'}
        isReadOnlyEnable={true}
        handleSearch={() => Promise.resolve(undefined)}
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
        removeRow={(value: string, rowId?: string) => void removeRow(TRAJECTORY_TYPE.STS, value, Number(rowId), data)}
        type={TRAJECTORY_TYPE.STS}
        list={technologyList}
      />
      {isModalOpen && (
        <ImportTrajectoryModal
          options={optionsFS}
          onClose={async (_value?: SelectOption) => {
            toggleModal();
            return Promise.resolve();
          }}
          trajectoryType={TRAJECTORY_TYPE.STS}
          hypothesis={getAreaTrajectoryName(rowIdSelected, data)}
        />
      )}
    </div>
  );
};

export default STSTab;
