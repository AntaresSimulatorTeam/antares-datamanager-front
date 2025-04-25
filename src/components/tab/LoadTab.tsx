/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import StdSimpleTable from '@common/data/stdSimpleTable/StdSimpleTable.tsx';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ReadOnlyObject } from '@common/data/stdTable/types/readOnly.type';
import { AreaAndLinkRowData, LocationState, SelectOption, TrajectoryAreaData } from '@/shared/types';
import { TRAJECTORY_SELECTION_STATUS, TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import getAreaLinkTableHeaders from '@/components/header/AreaLinkTableHeaders.tsx';
import { useTranslation } from 'react-i18next';
import { useStudy } from '@/store/contexts/StudyContext.tsx';
import { ErrorMessageType } from '@/components/tab/AreaLinkTab.tsx';
import { useLocation } from 'react-router-dom';
import {
  fetchTrajectoriesFromDB,
  getDefaultLoadHypothesis,
  getTrajectoryDataByTypeAndId,
} from '@/shared/services/trajectoryService.ts';
import { convertToSelectionOptionType } from '@/shared/utils/formFormatter.ts';
import StdCheckboxGroupWrapper from '@/components/forms/stdCheckboxGroup/StdCheckboxGroupWrapper.tsx';
import StdCheckbox from '@/components/forms/stdCheckbox/StdCheckbox.tsx';
import SearchBar from '@/pages/pegase/home/components/SearchBar.tsx';

export type CheckBoxData = {
  name: string;
  isDefault: boolean;
};

const LoadTab = () => {
  const { t } = useTranslation();
  const studyState = useStudy();
  const location = useLocation();
  const study = (location.state as LocationState)?.study;
  const [readOnly, _] = useState<ReadOnlyObject>({});
  const [data, setData] = useState<AreaAndLinkRowData[]>([]);
  const [errorInfo, setErrorInfo] = useState<ErrorMessageType>({ index: 0, message: '' });
  const [areasOptions, setAreasOptions] = useState<CheckBoxData[]>([]);
  const [defaultHypothesis, setDefaultHypothesis] = useState<CheckBoxData[]>([]);
  const [checkedValues, setCheckedValues] = useState<string[]>([]);

  useEffect(() => {
    const fetchHypothesis = async () => {
      try {
        const hypothesis: CheckBoxData[] = (await getDefaultLoadHypothesis())?.map((area) => ({
          name: area.name,
          isDefault: true,
        }));
        setDefaultHypothesis(hypothesis);
        const trajectoryAreaId = studyState[`${TRAJECTORY_TYPE.AREA}`]?.id;
        let newArea: CheckBoxData[];
        if (trajectoryAreaId) {
          const areas = (await getTrajectoryDataByTypeAndId(
            TRAJECTORY_TYPE.AREA,
            trajectoryAreaId,
          )) as unknown as TrajectoryAreaData[];
          if (areas.length > 0) {
            newArea = (areas || []).map((area) => ({ name: area.areaName, isDefault: false }));
            setAreasOptions(hypothesis?.concat(newArea));
          } else {
            setAreasOptions(hypothesis);
          }
        }
        // ajouter les areas dont une trajectoire est liée à l'étude : dans le tableau / la check box list (avec case cochée)
        //const trajectories: DbTrajectory[] = await getStudyTrajectories(study.id, TRAJECTORY_TYPE.LOAD);
        //setCheckedValues(hypothesis.map((item) => item.name));
        setData(
          hypothesis
            .map((item) => ({
              hypothesis: item.name,
              trajectory: null,
              status: TRAJECTORY_SELECTION_STATUS.MISSING,
              isDefault: true,
            }))
            .sort((a, b) => {
              if (a.hypothesis === 'OTHERS' || b.hypothesis === 'OTHERS') {
                return 1;
              } else {
                return a.hypothesis.localeCompare(b.hypothesis, 'en', { ignorePunctuation: true });
              }
            }),
        );
      } catch {
        //silent handler
      }
    };

    void fetchHypothesis();
  }, []);

  const handleTrajectoryUpdate = async () => Promise.resolve();
  const handleFetchTrajectoriesFS = async () => Promise.resolve();
  const handleViewTrajectory = async () => Promise.resolve();

  const handleTrajectorySearch = useCallback(
    async (value?: string): Promise<SelectOption[] | undefined> => {
      try {
        const results = await fetchTrajectoriesFromDB(TRAJECTORY_TYPE.LOAD, study.horizon, value);
        return convertToSelectionOptionType(results);
      } catch {
        // silent handler
      }
    },
    [study.horizon],
  );

  const removeRow = (indexRow: number, areaName?: string) => {
    setData((prev) => prev.filter((_row: AreaAndLinkRowData, index: number) => index !== indexRow));
    if (areaName) {
      setCheckedValues((prev) => [...prev.filter((name) => name !== areaName)]);
    }
  };

  const addRow = (name: string) => {
    setData((prev) =>
      [
        {
          hypothesis: name,
          trajectory: null,
          status: TRAJECTORY_SELECTION_STATUS.MISSING,
        },
        ...prev,
      ].sort((a, b) => {
        if (a.hypothesis === 'OTHERS' || b.hypothesis === 'OTHERS') {
          return 1;
        } else {
          return a.hypothesis.localeCompare(b.hypothesis, 'en', { ignorePunctuation: true });
        }
      }),
    );
  };

  const handleSelectionChange = (name: string, isChecked?: boolean, isCheckboxControl?: boolean) => {
    console.log('=============== isCheckboxControl', isCheckboxControl);
    if (isChecked) {
      if (checkedValues?.includes(name)) {
        return;
      } else {
        addRow(name);
        setCheckedValues((prev) => [...prev, name]);
      }
    } else {
      removeRow(data.findIndex((row) => row.hypothesis === name));
      setCheckedValues((prev) => [...prev.filter((prevName) => prevName !== name)]);
    }
  };

  const columns = useMemo(
    () =>
      getAreaLinkTableHeaders(
        t,
        handleTrajectoryUpdate,
        handleFetchTrajectoriesFS,
        handleTrajectorySearch,
        handleViewTrajectory,
        errorInfo,
        setErrorInfo,
        studyState?.studyStatus,
        TRAJECTORY_TYPE.LOAD,
        removeRow,
      ),
    [data, studyState?.studyStatus, errorInfo],
  );

  return (
    <div className="flex h-fit w-full gap-6">
      <div className="flex h-fit w-1/5 flex-col gap-1 overflow-y-auto rounded border-2 border-b-gray-600 p-2">
        <div className="border-b-2 border-b-gray-600 pb-2">
          <SearchBar onSearch={() => {}} placeholder={t('studyDetails.@search_area')} />
        </div>
        <StdCheckboxGroupWrapper label={''} name={''} onChange={handleSelectionChange} checkedValues={checkedValues}>
          <div className="flex w-full flex-wrap gap-x-4">
            {areasOptions?.map((area) => (
              <StdCheckbox
                key={`load-check-${area.name}`}
                label={area.name}
                value={area.name}
                name={''}
                defaultChecked={area.isDefault}
                disabled={area.isDefault}
              />
            ))}
          </div>
        </StdCheckboxGroupWrapper>
      </div>
      <div className="flex h-fit w-4/5">
        <StdSimpleTable
          id="load-table"
          data={data}
          columns={columns}
          enableColumnResizing={false}
          enableReadOnly={true}
          state={{ readOnly }}
        />
      </div>
    </div>
  );
};

export default LoadTab;
