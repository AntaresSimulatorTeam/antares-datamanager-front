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
import { useEffect, useState } from 'react';
import { ReadOnlyObject } from '@common/data/stdTable/types/readOnly.type';
import { useStudy } from '@/store/contexts/StudyContext.tsx';
import { CheckBoxListWithSearchBar } from '@/components/list/CheckBoxListWithSearchBar.tsx';
import { STSTechnology } from '@/mocks/data/list/names.ts';
import getExpandableHypothesisTableHeaders from '@/components/header/ExpandableHypothesisTableHeaders.tsx';

const STSTab = ({ defaultAreas, areas }: TabProps) => {
  const studyState = useStudy();
  const location = useLocation();
  const study = (location.state as LocationStudy)?.study;
  const [readOnly, setReadOnly] = useState<ReadOnlyObject>({});
  const [data, setData] = useState<HypothesisRowData[]>([]);
  const [areasOptions, setAreasOptions] = useState<CheckBoxData[]>([]);
  const [checkedValues, setCheckedValues] = useState<string[]>([]);
  const [isStudyGenerated] = useState(
    studyState.studyStatus === StudyStatus.GENERATED || study.status === StudyStatus.GENERATED,
  );
  const { hypothesisTrajectories, areasTrajectoryOptions, dropDownListOptions, readOnlyRow } =
    useFetchHypothesisTrajectories(
      areas,
      study?.id,
      TRAJECTORY_TYPE.STS,
      defaultAreas,
      isStudyGenerated,
      STSTechnology,
    );

  useEffect(() => {
    const setHypothesis = () => {
      areasTrajectoryOptions && setAreasOptions(areasTrajectoryOptions);
      dropDownListOptions && setCheckedValues(dropDownListOptions);
      hypothesisTrajectories && setData(hypothesisTrajectories);
      setReadOnly(readOnlyRow);
    };
    setHypothesis();
  }, [
    hypothesisTrajectories,
    areas,
    defaultAreas,
    isStudyGenerated,
    areasTrajectoryOptions,
    dropDownListOptions,
    readOnlyRow,
  ]);

  return (
    <div className="flex min-h-0 w-full gap-6">
      <CheckBoxListWithSearchBar
        checkedValues={checkedValues}
        options={areasOptions}
        handleSelectionChange={() => {}}
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
        type={TRAJECTORY_TYPE.STS}
      />
    </div>
  );
};

export default STSTab;
