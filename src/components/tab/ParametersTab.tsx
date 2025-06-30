import SearchBar from '@/pages/pegase/home/components/SearchBar.tsx';
import { FileInputStatus, RdsDivider } from 'rte-design-system-react';
import { useTranslation } from 'react-i18next';
import { CheckBoxData } from '@/components/tab/LoadTab.tsx';
import { useEffect, useState } from 'react';
import { OTHER_AREAS, OTHER_AREAS_LABEL } from '@/shared/const/studyConfig.ts';
import { HypothesisRowData, TrajectoryAreaData } from '@/shared/types';
import { TRAJECTORY_SELECTION_STATUS } from '@/shared/enum/trajectory.ts';
import { buildRowData, retrieveReadOnlyArea } from '@/shared/utils/trajectoryUtils.ts';
import getEditableHypothesisTableHeaders from '@/components/header/EditableHypothesisTableHeaders.tsx';
import { StudyStatus } from '@/shared/types/common/StudyStatus.type.ts';
import { PegaseHypothesisTable } from '@common/layout/PegaseHypothesisTable/PegaseHypothesisTable.tsx';
import { ReadOnlyObject } from '@common/data/stdTable/types/readOnly.type';
import { useStudy } from '@/store/contexts/StudyContext.tsx';
import StdCheckboxGroupWrapper from '@common/forms/stdCheckboxGroup/StdCheckboxGroupWrapper.tsx';
import StdCheckbox from '@common/forms/stdCheckbox/StdCheckbox.tsx';
import { sortDefaultFirstPosition } from '@/shared/utils/sortUtils.tsx';

interface ParametersTabProps {
  defaultAreas: CheckBoxData[];
  areas: TrajectoryAreaData[];
}

export const ParametersTab = ({ defaultAreas, areas }: ParametersTabProps) => {
  const { t } = useTranslation();
  const studyState = useStudy();
  const [areaDefault, setAreaDefault] = useState<CheckBoxData[]>([...defaultAreas]);
  const [checkedValues, setCheckedValues] = useState<string[]>(areaDefault.map((area) => area.name));
  const [defaultData, setDefaultData] = useState<HypothesisRowData[]>([]);
  const data: HypothesisRowData[] = [
    {
      hypothesis: t('thermal.@costs'),
      trajectory: null,
      status: TRAJECTORY_SELECTION_STATUS.MISSING,
      isDefault: true,
    },
    {
      hypothesis: t('thermal.@economics'),
      trajectory: null,
      status: TRAJECTORY_SELECTION_STATUS.MISSING,
      isDefault: true,
    },
  ];
  const [progress] = useState(0);
  const [fileStatus] = useState<FileInputStatus>('empty');
  const [rowIndexSelected] = useState(0);
  const [readOnly, setReadOnly] = useState<ReadOnlyObject>({});
  const [readOnlyAreas, setReadOnlyAreas] = useState<string[]>([]);

  useEffect(() => {
    let newArea: CheckBoxData[] = [];
    newArea = areas
      .map((trajectoryArea) => {
        if (!defaultAreas?.some((item) => item.name === trajectoryArea.areaName)) {
          return { name: trajectoryArea.areaName, isDefault: false };
        }
      })
      .filter(Boolean) as CheckBoxData[];
    setAreaDefault((prev) => (newArea.length > 0 ? [...prev, ...newArea] : prev));

    // Find default area not included in areas trajectory list
    const defaultAreaListNotIncludedInList: string[] = [];
    defaultAreas.forEach((defaultArea) => {
      if (!areas.some((trajectoryArea) => trajectoryArea.areaName === defaultArea.name)) {
        defaultAreaListNotIncludedInList.push(defaultArea.name);
      }
    });
    const areaDefaultData = [
      ...defaultAreas,
      {
        name: OTHER_AREAS,
        isDefault: true,
      },
    ].map((area) => buildRowData(area.name, area.isDefault));
    setDefaultData(areaDefaultData);

    setReadOnly(retrieveReadOnlyArea(areaDefaultData, defaultAreaListNotIncludedInList));
    setReadOnlyAreas(defaultAreaListNotIncludedInList);
  }, [areas, defaultAreas]);

  const addRow = (value: string) => {
    const newRow: HypothesisRowData = {
      hypothesis: value,
      trajectory: null,
      status: TRAJECTORY_SELECTION_STATUS.MISSING,
      isDefault: false,
    };
    setCheckedValues((prev) => [...prev, value]);
    const newDataSorted = sortDefaultFirstPosition([...defaultData, newRow], OTHER_AREAS_LABEL);
    setDefaultData(newDataSorted);
    if (readOnlyAreas.length > 0) {
      const readOnlyRows = retrieveReadOnlyArea(newDataSorted, readOnlyAreas);
      setReadOnly(readOnlyRows);
    }
  };

  const removeRow = (value: string) => {
    setCheckedValues((prev) => [...prev.filter((checkedValue) => checkedValue !== value)]);
    setDefaultData((prev) => [...prev.filter((itemData) => itemData.hypothesis !== value)]);
  };

  const handleSelectionChange = (value: string, isChecked: boolean) => {
    if (isChecked) {
      addRow(value);
    } else {
      removeRow(value);
    }
  };

  const handleTrajectorySearch = async () => Promise.resolve([]);
  const handleFetchTrajectoriesFS = async (index: number) => {
    console.log('=== index', index);
    return Promise.resolve();
  };

  return (
    <div className="flex h-full w-full gap-6">
      <div className="flex h-fit w-28 flex-col rounded border border-gray-400 p-2">
        <div className="border-b border-gray-400 pb-2">
          <SearchBar onSearch={() => {}} placeholder={t('studyDetails.@search_area')} />
        </div>
        <StdCheckboxGroupWrapper
          label={''}
          name={''}
          checkedValues={checkedValues}
          disabled={false}
          onChange={(value: string, isChecked?: boolean) => handleSelectionChange(value, isChecked ?? false)}
        >
          {areaDefault?.map((area, index) => (
            <div key={`${index}-${area.name}`} className="my-1">
              <StdCheckbox
                key={`parameter-checkbox-${area.name}`}
                label={area.name}
                value={area.name}
                name={''}
                defaultChecked={area.isDefault}
                disabled={area.isDefault}
                checked={area.isDefault}
              />
              {index === Math.max(defaultAreas?.length - 1, 0) && <RdsDivider extraClasses="mt-1" />}
            </div>
          ))}
        </StdCheckboxGroupWrapper>
      </div>
      <div className="flex w-full flex-col gap-6">
        {areaDefault.length > 0 && (
          <PegaseHypothesisTable
            id="default-parameters-table"
            data={defaultData}
            getTableHeaders={getEditableHypothesisTableHeaders}
            columnHeader={t('thermal.@parametersTechnical')}
            fileStatus={fileStatus}
            studyState={studyState?.studyStatus ?? StudyStatus.IN_PROGRESS}
            readOnly={readOnly}
            progress={progress}
            indexSelected={rowIndexSelected}
            handleSearch={handleTrajectorySearch}
            handleImport={handleFetchTrajectoriesFS}
            isReadOnlyEnable={true}
            removeRow={removeRow}
          />
        )}
        <div className="flex h-fit w-full">
          <PegaseHypothesisTable
            id="default-parameters-table"
            data={data}
            getTableHeaders={getEditableHypothesisTableHeaders}
            columnHeader={t('thermal.@parametersEconomic')}
            fileStatus={fileStatus}
            studyState={studyState?.studyStatus ?? StudyStatus.IN_PROGRESS}
            progress={progress}
            indexSelected={rowIndexSelected}
            handleSearch={handleTrajectorySearch}
            handleImport={handleFetchTrajectoriesFS}
          />
        </div>
      </div>
    </div>
  );
};
