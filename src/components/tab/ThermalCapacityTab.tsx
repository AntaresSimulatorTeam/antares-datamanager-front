/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import SearchBar from '@/pages/pegase/home/components/SearchBar.tsx';
import { FileInputStatus, RdsDivider } from 'rte-design-system-react';
import { HypothesisRowData, NestedCheckedType, TrajectoryAreaData } from '@/shared/types';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { CheckBoxData } from '@/components/tab/LoadTab.tsx';
import { TRAJECTORY_SELECTION_STATUS } from '@/shared/enum/trajectory.ts';
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
import { StudyStatus } from '@/shared/types/common/StudyStatus.type.ts';
import { sortKeepLastName } from '@/shared/utils/sortUtils.tsx';
import { OTHER_AREAS_LABEL } from '@/shared/const/studyConfig.ts';
import { PegaseHypothesisTable } from '@common/layout/PegaseHypothesisTable/PegaseHypothesisTable.tsx';
import getExpandableHypothesisTableHeaders from '@/components/header/ExpandableHypothesisTableHeaders.tsx';

interface ThermalTabProps {
  defaultAreas: CheckBoxData[];
  areas: TrajectoryAreaData[];
}

const ThermalCapacityTab = ({ defaultAreas, areas }: ThermalTabProps) => {
  const { t } = useTranslation();
  const studyState = useStudy();
  const [checkedValues, setCheckedValues] = useState<NestedCheckedType[]>([]);
  const [defaultData, setDefaultData] = useState<HypothesisRowData[]>([]);
  const [areasOptions, setAreasOptions] = useState<CheckBoxData[]>([]);
  const [data, setData] = useState<HypothesisRowData[]>([
    {
      hypothesis: OTHER_AREAS_LABEL,
      trajectory: null,
      status: TRAJECTORY_SELECTION_STATUS.MISSING,
      isDefault: true,
      subRows: null,
    },
  ]);
  const [progress] = useState(0);
  const [fileStatus] = useState<FileInputStatus>('empty');
  const [rowIndexSelected] = useState(0);
  const [readOnly, setReadOnly] = useState<ReadOnlyObject>({});

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
        setCheckedValues(
          defaultAreas.map((item) => ({
            name: item.name,
            subOptions: ThermalOptions,
          })),
        );
        // Hypothesis table => set data
        const areaDefaultData = buildRowWithSubRowsData(defaultAreas);
        setDefaultData(areaDefaultData);
        // Hypothesis table => set read only
        // Find default area not included in areas trajectory list
        const defaultAreaListNotIncludedInList: string[] = [];
        defaultAreas.forEach((defaultArea) => {
          if (!areas.some((trajectoryArea) => trajectoryArea.areaName === defaultArea.name)) {
            defaultAreaListNotIncludedInList.push(defaultArea.name);
          }
        });
        setReadOnly(retrieveReadOnlyArea(areaDefaultData, defaultAreaListNotIncludedInList));

        // Handle areas from trajectory AREA
        // Build checkbox list options
        let newArea: CheckBoxData[] = [];
        newArea = areas
          .map((trajectoryArea) => {
            if (!defaultAreas?.some((item) => item.name === trajectoryArea.areaName)) {
              return { name: trajectoryArea.areaName, isDefault: false };
            }
          })
          .filter(Boolean) as CheckBoxData[];
        setAreasOptions(newArea.length > 0 ? defaultAreas?.concat(newArea) : defaultAreas);
      } catch {
        // Silent handler
      }
    };
    void fetchHypothesis();
  }, []);

  const addRow = (value: string, isParentChecked: boolean, parentValue?: string) => {
    let dataToAdd: HypothesisRowData[] = [];
    const newRow: HypothesisRowData = {
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
    const newDataSorted = sortKeepLastName(dataToAdd, OTHER_AREAS_LABEL);
    setData(newDataSorted);
  };

  const removeRow = (value: string, rowIndex?: number) => {
    const parentValue = rowIndex && data[rowIndex]?.hypothesis == value ? data[rowIndex].hypothesis : undefined;
    let dataToRemove: HypothesisRowData[] = [];
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
      removeRow(value);
    }
  };

  return (
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
            {index === Math.max(defaultAreas?.length - 1, 0) && <RdsDivider extraClasses="mt-1" />}
          </div>
        ))}
      </div>
      <div className="flex w-full flex-col gap-6">
        {defaultAreas.length > 0 && (
          <PegaseHypothesisTable
            id="default-thermal-table"
            data={defaultData}
            getTableHeaders={getExpandableHypothesisTableHeaders}
            fileStatus={fileStatus}
            studyState={studyState?.studyStatus ?? StudyStatus.IN_PROGRESS}
            readOnly={readOnly}
            progress={progress}
            indexSelected={rowIndexSelected}
            handleSearch={handleTrajectorySearch}
            handleImport={handleFetchTrajectoriesFS}
            isReadOnlyEnable={true}
          />
        )}
        <PegaseHypothesisTable
          id="main-thermal-table"
          data={data}
          getTableHeaders={getExpandableHypothesisTableHeaders}
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
  );
};

export default ThermalCapacityTab;
