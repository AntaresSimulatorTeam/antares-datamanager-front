import SearchBar from '@/pages/pegase/home/components/SearchBar.tsx';
import { FileInputStatus, RdsDivider } from 'rte-design-system-react';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { CheckBoxData, HypothesisRowData, LocationStudy, TrajectoryAreaData } from '@/shared/types';
import { TRAJECTORY_SELECTION_STATUS, TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import getEditableHypothesisTableHeaders from '@/components/header/EditableHypothesisTableHeaders.tsx';
import { StudyStatus } from '@/shared/types/common/StudyStatus.type.ts';
import { PegaseHypothesisTable } from '@common/layout/PegaseHypothesisTable/PegaseHypothesisTable.tsx';
import { ReadOnlyObject } from '@common/data/stdTable/types/readOnly.type';
import { useStudy } from '@/store/contexts/StudyContext.tsx';
import StdCheckboxGroupWrapper from '@common/forms/stdCheckboxGroup/StdCheckboxGroupWrapper.tsx';
import StdCheckbox from '@common/forms/stdCheckbox/StdCheckbox.tsx';
import { sortWithFixedPosition } from '@/shared/utils/sortUtils.ts';
import getExpandableHypothesisTableHeaders from '@/components/header/ExpandableHypothesisTableHeaders.tsx';
import { useFetchHypothesisTrajectories } from '@/hooks/useFetchHypothesisTrajectories.ts';
import { useLocation } from 'react-router-dom';
import { rowNotDefaultData } from '@/mocks/data/tests/hypothesisTable.mock.ts';

interface ParametersTabProps {
  defaultAreas: { name: string }[];
  areas: TrajectoryAreaData[];
}

export const ParametersTab = ({ defaultAreas, areas }: ParametersTabProps) => {
  const { t } = useTranslation();
  const studyState = useStudy();
  const location = useLocation();
  const study = (location.state as LocationStudy)?.study;
  const [checkedValues, setCheckedValues] = useState<string[]>([]);
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
  const [rowIndexSelected] = useState('0');
  const [readOnly, setReadOnly] = useState<ReadOnlyObject>({});
  const [areasOptions, setAreasOptions] = useState<CheckBoxData[]>([]);
  const [technicalData, setTechnicalData] = useState<HypothesisRowData[]>([]);
  const [isStudyGenerated] = useState(
    studyState.studyStatus === StudyStatus.GENERATED || study.status === StudyStatus.GENERATED,
  );
  const { hypothesisTrajectories, areasTrajectoryOptions, dropDownListOptions, readOnlyRow } =
    useFetchHypothesisTrajectories(
      study?.id,
      TRAJECTORY_TYPE.THERMAL_PARAMETER, //TODO : TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER
      defaultAreas,
      areas,
      isStudyGenerated,
    );

  useEffect(() => {
    const setHypothesis = () => {
      areasTrajectoryOptions && setAreasOptions(areasTrajectoryOptions);
      dropDownListOptions && setCheckedValues(dropDownListOptions);
      hypothesisTrajectories &&
        setTechnicalData([
          {
            hypothesis: t('thermal.@specific'),
            trajectory: null,
            status: TRAJECTORY_SELECTION_STATUS.MISSING,
            isDefault: true,
            subRows: rowNotDefaultData, // TODO : hypothesisTrajectories,
          },
          {
            hypothesis: t('thermal.@paramModulation'),
            trajectory: null,
            status: TRAJECTORY_SELECTION_STATUS.MISSING,
            isDefault: true,
          },
          {
            hypothesis: t('thermal.@common'),
            trajectory: null,
            status: TRAJECTORY_SELECTION_STATUS.MISSING,
            isDefault: true,
          },
        ]);
      setReadOnly(readOnlyRow);
    };
    setHypothesis();
  }, [areas, areasTrajectoryOptions, defaultAreas, dropDownListOptions, hypothesisTrajectories, readOnlyRow, t]);

  const addRow = (value: string) => {
    const newRow: HypothesisRowData = {
      hypothesis: value,
      trajectory: null,
      status: TRAJECTORY_SELECTION_STATUS.MISSING,
      isDefault: false,
    };
    setCheckedValues((prev) => [...prev, value]);
    const newTechnicalDataSubRow = technicalData?.[0]?.subRows
      ? sortWithFixedPosition([...technicalData[0].subRows, newRow])
      : [newRow];
    setTechnicalData([
      {
        hypothesis: t('thermal.@specific'),
        trajectory: null,
        status: TRAJECTORY_SELECTION_STATUS.MISSING,
        isDefault: true,
        subRows: sortWithFixedPosition(newTechnicalDataSubRow) || [],
      },
      {
        hypothesis: t('thermal.@paramModulation'),
        trajectory: null,
        status: TRAJECTORY_SELECTION_STATUS.MISSING,
        isDefault: true,
      },
      {
        hypothesis: t('thermal.@common'),
        trajectory: null,
        status: TRAJECTORY_SELECTION_STATUS.MISSING,
        isDefault: true,
      },
    ]);
  };

  const removeRow = (value: string) => {
    setCheckedValues((prev) => [...prev.filter((checkedValue) => checkedValue !== value)]);
    setTechnicalData((prev) => [...prev.filter((itemData) => itemData.hypothesis !== value)]);
  };

  const handleSelectionChange = (value: string, isChecked: boolean) => {
    if (isChecked) {
      addRow(value);
    } else {
      removeRow(value);
    }
  };

  const handleTrajectorySearch = async () => Promise.resolve([]);
  const handleFetchTrajectoriesFS = async (rowId: string) => {
    console.log('=== rowId', rowId);
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
          {areasOptions?.map((area, index) => (
            <div key={`${index}-${area.name}`} className="my-1">
              <StdCheckbox
                key={`parameter-checkbox-${area.name}`}
                label={area.name}
                value={area.name}
                name={''}
                disabled={area.isDefault}
                checked={area.isDefault}
              />
              {defaultAreas?.length > 0 && index === Math.max(defaultAreas?.length - 1, 0) && (
                <RdsDivider extraClasses="mt-1" />
              )}
            </div>
          ))}
        </StdCheckboxGroupWrapper>
      </div>
      <div className="flex w-full flex-col gap-6">
        <PegaseHypothesisTable
          id="default-parameters-table"
          data={technicalData}
          getTableHeaders={getExpandableHypothesisTableHeaders}
          columnHeader={t('thermal.@parametersTechnical')}
          fileStatus={fileStatus}
          studyState={studyState?.studyStatus ?? StudyStatus.IN_PROGRESS}
          readOnly={readOnly}
          progress={progress}
          idSelected={rowIndexSelected}
          handleSearch={handleTrajectorySearch}
          handleImport={handleFetchTrajectoriesFS}
          isReadOnlyEnable={true}
          removeRow={removeRow}
        />
        <div className="flex h-fit w-full">
          <PegaseHypothesisTable
            id="default-parameters-table"
            data={data}
            getTableHeaders={getEditableHypothesisTableHeaders}
            columnHeader={t('thermal.@parametersEconomic')}
            fileStatus={fileStatus}
            studyState={studyState?.studyStatus ?? StudyStatus.IN_PROGRESS}
            progress={progress}
            idSelected={rowIndexSelected}
            handleSearch={handleTrajectorySearch}
            handleImport={handleFetchTrajectoriesFS}
          />
        </div>
      </div>
    </div>
  );
};
