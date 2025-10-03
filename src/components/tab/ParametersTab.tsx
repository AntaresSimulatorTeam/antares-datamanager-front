import { useTranslation } from 'react-i18next';
import { useCallback, useEffect, useState } from 'react';
import {
  CheckBoxData,
  DbTrajectory,
  HypothesisRowData,
  LocationStudy,
  RowStatus,
  SelectOption,
  TrajectoryAreaData,
} from '@/shared/types';
import { TRAJECTORY_SELECTION_STATUS, TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import getEditableHypothesisTableHeaders from '@/components/header/EditableHypothesisTableHeaders.tsx';
import { StudyStatus } from '@/shared/types/common/StudyStatus.type.ts';
import { PegaseHypothesisTable } from '@common/layout/PegaseHypothesisTable/PegaseHypothesisTable.tsx';
import { ReadOnlyObject } from '@common/data/stdTable/types/readOnly.type';
import { useStudy, useStudyDispatch } from '@/store/contexts/StudyContext.tsx';
import getExpandableHypothesisTableHeaders from '@/components/header/ExpandableHypothesisTableHeaders.tsx';
import { useLocation } from 'react-router-dom';
import { ImportTrajectoryModal } from '@common/modal/ImportTrajectoryModal.tsx';
import { getAreaTrajectoryName, getTrajectoryTypeByIndex } from '@/shared/utils/trajectoryUtils.ts';
import { useNewStudyModal } from '@/hooks/useNewStudyModal.ts';
import { addRow, handleFetchTrajectoriesFS, handleTrajectorySearch } from '@/shared/services/hypothesisTableService.ts';
import { OTHER_AREAS, OTHER_AREAS_LABEL } from '@/shared/const/studyConfig.ts';
import { useTrajectoryImport } from '@/hooks/useTrajectoryImport.ts';
import { useTrajectoryAttach } from '@/hooks/useTrajectoryAttach';
import { useTrajectoryDetach } from '@/hooks/useTrajectoryDetach';
import { CheckBoxListWithSearchBar } from '@/components/list/CheckBoxListWithSearchBar.tsx';
import { useFetchHypothesisThermalParameters } from '@/hooks/useFetchHypothesisThermalParameters.ts';
import { THERMAL_TYPES } from '@/shared/const/thermalConst.ts';

interface ParametersTabProps {
  defaultAreas: { name: string }[];
  areas: TrajectoryAreaData[];
}

export const ParametersTab = ({ defaultAreas, areas }: ParametersTabProps) => {
  const { t } = useTranslation();
  const studyState = useStudy();
  const location = useLocation();
  const study = (location.state as LocationStudy)?.study;
  const dispatch = useStudyDispatch();
  const { isModalOpen, toggleModal } = useNewStudyModal();
  const [checkedValues, setCheckedValues] = useState<string[]>([]);
  const data: HypothesisRowData[] = [
    {
      hypothesis: t('thermal.@costs'),
      trajectory: null,
      status: TRAJECTORY_SELECTION_STATUS.MISSING,
      isDefault: false,
      isDeletable: false,
    },
    {
      hypothesis: t('thermal.@economics'),
      trajectory: null,
      status: TRAJECTORY_SELECTION_STATUS.MISSING,
      isDefault: false,
      isDeletable: false,
    },
  ];
  const [readOnly, setReadOnly] = useState<ReadOnlyObject>({});
  const [areasOptions, setAreasOptions] = useState<CheckBoxData[]>([]);
  const [technicalData, setTechnicalData] = useState<HypothesisRowData[]>([]);
  const [optionsFS, setOptionsFS] = useState<SelectOption[]>();
  const [rowIdSelected, setRowIdSelected] = useState<string>('0');
  const [isStudyGenerated] = useState(
    studyState.studyStatus === StudyStatus.GENERATED || study.status === StudyStatus.GENERATED,
  );
  const [dbTrajectories, setDbTrajectories] = useState<DbTrajectory[]>([]);
  const { hypothesisTrajectories, areasTrajectoryOptions, dropDownListOptions, readOnlyRow } =
    useFetchHypothesisThermalParameters(
      study?.id,
      TRAJECTORY_TYPE.THERMAL_PARAMETER,
      THERMAL_TYPES,
      defaultAreas,
      areas,
      isStudyGenerated,
    );
  const { fileStatus, progress, importTrajectory } = useTrajectoryImport(study, studyState, dispatch, setTechnicalData);
  const { attachTrajectory } = useTrajectoryAttach(study, studyState, dispatch, setTechnicalData);
  const { detachTrajectory } = useTrajectoryDetach(study, dispatch, setTechnicalData, studyState);

  useEffect(() => {
    const setHypothesis = () => {
      areasTrajectoryOptions && setAreasOptions(areasTrajectoryOptions);
      dropDownListOptions && setCheckedValues(dropDownListOptions);
      hypothesisTrajectories && setTechnicalData(hypothesisTrajectories);
      setReadOnly(readOnlyRow);
    };
    setHypothesis();
  }, [areas, areasTrajectoryOptions, defaultAreas, dropDownListOptions, hypothesisTrajectories, readOnlyRow, t]);

  useEffect(() => {
    const hasSpecificTrajectory = technicalData[0]?.subRows?.some(
      (row) => row.status === TRAJECTORY_SELECTION_STATUS.OK,
    );
    const newReadOnlyRow = { ...readOnlyRow, ['1']: !hasSpecificTrajectory };
    setReadOnly(newReadOnlyRow);
  }, [technicalData]);

  const removeRow = useCallback(
    (value: string) => {
      setCheckedValues((prev) => prev.filter((checkedValue) => checkedValue !== value));

      setTechnicalData((prev: HypothesisRowData[]): HypothesisRowData[] => {
        const newSubRows = prev?.[0]?.subRows
          ? prev[0].subRows?.filter((itemData) => itemData.hypothesis !== value)
          : [];
        return [{ ...prev[0], subRows: newSubRows }, ...prev.slice(1)];
      });
    },
    [setCheckedValues, setTechnicalData],
  );

  const handleSelectionChange = useCallback(
    (value: string, isChecked: boolean) => {
      if (isChecked) {
        addRow(
          TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER,
          value,
          dispatch,
          setCheckedValues,
          setTechnicalData,
        );
      } else {
        removeRow(value);
      }
    },
    [dispatch, removeRow, setCheckedValues, setTechnicalData],
  );

  return (
    <div className="flex h-full min-h-0 w-full gap-6">
      <CheckBoxListWithSearchBar
        checkedValues={checkedValues}
        options={areasOptions}
        handleSelectionChange={handleSelectionChange}
        dividerPosition={defaultAreas.length}
      />
      <div className="flex w-full flex-col gap-6">
        <PegaseHypothesisTable
          id="technical-parameters-table"
          data={technicalData}
          getTableHeaders={getExpandableHypothesisTableHeaders}
          columnHeader={t('thermal.@parametersTechnical')}
          fileStatus={fileStatus}
          studyState={studyState?.studyStatus ?? StudyStatus.IN_PROGRESS}
          readOnly={readOnly}
          progress={progress}
          idSelected={rowIdSelected}
          handleSearch={async (value: string, rowId: string) => {
            const indexArray = rowId.split('.').map(Number);
            let area: string = '';
            if (indexArray.length === 2) {
              area =
                technicalData[indexArray[0]]?.subRows?.[indexArray[1]]?.hypothesis === OTHER_AREAS_LABEL
                  ? OTHER_AREAS
                  : (technicalData[indexArray[0]]?.subRows?.[indexArray[1]]?.hypothesis ?? '');
            }
            return await handleTrajectorySearch(
              getTrajectoryTypeByIndex(indexArray[0]),
              value,
              area,
              setDbTrajectories,
              study,
            );
          }}
          handleImport={async (rowId: string) => {
            const indexArray = rowId.split('.').map(Number);
            const area = technicalData[indexArray[0]]?.subRows?.[indexArray[1]]?.hypothesis;
            await handleFetchTrajectoriesFS(
              getTrajectoryTypeByIndex(indexArray[0]),
              rowId,
              setOptionsFS,
              setRowIdSelected,
              toggleModal,
              area,
            );
          }}
          updateData={(rowId: string, value: unknown, status: RowStatus) => {
            const [topIndex, subIndex] = rowId.split('.').map(Number);
            if (status === 'empty' || status === 'emptyError') {
              const row = subIndex != null ? technicalData[topIndex]?.subRows?.[subIndex] : technicalData[topIndex];
              const current = row?.trajectory ?? null;
              if (current) {
                void detachTrajectory(
                  getTrajectoryTypeByIndex(topIndex),
                  [topIndex, subIndex].filter((n) => n !== undefined),
                  status,
                  current,
                );
              }
            }

            if (status === 'success') {
              const dbTrajectory =
                dbTrajectories.find((traj) => traj.id === value || traj.trajectoryName === value) ?? null;
              if (dbTrajectory) {
                void attachTrajectory(
                  getTrajectoryTypeByIndex(topIndex),
                  [topIndex, subIndex].filter((n) => n !== undefined),
                  status,
                  dbTrajectory,
                );
              }
            }
          }}
          isReadOnlyEnable={true}
          removeRow={removeRow}
        />
        <div className="flex h-fit w-full">
          <PegaseHypothesisTable
            id="economics-parameters-table"
            data={data}
            getTableHeaders={getEditableHypothesisTableHeaders}
            columnHeader={t('thermal.@parametersEconomic')}
            fileStatus={'success'}
            studyState={studyState?.studyStatus ?? StudyStatus.IN_PROGRESS}
            idSelected={rowIdSelected}
            progress={0}
            handleSearch={async (_value: string, _rowId: string) => Promise.resolve(undefined)}
            handleImport={() => Promise.resolve()}
          />
        </div>
      </div>
      {isModalOpen && (
        <ImportTrajectoryModal
          options={optionsFS}
          onClose={async (value?: SelectOption) => {
            toggleModal();
            if (value != null) {
              const indexArray = rowIdSelected.split('.').map(Number);
              await importTrajectory(getTrajectoryTypeByIndex(indexArray[0]), value, indexArray, technicalData);
            }
          }}
          trajectoryType={getTrajectoryTypeByIndex(Number(rowIdSelected))}
          area={getAreaTrajectoryName(rowIdSelected, technicalData)}
        />
      )}
    </div>
  );
};
