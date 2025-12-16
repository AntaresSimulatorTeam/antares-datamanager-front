/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { StudyStatus } from '@/shared/types/common/StudyStatus.type.ts';
import { PegaseHypothesisTable } from '@common/layout/PegaseHypothesisTable/PegaseHypothesisTable.tsx';
import { useFetchHypothesisTrajectories } from '@/hooks/useFetchHypothesisTrajectories.ts';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { useLocation } from 'react-router-dom';
import { CheckBoxData, HypothesisRowData, LocationStudy, TabProps } from '@/shared/types';
import { useCallback, useEffect, useState } from 'react';
import { ReadOnlyObject } from '@common/data/stdTable/types/readOnly.type';
import { useStudy, useStudyDispatch } from '@/store/contexts/StudyContext.tsx';
import { CheckBoxListWithSearchBar } from '@/components/list/CheckBoxListWithSearchBar.tsx';
import getExpandableHypothesisTableHeaders from '@/components/header/ExpandableHypothesisTableHeaders.tsx';
import { addRow } from '@/shared/services/hypothesisTableService.ts';
import { useHypothesisTableRemoveRow } from '@/hooks/useHypothesisTableRemoveRow.ts';
import { filterRow, generateReadOnlyIndexMap } from '@/shared/utils/trajectoryUtils.ts';

const STSTab = ({ defaultAreas, areas }: TabProps) => {
  const studyState = useStudy();
  const location = useLocation();
  const study = (location.state as LocationStudy)?.study;
  const dispatch = useStudyDispatch();
  const [readOnly, setReadOnly] = useState<ReadOnlyObject>({});
  const [data, setData] = useState<HypothesisRowData[]>([]);
  const [areasOptions, setAreasOptions] = useState<CheckBoxData[]>([]);
  const [checkedValues, setCheckedValues] = useState<string[]>([]);
  const [stsTechnologies, setStsTechnologies] = useState<string[]>([]);
  const [isStudyGenerated, setIsStudyGenerated] = useState(
    studyState.studyStatus === StudyStatus.GENERATED || study.status === StudyStatus.GENERATED,
  );
  const { hypothesisTrajectories, areasTrajectoryOptions, dropDownListOptions, readOnlyRow, technologyList } =
    useFetchHypothesisTrajectories(areas, study?.id, TRAJECTORY_TYPE.STS, defaultAreas, isStudyGenerated);
  const { removeRow } = useHypothesisTableRemoveRow(study, dispatch, setData, setCheckedValues);

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
      setData((rows) => filterRow(rows));
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
        studyState={StudyStatus.IN_PROGRESS}
        readOnly={readOnly}
        progress={0}
        idSelected={'0'}
        isReadOnlyEnable={true}
        handleSearch={() => Promise.resolve(undefined)}
        handleImport={() => Promise.resolve()}
        removeRow={(value: string, rowId?: string) => void removeRow(TRAJECTORY_TYPE.STS, value, Number(rowId), data)}
        type={TRAJECTORY_TYPE.STS}
        list={technologyList}
      />
    </div>
  );
};

export default STSTab;
