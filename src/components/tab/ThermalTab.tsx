/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import SearchBar from '@/pages/pegase/home/components/SearchBar.tsx';
import { FileInputStatus, RdsDivider } from 'rte-design-system-react';
import StdSimpleTable from '@common/data/stdSimpleTable/StdSimpleTable.tsx';
import { ErrorMessageType, HypothesisRowData, TrajectoryAreaData } from '@/shared/types';
import { useTranslation } from 'react-i18next';
import { useEffect, useMemo, useState } from 'react';
import { CheckBoxData } from '@/components/tab/LoadTab.tsx';
import StdTabs from '@common/layout/stdTabs/StdTabs.tsx';
import StdTabItem from '@common/layout/stdTabs/StdTabItem.tsx';
import { getDefaultLoadHypothesis, getTrajectoryDataByTypeAndId } from '@/shared/services/trajectoryService.ts';
import { TRAJECTORY_SELECTION_STATUS, TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import getNestedHypothesisTableHeaders from '@/components/header/NestedHypothesisTableHeaders.tsx';
import { useStudy } from '@/store/contexts/StudyContext.tsx';
import StdCheckboxGroupWrapper from '@common/forms/stdCheckboxGroup/StdCheckboxGroupWrapper.tsx';
import CheckboxWithNestedCheckbox from '@/components/forms/CheckboxWithNestedCheckbox.tsx';
import { ThermalOptions } from '@/mocks/data/list/names';
import { ReadOnlyObject } from '@common/data/stdTable/types/readOnly.type';
import { retrieveReadOnlyArea } from '@/shared/utils/trajectoryUtils.ts';

const ThermalTab = () => {
  const { t } = useTranslation();
  const studyState = useStudy();
  const [checkedValues, setCheckedValues] = useState<string[]>([]);
  const [areasOptions, setAreasOptions] = useState<CheckBoxData[]>([]);
  const [areasDefaultOptions, setAreasDefaultOptions] = useState<CheckBoxData[]>([]);
  const [defaultData, setDefaultData] = useState<HypothesisRowData[]>([]);
  const [data] = useState<HypothesisRowData[]>([
    {
      hypothesis: 'Other areas',
      trajectory: null,
      status: TRAJECTORY_SELECTION_STATUS.MISSING,
      isDefault: true,
    },
  ]);
  const [usedBy, setUsing] = useState<TRAJECTORY_TYPE>(TRAJECTORY_TYPE.THERMAL_CAPACITY);
  const [progress] = useState(0);
  const [fileStatus] = useState<FileInputStatus>('empty');
  const [errorInfo, setErrorInfo] = useState<ErrorMessageType>({ index: 0, message: '' });
  const [rowIndexSelected] = useState(0);
  const [readOnly, setReadOnly] = useState<ReadOnlyObject>({});

  const handleFetchTrajectoriesFS = async () => Promise.resolve();
  const handleTrajectorySearch = (value?: string, area?: string) => {
    console.log('================= area', area, value);
    return Promise.resolve([]);
  };

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

        if (trajectoryAreaId != null) {
          const trajectoryAreas = (await getTrajectoryDataByTypeAndId(
            TRAJECTORY_TYPE.AREA,
            trajectoryAreaId,
          )) as unknown as TrajectoryAreaData[];

          // Handle default areas (checkbox list and hypothesis table)
          if (areaDefault.length > 0) {
            // Checkbox list
            setAreasDefaultOptions(areaDefault);
            setCheckedValues(areaDefault.map((item) => item.name));
            // Hypothesis table => set data
            const areaDefaultData = areaDefault.map((area) => ({
              hypothesis: area.name,
              trajectory: null,
              status: TRAJECTORY_SELECTION_STATUS.MISSING,
              isDefault: true,
            }));
            setDefaultData(areaDefaultData);
            // Hypothesis table => set read only
            // Find default area not included in areas trajectory list
            const defaultAreaListNotIncludedInList: string[] = [];
            areaDefault.forEach((defaultArea) => {
              if (!trajectoryAreas.some((trajectoryArea) => trajectoryArea.areaName === defaultArea.name)) {
                defaultAreaListNotIncludedInList.push(defaultArea.name);
              }
            });
            setReadOnly(retrieveReadOnlyArea(areaDefaultData, defaultAreaListNotIncludedInList));
          }
          // Handle areas from trajectory AREA
          // Build checkbox list options
          if (trajectoryAreas.length > 0) {
            let newArea: CheckBoxData[] = [];
            newArea = trajectoryAreas
              .map((trajectoryArea) => {
                if (!areaDefault?.some((item) => item.name === trajectoryArea.areaName)) {
                  return { name: trajectoryArea.areaName, isDefault: false };
                }
              })
              .filter(Boolean) as CheckBoxData[];
            setAreasDefaultOptions(areaDefault);
            setAreasOptions(areaDefault?.concat(newArea));
          } else {
            setAreasOptions(areaDefault);
          }
        }
      } catch {
        // Silent handler
      }
    };
    void fetchHypothesis();
  }, []);

  const defaultColumns = useMemo(
    () =>
      getNestedHypothesisTableHeaders(
        t,
        handleFetchTrajectoriesFS,
        handleTrajectorySearch,
        errorInfo,
        setErrorInfo,
        studyState?.studyStatus,
        progress,
        fileStatus,
        rowIndexSelected,
      ),
    [defaultData],
  );

  const columns = useMemo(
    () =>
      getNestedHypothesisTableHeaders(
        t,
        handleFetchTrajectoriesFS,
        handleTrajectorySearch,
        errorInfo,
        setErrorInfo,
        studyState?.studyStatus,
        progress,
        fileStatus,
        rowIndexSelected,
      ),
    [data],
  );

  return (
    <div className="flex h-full w-full flex-col gap-4">
      <StdTabs
        renderPrimary={(item) => (
          <StdTabItem
            key={item.name}
            active={usedBy === item.name}
            onClick={(selected) => setUsing(selected as TRAJECTORY_TYPE)}
            name={item.name}
            label={item.label}
          />
        )}
        items={[
          { name: TRAJECTORY_TYPE.THERMAL_CAPACITY, label: t('thermal.@installedPower') },
          { name: TRAJECTORY_TYPE.THERMAL_PARAMETER, label: t('thermal.@parameters') },
        ]}
      />
      <div className="flex h-full w-full gap-6">
        <div className="flex h-fit w-28 flex-col gap-1 rounded border border-gray-400 p-2">
          <div className="border-b border-gray-400 pb-2">
            <SearchBar onSearch={() => {}} placeholder={t('studyDetails.@search_area')} />
          </div>
          <StdCheckboxGroupWrapper
            label={''}
            name={''}
            onChange={(value: string) => setCheckedValues((prev) => [...prev, value])}
            checkedValues={checkedValues}
          >
            {areasOptions?.map((area, index) => (
              <div key={`${index}-${area.name}`} className="my-1">
                <CheckboxWithNestedCheckbox
                  key={`nested-checkbox-${area.name}`}
                  label={area.name}
                  value={area.name}
                  name={''}
                  defaultChecked={area.isDefault}
                  disabled={area.isDefault}
                  handleSelection={async () => Promise.resolve()}
                  options={ThermalOptions}
                />
                {index === Math.max(areasDefaultOptions?.length - 2, 0) && <RdsDivider extraClasses="mt-1" />}
              </div>
            ))}
          </StdCheckboxGroupWrapper>
        </div>
        <div className="flex w-full flex-col gap-6">
          {areasDefaultOptions.length > 0 && (
            <div className="flex h-fit w-full">
              <StdSimpleTable
                id="default-thermal-table"
                data={defaultData}
                columns={defaultColumns}
                enableColumnResizing={false}
                enableReadOnly={true}
                state={{ readOnly }}
              />
            </div>
          )}
          <div className="flex h-fit w-full">
            <StdSimpleTable
              id="thermal-table"
              data={data}
              columns={columns}
              enableColumnResizing={false}
              enableReadOnly={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThermalTab;
