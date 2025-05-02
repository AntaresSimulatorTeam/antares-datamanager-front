/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import StdSimpleTable from '@common/data/stdSimpleTable/StdSimpleTable.tsx';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AreaAndLinkRowData,
  DbTrajectory,
  DbTrajectoryWithState,
  LocationState,
  RowStatus,
  SelectOption,
  TrajectoryAreaData,
} from '@/shared/types';
import { TRAJECTORY_SELECTION_STATUS, TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import getHypothesisTableHeaders from '@/components/header/HypothesisTableHeaders.tsx';
import { useTranslation } from 'react-i18next';
import { useStudy, useStudyDispatch } from '@/store/contexts/StudyContext.tsx';
import { ErrorMessageType } from '@/components/tab/AreaLinkTab.tsx';
import { useLocation } from 'react-router-dom';
import {
  fetchTrajectoriesFromDB,
  getDefaultLoadHypothesis,
  getTrajectoryDataByTypeAndId,
  linkTrajectoryToStudy,
  unlinkTrajectoryFromStudy,
} from '@/shared/services/trajectoryService.ts';
import { convertToSelectionOptionType } from '@/shared/utils/formFormatter.ts';
import SearchBar from '@/pages/pegase/home/components/SearchBar.tsx';
import { RdsCheckbox, RdsCheckboxGroupWrapper, RdsHeading } from 'rte-design-system-react';
import { getStudyTrajectories } from '@/shared/services/studyService.ts';
import { STUDY_ACTION } from '@/shared/enum/study.ts';

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
  const [checkedValues, setCheckedValues] = useState<string[]>([]);
  const dispatch = useStudyDispatch();

  useEffect(() => {
    const fetchHypothesis = async () => {
      try {
        const areaDefault: CheckBoxData[] = (await getDefaultLoadHypothesis())?.map((area) => ({
          name: area.name,
          isDefault: true,
        }));
        const trajectoryAreaId =
          studyState && studyState?.[`${TRAJECTORY_TYPE.AREA}`]
            ? (studyState?.[`${TRAJECTORY_TYPE.AREA}`] as DbTrajectory)?.id
            : null;
        let newArea: CheckBoxData[];
        if (trajectoryAreaId != null) {
          const areas = (await getTrajectoryDataByTypeAndId(
            TRAJECTORY_TYPE.AREA,
            trajectoryAreaId,
          )) as unknown as TrajectoryAreaData[];
          if (areas.length > 0) {
            newArea = areas
              .map((area) => {
                if (!areaDefault?.some((item) => item.name === area.areaName)) {
                  return { name: area.areaName, isDefault: false };
                }
              })
              .filter(Boolean) as CheckBoxData[];
            setAreasOptions(areaDefault?.concat(newArea));
          } else {
            setAreasOptions(areaDefault);
          }
        }

        const studyTrajectory = (await getStudyTrajectories(study?.id, TRAJECTORY_TYPE.LOAD)) as DbTrajectory[];
        const loadTrajectory = (studyState[TRAJECTORY_TYPE.LOAD] as DbTrajectoryWithState[]) ?? null;
        const trajectoryLoad = loadTrajectory?.length ? studyTrajectory.concat(loadTrajectory) : studyTrajectory;

        const areaDataDefault: AreaAndLinkRowData[] = areaDefault?.map((area) => ({
          hypothesis: area.name,
          trajectory: trajectoryLoad?.find((trajectory) => trajectory.loadArea === area.name) ?? null,
          status: TRAJECTORY_SELECTION_STATUS.MISSING,
          isDefault: true,
        }));

        const areaData = trajectoryLoad
          .map((trajectory) => {
            if (!areaDefault.some((item) => item.name === trajectory.loadArea)) {
              return {
                hypothesis: trajectory.loadArea ?? '',
                trajectory: trajectory ?? null,
                status: trajectory ? TRAJECTORY_SELECTION_STATUS.OK : TRAJECTORY_SELECTION_STATUS.MISSING,
                isDefault: false,
              };
            }
          })
          .filter(Boolean) as AreaAndLinkRowData[];

        setData(areaDataDefault.concat(areaData));

        if (areaDefault.length > 1) {
          const defaultCheckList: string[] = areaDefault.map((item) => item.name);
          const checkList = trajectoryLoad
            .map((trajectory) => {
              if (trajectory.loadArea) return trajectory.loadArea;
            })
            .filter(Boolean) as string[];
          setCheckedValues(defaultCheckList.concat(checkList));
        }
      } catch {
        //silent handler
      }
    };

    void fetchHypothesis();
  }, []);

  const handleTrajectoryUpdate = async (trajectoryId: number, status?: RowStatus) => {
    try {
      if (status === 'empty') {
        await unlinkTrajectoryFromStudy(trajectoryId, study.id);
        setData((prev) => {
          const index = prev.findIndex((item) => item?.trajectory?.id === trajectoryId);
          if (index >= 0) {
            prev[index].trajectory = null;
            prev[index].status = TRAJECTORY_SELECTION_STATUS.MISSING;
          }
          return prev;
        });
      } else if (status === 'success') {
        const newTrajectory = (await linkTrajectoryToStudy(
          TRAJECTORY_TYPE.LOAD,
          trajectoryId,
          study.id,
        )) as DbTrajectory;
        setData((prev) => {
          const index = prev.findIndex((item) => item.hypothesis === newTrajectory.loadArea);
          if (index >= 0) {
            prev[index].trajectory = newTrajectory;
            prev[index].status = TRAJECTORY_SELECTION_STATUS.OK;
          }
          return prev;
        });
      }
    } catch {
      // Silent handler
    }
  };

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

  const removeRow = async (indexRow: number, areaName?: string) => {
    if (data[indexRow]?.trajectory && data[indexRow]?.status === TRAJECTORY_SELECTION_STATUS.OK) {
      await unlinkTrajectoryFromStudy(data[indexRow].trajectory.id, study.id);
    }
    setData((prev) => prev.filter((_row: AreaAndLinkRowData, index: number) => index !== indexRow));
    if (areaName) {
      setCheckedValues((prev) => [...prev.filter((name) => name !== areaName)]);
    }
  };

  const addRow = (name: string) => {
    dispatch?.({
      type: STUDY_ACTION.ADD_TRAJECTORY_LOAD,
      payload: {
        id: 2,
        trajectoryName: '',
        type: TRAJECTORY_TYPE.LOAD,
        version: 0,
        userName: 'user',
        creationDate: new Date(),
        loadArea: name,
      },
    });
    setData((prev) =>
      [
        {
          hypothesis: name,
          trajectory: null,
          status: TRAJECTORY_SELECTION_STATUS.MISSING,
          isDefault: false,
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

  const handleSelectionChange = async (name: string, isChecked?: boolean) => {
    if (isChecked) {
      if (checkedValues?.includes(name)) {
        return;
      } else {
        addRow(name);
        setCheckedValues((prev) => [...prev, name]);
      }
    } else {
      try {
        await removeRow(data.findIndex((row) => row.hypothesis === name));
        setCheckedValues((prev) => [...prev.filter((prevName) => prevName !== name)]);
      } catch {
        // Silent handler
      }
    }
  };

  const columns = useMemo(
    () =>
      getHypothesisTableHeaders(
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
    <div className="flex h-fit w-full flex-col gap-4">
      <RdsHeading title={t('studyDetails.@hypothesis')} size={'m'} />
      <div className="flex h-fit w-full gap-6">
        <div className="flex max-h-full min-h-fit w-1/5 flex-col gap-2 overflow-y-auto rounded border border-gray-400 p-2">
          <div className="border-b border-gray-400 pb-2">
            <SearchBar onSearch={() => {}} placeholder={t('studyDetails.@search_area')} />
          </div>
          <RdsCheckboxGroupWrapper
            label={''}
            name={''}
            onChange={(value: string, status?: boolean) => void handleSelectionChange(value, status)}
            checkedValues={checkedValues}
          >
            {areasOptions?.map((area) => (
              <RdsCheckbox
                key={`load-check-${area.name}`}
                label={area.name}
                value={area.name}
                name={''}
                defaultChecked={area.isDefault}
                disabled={area.isDefault}
                checked={area.isDefault}
              />
            ))}
          </RdsCheckboxGroupWrapper>
        </div>
        <div className="flex h-fit w-4/5">
          <StdSimpleTable id="load-table" data={data} columns={columns} enableColumnResizing={false} />
        </div>
      </div>
    </div>
  );
};

export default LoadTab;
