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
import { ReadOnlyObject } from '@common/data/stdTable/types/readOnly.type';
import getLoadHypothesisTableHeaders from '@/components/header/LoadHypothesisTableHeader.tsx';
import { sortKeepLastName } from '@/shared/utils/sortUtils.tsx';
import { buildRowData, removeDuplicate } from '@/shared/utils/trajectoryUtils.ts';
import { AREA_OTHERS } from '@/shared/const/studyConfig.ts';

export type CheckBoxData = {
  name: string;
  isDefault: boolean;
};

const LoadTab = () => {
  const { t } = useTranslation();
  const studyState = useStudy();
  const location = useLocation();
  const study = (location.state as LocationState)?.study;
  const dispatch = useStudyDispatch();
  const [readOnly, setReadOnly] = useState<ReadOnlyObject>({});
  const [readOnlyArea, setReadOnlyArea] = useState<string | null>(null);
  const [data, setData] = useState<AreaAndLinkRowData[]>([]);
  const [errorInfo, setErrorInfo] = useState<ErrorMessageType>({ index: 0, message: '' });
  const [areasOptions, setAreasOptions] = useState<CheckBoxData[]>([]);
  const [checkedValues, setCheckedValues] = useState<string[]>([]);

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
          const trajectoryAreas = (await getTrajectoryDataByTypeAndId(
            TRAJECTORY_TYPE.AREA,
            trajectoryAreaId,
          )) as unknown as TrajectoryAreaData[];

          // Build dropdown list options
          if (trajectoryAreas.length > 0) {
            let readOnlyIndex = -1;
            newArea = trajectoryAreas
              .map((trajectoryArea) => {
                readOnlyIndex = areaDefault?.findIndex((item) => item.name === trajectoryArea.areaName);
                if (readOnlyIndex < 0) {
                  return { name: trajectoryArea.areaName, isDefault: false };
                }
              })
              .filter(Boolean) as CheckBoxData[];
            if (readOnlyIndex >= 0) {
              setReadOnly({ [`${readOnlyIndex}`]: true });
              setReadOnlyArea(areaDefault[readOnlyIndex].name);
            }
            setAreasOptions(areaDefault?.concat(newArea));
          } else {
            setAreasOptions(areaDefault);
          }
        }

        const trajectoryLinked = (await getStudyTrajectories(study?.id, TRAJECTORY_TYPE.LOAD)) as DbTrajectory[];
        areaDefault.push({
          name: AREA_OTHERS,
          isDefault: true,
        });

        // Build hypothesis table
        const areaDataDefault: AreaAndLinkRowData[] = areaDefault?.map((area) => {
          const trajectoryArea = trajectoryLinked?.find((trajectory) => trajectory.loadArea === area.name);
          return buildRowData(area.name, true, trajectoryArea);
        });

        const emptyAreaSelected = (studyState[TRAJECTORY_TYPE.LOAD] as DbTrajectoryWithState[]) ?? [];
        const emptyArea = removeDuplicate(trajectoryLinked.concat(emptyAreaSelected));
        const areaData = emptyArea
          .map((trajectory: DbTrajectory) => {
            if (!areaDefault.some((item: CheckBoxData) => item.name === trajectory.loadArea)) {
              return buildRowData(trajectory.loadArea as string, false, trajectory);
            }
          })
          .filter(Boolean) as AreaAndLinkRowData[];

        if (areaData.length > 0) {
          setData(sortKeepLastName(areaDataDefault.concat(areaData), AREA_OTHERS));
        } else {
          setData(areaDataDefault);
        }

        if (areaDefault.length > 0) {
          const defaultCheckList: string[] = areaDefault.map((item) => item.name);
          const checkList = emptyArea
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

  const handleTrajectoryUpdate = async (rowIndex: number, trajectoryId: number, status?: RowStatus) => {
    try {
      if (status === 'empty') {
        await unlinkTrajectoryFromStudy(trajectoryId, study.id);
        dispatch?.({
          type: STUDY_ACTION.DELETE_LOAD_TRAJECTORY,
          payload: data[rowIndex].hypothesis,
        });
        setData((prev) => {
          prev[rowIndex].trajectory = null;
          prev[rowIndex].status = TRAJECTORY_SELECTION_STATUS.MISSING;
          return [...prev];
        });
      } else if (status === 'success') {
        const newTrajectory = await linkTrajectoryToStudy(TRAJECTORY_TYPE.LOAD, trajectoryId, study.id);
        const newTrajectoryWithState = {
          ...newTrajectory,
          state: TRAJECTORY_SELECTION_STATUS.OK,
        } as DbTrajectoryWithState;
        dispatch?.({
          type: STUDY_ACTION.ADD_TRAJECTORY_LOAD,
          payload: newTrajectoryWithState,
        });
        setData((prev) => {
          if (newTrajectory) {
            prev[rowIndex].trajectory = newTrajectoryWithState;
            prev[rowIndex].status = TRAJECTORY_SELECTION_STATUS.OK;
          }
          return [...prev];
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

  const removeRow = async (indexRow: number, value?: string) => {
    if (data?.[indexRow]) {
      dispatch?.({
        type: STUDY_ACTION.DELETE_LOAD_TRAJECTORY,
        payload: data[indexRow].hypothesis,
      });
      if (data[indexRow]?.trajectory && data[indexRow]?.status === TRAJECTORY_SELECTION_STATUS.OK) {
        await unlinkTrajectoryFromStudy(data[indexRow].trajectory.id, study.id);
      }
    }
    setData((prev) => prev.filter((_row: AreaAndLinkRowData, index: number) => index !== indexRow));
    if (value) {
      setCheckedValues((prev) => [...prev.filter((name) => name !== value)]);
    }
  };

  const addRow = (name: string) => {
    dispatch?.({
      type: STUDY_ACTION.ADD_TRAJECTORY_LOAD,
      payload: {
        id: Math.random(),
        trajectoryName: '',
        type: TRAJECTORY_TYPE.LOAD,
        version: 0,
        userName: 'user',
        creationDate: new Date(),
        loadArea: name,
        state: TRAJECTORY_SELECTION_STATUS.MISSING,
        messages: [],
      },
    });
    const newData = [
      {
        hypothesis: name,
        trajectory: null,
        status: TRAJECTORY_SELECTION_STATUS.MISSING,
        isDefault: false,
      },
      ...data,
    ];
    setData(sortKeepLastName(newData, AREA_OTHERS));
    setData(newData);
    const readOnlyIndex = newData.findIndex((line) => line.hypothesis === readOnlyArea);
    setReadOnly({ [`${readOnlyIndex}`]: true });
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
      getLoadHypothesisTableHeaders(
        t,
        handleFetchTrajectoriesFS,
        handleTrajectorySearch,
        handleViewTrajectory,
        errorInfo,
        setErrorInfo,
        studyState?.studyStatus,
      ),
    [data, studyState?.studyStatus, errorInfo],
  );

  return (
    <div className="flex h-fit w-full flex-col gap-4">
      <RdsHeading title={t('studyDetails.@hypothesis')} size={'m'} />
      <div className="flex h-fit w-full gap-6">
        <div className="flex max-h-full min-h-fit w-28 flex-col gap-2 overflow-y-auto rounded border border-gray-400 p-2">
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
        <div className="flex h-fit w-full">
          <StdSimpleTable
            id="load-table"
            data={data}
            columns={columns}
            enableColumnResizing={false}
            enableReadOnly={true}
            state={{ readOnly }}
            updateData={(rowIndex: number, value: unknown, status?: RowStatus) => {
              void handleTrajectoryUpdate(rowIndex, value as number, status);
            }}
            removeRow={(rowIndex: number, value: unknown) => {
              void removeRow(rowIndex, value as string);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default LoadTab;
