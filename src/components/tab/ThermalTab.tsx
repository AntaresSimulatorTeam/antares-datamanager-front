/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import SearchBar from '@/pages/pegase/home/components/SearchBar.tsx';
import { FileInputStatus, RdsDivider } from 'rte-design-system-react';
import { HypothesisRowDataWithNestedRow, LocationStudy, NestedCheckedType } from '@/shared/types';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { CheckBoxData } from '@/components/tab/LoadTab.tsx';
import StdTabs from '@common/layout/stdTabs/StdTabs.tsx';
import StdTabItem from '@common/layout/stdTabs/StdTabItem.tsx';
import { TRAJECTORY_SELECTION_STATUS, TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { useStudy } from '@/store/contexts/StudyContext.tsx';
import { CheckboxWithNestedCheckbox } from '@/components/forms/CheckboxWithNestedCheckbox.tsx';
import { ThermalOptions } from '@/mocks/data/list/names';
import { ReadOnlyObject } from '@common/data/stdTable/types/readOnly.type';
import {
  addNestedRow,
  buildRowWithSubRowsData,
  checkNestedValue,
  removeThermalRow,
  retrieveReadOnlyArea,
  unCheckNestedValue,
} from '@/shared/utils/trajectoryUtils.ts';
import { PegaseHypothesisTable } from '@common/layout/PegaseHypothesisTable/PegaseHypothesisTable.tsx';
import { StudyStatus } from '@/shared/types/common/StudyStatus.type.ts';
import { sortKeepLastName } from '@/shared/utils/sortUtils.tsx';
import { AREA_OTHERS } from '@/shared/const/studyConfig.ts';
import { useFetchAreas } from '@/hooks/useFetchAreas.ts';
import { useLocation } from 'react-router-dom';

const ThermalTab = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const study = (location.state as LocationStudy)?.study;
  const studyState = useStudy();
  const [checkedValues, setCheckedValues] = useState<NestedCheckedType[]>([]);
  const [areasDefaultOptions, setAreasDefaultOptions] = useState<CheckBoxData[]>([]);
  const [defaultData, setDefaultData] = useState<HypothesisRowDataWithNestedRow[]>([]);
  const [areasOptions, setAreasOptions] = useState<CheckBoxData[]>([]);
  const [data, setData] = useState<HypothesisRowDataWithNestedRow[]>([
    {
      hypothesis: 'Other areas',
      trajectory: null,
      status: TRAJECTORY_SELECTION_STATUS.MISSING,
      isDefault: true,
      subRows: null,
    },
  ]);
  const [usedBy, setUsing] = useState<TRAJECTORY_TYPE>(TRAJECTORY_TYPE.THERMAL_CAPACITY);
  const [progress] = useState(0);
  const [fileStatus] = useState<FileInputStatus>('empty');
  const [rowIndexSelected] = useState(0);
  const [readOnly, setReadOnly] = useState<ReadOnlyObject>({});
  const { areaDefault, trajectoryAreas } = useFetchAreas(study?.id);

  const handleFetchTrajectoriesFS = async () => Promise.resolve();
  const handleTrajectorySearch = (value?: string, area?: string) => {
    console.log('================= area', area, value);
    return Promise.resolve([]);
  };

  useEffect(() => {
    const fetchHypothesis = () => {
      try {
        // Handle default areas (checkbox list and hypothesis table)
        // Checkbox list
        setAreasDefaultOptions(areaDefault);
        setCheckedValues(
          areaDefault.map((item) => ({
            name: item.name,
            subOptions: ThermalOptions,
          })),
        );
        // Hypothesis table => set data
        const areaDefaultData = buildRowWithSubRowsData(areaDefault);
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

        // Handle areas from trajectory AREA
        // Build checkbox list options
        let newArea: CheckBoxData[] = [];
        newArea = trajectoryAreas
          .map((trajectoryArea) => {
            if (!areaDefault?.some((item) => item.name === trajectoryArea.areaName)) {
              return { name: trajectoryArea.areaName, isDefault: false };
            }
          })
          .filter(Boolean) as CheckBoxData[];
        setAreasOptions(newArea.length > 0 ? areaDefault?.concat(newArea) : areaDefault);
      } catch {
        // Silent handler
      }
    };
    if (areaDefault.length > 0 && trajectoryAreas.length > 0) {
      void fetchHypothesis();
    }
  }, [areaDefault, trajectoryAreas]);

  const addRow = (value: string, isParentChecked: boolean, parentValue?: string) => {
    let dataToAdd: HypothesisRowDataWithNestedRow[] = [];
    const newRow: HypothesisRowDataWithNestedRow = {
      hypothesis: value,
      trajectory: null,
      status: TRAJECTORY_SELECTION_STATUS.MISSING,
      isDefault: false,
      subRows: null,
    };
    // Add child to the checked parent
    if (parentValue && isParentChecked) {
      dataToAdd = addNestedRow(data, newRow, parentValue);
      setCheckedValues((prev) => (prev.length > 0 ? checkNestedValue(prev, value, parentValue) : prev));
    } else if (parentValue && !isParentChecked) {
      // Add Row for parent and row for child
      dataToAdd = [
        {
          ...newRow,
          hypothesis: parentValue,
          subRows: [newRow],
        },
        ...data,
      ];
      // Checked technology and area
      setCheckedValues((prev) => [
        ...prev,
        {
          name: parentValue,
          subOptions: [value].sort((a, b) => a.localeCompare(b)),
        },
      ]);
    } else {
      dataToAdd = [newRow, ...data];
      // Checked only area
      setCheckedValues((prev) => [
        ...prev,
        {
          name: value,
          subOptions: null,
        },
      ]);
    }
    const newDataSorted = sortKeepLastName(dataToAdd, AREA_OTHERS);
    setData(newDataSorted as HypothesisRowDataWithNestedRow[]);
  };

  const removeRow = (value: string, parentValue?: string) => {
    let dataToRemove: HypothesisRowDataWithNestedRow[] = [];
    if (parentValue) {
      dataToRemove = removeThermalRow(data, value, parentValue);
      setCheckedValues((prev) => (prev.length > 0 ? unCheckNestedValue(prev, value, parentValue) : prev));
    } else {
      dataToRemove = data.filter((item) => item.hypothesis !== value);
      setCheckedValues((prev) => [...prev.filter((checkedValue) => checkedValue.name !== value)]);
    }
    setData(dataToRemove);
  };

  const handleSelectionChange = (value: string, isChecked: boolean, parentValue?: string) => {
    if (isChecked) {
      const isParentChecked =
        parentValue && checkedValues ? checkedValues.some((checkedValue) => checkedValue.name === parentValue) : false;
      addRow(value, isParentChecked, parentValue);
    } else {
      removeRow(value, parentValue);
    }
  };

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
          {areasOptions?.map((area, index) => (
            <div key={`${index}-${area.name}`}>
              <CheckboxWithNestedCheckbox
                key={`nested-checkbox-${area.name}`}
                label={area.name}
                value={area.name}
                name={''}
                defaultChecked={area.isDefault}
                disabled={area.isDefault}
                onChange={handleSelectionChange}
                onHandleSelection={handleSelectionChange}
                checkedValues={checkedValues}
                options={ThermalOptions}
              />
              {index === Math.max(areasDefaultOptions?.length - 2, 0) && <RdsDivider extraClasses="mt-1" />}
            </div>
          ))}
        </div>
        <div className="flex w-full flex-col gap-6">
          {areasDefaultOptions.length > 0 && (
            <PegaseHypothesisTable
              id="default-thermal-table"
              data={defaultData}
              fileStatus={fileStatus}
              studyState={studyState?.studyStatus ?? StudyStatus.IN_PROGRESS}
              readOnly={readOnly}
              progress={progress}
              indexSelected={rowIndexSelected}
              handleSearch={handleTrajectorySearch}
              handleImport={handleFetchTrajectoriesFS}
            />
          )}
          <PegaseHypothesisTable
            id="main-thermal-table"
            data={data}
            fileStatus={fileStatus}
            studyState={studyState?.studyStatus ?? StudyStatus.IN_PROGRESS}
            readOnly={readOnly}
            progress={progress}
            indexSelected={rowIndexSelected}
            handleSearch={handleTrajectorySearch}
            handleImport={handleFetchTrajectoriesFS}
            removeRow={removeRow}
          />
        </div>
      </div>
    </div>
  );
};

export default ThermalTab;
