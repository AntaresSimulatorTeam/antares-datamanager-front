/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import StdSimpleTable from '@common/data/stdSimpleTable/StdSimpleTable.tsx';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  DbTrajectory,
  ErrorMessageType,
  HypothesisRowData,
  LocationState,
  RowStatus,
  SelectOption,
  TabProps,
} from '@/shared/types';
import { TRAJECTORY_SELECTION_STATUS, TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { useTranslation } from 'react-i18next';
import { useStudy, useStudyDispatch } from '@/store/contexts/StudyContext.tsx';
import { useLocation } from 'react-router-dom';
import {
  fetchTrajectoriesFromDB,
  getDefaultLoadHypothesis,
  linkTrajectoryToStudy,
  unlinkTrajectoryFromStudy,
} from '@/shared/services/trajectoryService.ts';
import { convertToSelectionOptionType } from '@/shared/utils/formFormatter.ts';
import SearchBar from '@/pages/pegase/home/components/SearchBar.tsx';
import { RdsCheckbox, RdsCheckboxGroupWrapper, RdsDivider } from 'rte-design-system-react';
import { getStudyTrajectories } from '@/shared/services/studyService.ts';
import { STUDY_ACTION } from '@/shared/enum/study.ts';
import { ReadOnlyObject } from '@common/data/stdTable/types/readOnly.type';
import getLoadHypothesisTableHeaders from '@/components/header/LoadHypothesisTableHeader.tsx';
import { sortKeepLastName } from '@/shared/utils/sortUtils.tsx';
import {
  buildEmptyRowData,
  buildRowData,
  removeDuplicate,
  retrieveReadOnlyArea,
} from '@/shared/utils/trajectoryUtils.ts';
import { AREA_OTHERS } from '@/shared/const/studyConfig.ts';

export type CheckBoxData = {
  name: string;
  isDefault: boolean;
};

const LoadTab = ({ setErrorMessage }: TabProps) => {
  const { t } = useTranslation();
  const studyState = useStudy();
  const location = useLocation();
  const study = (location.state as LocationState)?.study;
  const dispatch = useStudyDispatch();
  const [readOnly, setReadOnly] = useState<ReadOnlyObject>({});
  const [readOnlyAreas, setReadOnlyAreas] = useState<string[]>([]);
  const [data, setData] = useState<HypothesisRowData[]>([]);
  const [errorInfo, setErrorInfo] = useState<ErrorMessageType>({ index: 0, message: '' });
  const [areasOptions, setAreasOptions] = useState<CheckBoxData[]>([]);
  const [areasDefaultOptions, setAreasDefaultOptions] = useState<CheckBoxData[]>([]);
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
            ? studyState?.[`${TRAJECTORY_TYPE.AREA}`]?.[0]?.id
            : null;

        let newArea: CheckBoxData[];
        const defaultAreaListNotIncludedInList: string[] = [];
        if (trajectoryAreaId != null) {
          // const trajectoryAreas = (await getTrajectoryDataByTypeAndId(
          //   TRAJECTORY_TYPE.AREA,
          //   trajectoryAreaId,
          // )) as unknown as TrajectoryAreaData[];
          const trajectoryAreas = [
            {
              areaName: 'AT',
              powerToGas: 'true',
              shortTermStorage: 'true',
            },
            {
              areaName: 'BE',
              powerToGas: 'true',
              shortTermStorage: 'true',
            },
            {
              areaName: 'CH',
              powerToGas: 'true',
              shortTermStorage: 'true',
            },
            {
              areaName: 'CZ',
              powerToGas: 'true',
              shortTermStorage: 'true',
            },
            {
              areaName: 'DE',
              powerToGas: 'true',
              shortTermStorage: 'true',
            },
            {
              areaName: 'DEkf',
              powerToGas: 'true',
              shortTermStorage: 'true',
            },
            {
              areaName: 'DKe',
              powerToGas: 'true',
              shortTermStorage: 'true',
            },
            {
              areaName: 'DKw',
              powerToGas: 'true',
              shortTermStorage: 'true',
            },
            {
              areaName: 'DKkf',
              powerToGas: 'true',
              shortTermStorage: 'true',
            },
            {
              areaName: 'ES',
              powerToGas: 'true',
              shortTermStorage: 'true',
            },
            {
              areaName: 'FR',
              powerToGas: 'true',
              shortTermStorage: 'true',
            },
            {
              areaName: 'IE',
              powerToGas: 'false',
              shortTermStorage: 'true',
            },
            {
              areaName: 'ITca',
              powerToGas: 'true',
              shortTermStorage: 'true',
            },
            {
              areaName: 'ITcn',
              powerToGas: 'true',
              shortTermStorage: 'true',
            },
            {
              areaName: 'ITcs',
              powerToGas: 'true',
              shortTermStorage: 'false',
            },
            {
              areaName: 'ITn',
              powerToGas: 'true',
              shortTermStorage: 'true',
            },
            {
              areaName: 'ITs',
              powerToGas: 'true',
              shortTermStorage: 'true',
            },
            {
              areaName: 'ITsar',
              powerToGas: 'true',
              shortTermStorage: 'true',
            },
            {
              areaName: 'ITsic',
              powerToGas: 'true',
              shortTermStorage: 'true',
            },
            {
              areaName: 'LU',
              powerToGas: 'true',
              shortTermStorage: 'true',
            },
            {
              areaName: 'NL',
              powerToGas: 'true',
              shortTermStorage: 'false',
            },
            {
              areaName: 'NOm',
              powerToGas: 'true',
              shortTermStorage: 'false',
            },
            {
              areaName: 'NOn',
              powerToGas: 'true',
              shortTermStorage: 'true',
            },
            {
              areaName: 'NOs',
              powerToGas: 'true',
              shortTermStorage: 'true',
            },
            {
              areaName: 'PL',
              powerToGas: 'true',
              shortTermStorage: 'true',
            },
            {
              areaName: 'PT',
              powerToGas: 'true',
              shortTermStorage: 'true',
            },
            {
              areaName: 'SE1',
              powerToGas: 'true',
              shortTermStorage: 'true',
            },
            {
              areaName: 'SE2',
              powerToGas: 'true',
              shortTermStorage: 'false',
            },
            {
              areaName: 'SE3',
              powerToGas: 'false',
              shortTermStorage: 'true',
            },
            {
              areaName: 'SE4',
              powerToGas: 'true',
              shortTermStorage: 'true',
            },
            {
              areaName: 'UKgb',
              powerToGas: 'true',
              shortTermStorage: 'false',
            },
            {
              areaName: 'UKni',
              powerToGas: 'true',
              shortTermStorage: 'true',
            },
          ];

          // Build dropdown list options
          if (trajectoryAreas.length > 0) {
            newArea = trajectoryAreas
              .map((trajectoryArea) => {
                if (!areaDefault?.some((item) => item.name === trajectoryArea.areaName)) {
                  return { name: trajectoryArea.areaName, isDefault: false };
                }
              })
              .filter(Boolean) as CheckBoxData[];
            setAreasDefaultOptions(areaDefault);
            setAreasOptions(areaDefault?.concat(newArea));

            // Find default area not included in areas trajectory list
            areaDefault.forEach((defaultArea) => {
              if (!trajectoryAreas.some((trajectoryArea) => trajectoryArea.areaName === defaultArea.name)) {
                defaultAreaListNotIncludedInList.push(defaultArea.name);
              }
            });
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
        const areaDataDefault: HypothesisRowData[] = areaDefault?.map((area) => {
          const trajectoryArea = trajectoryLinked?.find((trajectory) => trajectory.loadArea === area.name);
          return buildRowData(area.name, true, trajectoryArea);
        });

        const emptyAreaSelected = (studyState[TRAJECTORY_TYPE.LOAD] as DbTrajectory[]) ?? [];
        const emptyArea = removeDuplicate(trajectoryLinked.concat(emptyAreaSelected));
        const areaData = emptyArea
          .map((trajectory: DbTrajectory) => {
            if (!areaDefault.some((item: CheckBoxData) => item.name === trajectory.loadArea)) {
              return buildRowData(trajectory.loadArea as string, false, trajectory);
            }
          })
          .filter(Boolean) as HypothesisRowData[];

        const dataTrajectories =
          areaData.length > 0 ? sortKeepLastName(areaDataDefault.concat(areaData), AREA_OTHERS) : areaDataDefault;
        setData(dataTrajectories);
        if (defaultAreaListNotIncludedInList.length > 0) {
          const readOnlyRows = retrieveReadOnlyArea(dataTrajectories, defaultAreaListNotIncludedInList);
          setReadOnly(readOnlyRows);
          setReadOnlyAreas(defaultAreaListNotIncludedInList);
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

    setErrorMessage('');
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
        dispatch?.({
          type: STUDY_ACTION.ADD_TRAJECTORY_LOAD,
          payload: newTrajectory,
        });
        setData((prev) => {
          if (newTrajectory) {
            prev[rowIndex].trajectory = newTrajectory;
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
    const newDataSorted = data.filter((_row: HypothesisRowData, index: number) => index !== indexRow);
    setData(newDataSorted);
    if (readOnlyAreas.length > 0) {
      const readOnlyRows = retrieveReadOnlyArea(newDataSorted, readOnlyAreas);
      setReadOnly(readOnlyRows);
    }
    if (value) {
      setCheckedValues((prev) => [...prev.filter((name) => name !== value)]);
    }
  };

  const addRow = (name: string) => {
    dispatch?.({
      type: STUDY_ACTION.ADD_TRAJECTORY_LOAD,
      payload: buildEmptyRowData(name),
    });
    const newDataSorted = sortKeepLastName(
      [
        {
          hypothesis: name,
          trajectory: null,
          status: TRAJECTORY_SELECTION_STATUS.MISSING,
          isDefault: false,
        },
        ...data,
      ],
      AREA_OTHERS,
    );

    setData(newDataSorted);
    if (readOnlyAreas.length > 0) {
      const readOnlyRows = retrieveReadOnlyArea(newDataSorted, readOnlyAreas);
      setReadOnly(readOnlyRows);
    }
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
    <div className="flex h-full w-full flex-col gap-4">
      <div className="flex h-full w-full gap-6">
        <div className="flex h-fit w-28 flex-col gap-1 rounded border border-gray-400 p-2">
          <div className="border-b border-gray-400 pb-2">
            <SearchBar onSearch={() => {}} placeholder={t('studyDetails.@search_area')} />
          </div>
          <RdsCheckboxGroupWrapper
            label={''}
            name={''}
            onChange={(value: string, status?: boolean) => void handleSelectionChange(value, status)}
            checkedValues={checkedValues}
          >
            {areasOptions?.map((area, index) => (
              <div key={`${index}-${area.name}`} className="my-1">
                <RdsCheckbox
                  key={`load-checkbox-${area.name}`}
                  label={area.name}
                  value={area.name}
                  name={''}
                  defaultChecked={area.isDefault}
                  disabled={area.isDefault}
                  checked={area.isDefault}
                />
                {index === Math.max(areasDefaultOptions?.length - 2, 0) && <RdsDivider extraClasses="mt-1" />}
              </div>
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
