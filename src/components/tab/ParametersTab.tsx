import { useTranslation } from 'react-i18next';
import { useCallback, useEffect, useState } from 'react';
import { CheckBoxData, DbTrajectory, HypothesisRowData, RowStatus, SelectOption, TabProps } from '@/shared/types';
import { TRAJECTORY_SELECTION_STATUS, TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import getEditableHypothesisTableHeaders from '@/components/header/EditableHypothesisTableHeaders.tsx';
import { StudyStatus } from '@/shared/types/common/StudyStatus.type.ts';
import { PegaseHypothesisTable } from '@common/layout/PegaseHypothesisTable/PegaseHypothesisTable.tsx';
import { ReadOnlyObject } from '@common/data/stdTable/types/readOnly.type';
import { useStudy, useStudyDispatch } from '@/store/contexts/StudyContext.tsx';
import getExpandableHypothesisTableHeaders from '@/components/header/ExpandableHypothesisTableHeaders.tsx';
import { ImportTrajectoryModal } from '@common/modal/ImportTrajectoryModal.tsx';
import {
  filterRow,
  generateReadOnlyIndexMap,
  getAreaTrajectoryName,
  getTrajectoryTypeByIndex,
  isTechnicalParametersType,
  shouldDeleteParamModulation,
} from '@/shared/utils/trajectoryUtils.ts';
import { useNewStudyModal } from '@/hooks/useNewStudyModal.ts';
import { addRow, handleFetchTrajectoriesFS, handleTrajectorySearch } from '@/shared/services/hypothesisTableService.ts';
import { OTHER_AREAS, OTHER_AREAS_LABEL } from '@/shared/const/studyConfig.ts';
import { useTrajectoryImport } from '@/hooks/useTrajectoryImport.ts';
import { useTrajectoryAttach } from '@/hooks/useTrajectoryAttach';
import { useTrajectoryDetach } from '@/hooks/useTrajectoryDetach';
import { CheckBoxListWithSearchBar } from '@/components/list/CheckBoxListWithSearchBar.tsx';
import { useHypothesisTableRemoveRow } from '@/hooks/useHypothesisTableRemoveRow.ts';
import { getCheckedValues, shouldOpenDeletionModal } from '@/shared/helpers/hypothesisTableHelper.ts';
import { AreaDeletionConfirmationModal } from '@common/modal/AreaDeletionConfirmationModal.tsx';
import { useFetchHypothesisParametersTrajectories } from '@/hooks/useFetchHypothesisParametersTrajectories.ts';
import { useFetchFixHypothesisTrajectories } from '@/hooks/useFetchFixHypothesisTrajectories.ts';
import { isParamModulationRequired } from '@/shared/services/trajectoryService.ts';

export const ParametersTab = ({ defaultAreas, areas, studyData }: TabProps) => {
  const { t } = useTranslation();
  const studyState = useStudy();
  const dispatch = useStudyDispatch();
  const { isModalOpen, toggleModal } = useNewStudyModal();
  const [checkedValues, setCheckedValues] = useState<string[]>([]);
  const [readOnly, setReadOnly] = useState<ReadOnlyObject>({});
  const [readOnlyParam, setReadOnlyParam] = useState<ReadOnlyObject>({});
  const [areasOptions, setAreasOptions] = useState<CheckBoxData[]>([]);
  const [technicalData, setTechnicalData] = useState<HypothesisRowData[]>([]);
  const [data, setData] = useState<HypothesisRowData[]>([]);
  const [optionsFS, setOptionsFS] = useState<SelectOption[]>();
  const [rowIdSelected, setRowIdSelected] = useState<string>('0');
  const [rowToDelete, setRowToDelete] = useState<{ index: number | number[]; value?: string } | null>(null);
  const [isDeletionModalOpen, setIsDeletionModalOpen] = useState(false);
  const [isStudyGenerated, setIsStudyGenerated] = useState(
    studyState.studyStatus === StudyStatus.GENERATED || studyData.status === StudyStatus.GENERATED,
  );
  const [dbTrajectories, setDbTrajectories] = useState<DbTrajectory[]>([]);
  const [selectedTrajectoryType, setSelectedTrajectoryType] = useState<TRAJECTORY_TYPE>(
    TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER,
  );
  const { hypothesisTrajectories, areasTrajectoryOptions, dropDownListOptions, readOnlyRow } =
    useFetchHypothesisParametersTrajectories(areas, studyData, defaultAreas, isStudyGenerated);

  const configs = [
    { type: TRAJECTORY_TYPE.THERMAL_ECONOMIC_COST_PARAMETER, labelKey: t('thermal.@costs') },
    { type: TRAJECTORY_TYPE.THERMAL_ECONOMIC_PARAMETER, labelKey: t('thermal.@economics') },
  ];
  const options = { withReadOnlyRow: false, isStudyGenerated };
  const { hypothesisTrajectories: economicData } = useFetchFixHypothesisTrajectories(configs, options, studyData?.id);

  const { fileStatus, progress, importTrajectory } = useTrajectoryImport(studyData, studyState, dispatch);
  const { attachTrajectory } = useTrajectoryAttach(studyData, studyState, dispatch);
  const { removeRow } = useHypothesisTableRemoveRow(studyData, dispatch, setTechnicalData, setCheckedValues);
  const { detachTrajectory } = useTrajectoryDetach(studyData, dispatch);

  useEffect(() => {
    const setHypothesis = () => {
      areasTrajectoryOptions && setAreasOptions(areasTrajectoryOptions);
      dropDownListOptions && setCheckedValues(dropDownListOptions);
      hypothesisTrajectories && setTechnicalData(hypothesisTrajectories);
      economicData && setData(economicData);
      setReadOnly(readOnlyRow);
    };
    setHypothesis();
  }, [areasTrajectoryOptions, dropDownListOptions, hypothesisTrajectories, readOnlyRow, economicData]);

  useEffect(() => {
    if (studyState.studyStatus === StudyStatus.GENERATED) {
      setIsStudyGenerated(true);
      const newTechnicalData = filterRow(technicalData);
      setTechnicalData(newTechnicalData);
      const newCheckedValues = getCheckedValues(newTechnicalData[0]?.subRows ?? [], areas, defaultAreas);
      setCheckedValues(newCheckedValues);
      const rows = generateReadOnlyIndexMap(technicalData);
      setReadOnly(rows);
      setReadOnlyParam({ '0': true, '1': true });
    }
  }, [studyState.studyStatus]);

  const handleSelectionChange = useCallback(
    async (value: string, isChecked: boolean) => {
      if (isChecked) {
        addRow(
          TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER,
          value,
          dispatch,
          setCheckedValues,
          setTechnicalData,
          [],
          defaultAreas,
        );
      } else if (
        shouldOpenDeletionModal(TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER, 0, technicalData, value)
      ) {
        setRowToDelete({ index: 0, value });
        setIsDeletionModalOpen(true);
      } else {
        await removeRow(TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER, value, 0, technicalData);
        const isRequired = await isParamModulationRequired(studyData.id, studyData?.horizon);
        setReadOnly({ ...readOnlyRow, ['1']: !isRequired });
      }
    },
    [technicalData, dispatch, removeRow],
  );

  return (
    <div className="flex h-full min-h-0 w-full gap-6 xl:gap-7 2xl:gap-8">
      <CheckBoxListWithSearchBar
        checkedValues={checkedValues}
        options={areasOptions}
        handleSelectionChange={handleSelectionChange}
        dividerPosition={defaultAreas.length}
        disabled={isStudyGenerated}
      />
      <div className="flex w-full flex-col gap-6">
        <PegaseHypothesisTable
          id="technical-parameters-table"
          data={technicalData}
          getTableHeaders={getExpandableHypothesisTableHeaders}
          columnHeader={t('thermal.@parametersTechnical')}
          fileStatus={fileStatus}
          isStudyGenerated={isStudyGenerated}
          readOnly={readOnly}
          progress={isTechnicalParametersType(selectedTrajectoryType) ? progress : 0}
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
              studyData,
            );
          }}
          handleImport={async (rowId: string) => {
            const indexArray = rowId.split('.').map(Number);
            const type = getTrajectoryTypeByIndex(indexArray[0]);
            setSelectedTrajectoryType(type);
            const area = technicalData[indexArray[0]]?.subRows?.[indexArray[1]]?.hypothesis;
            await handleFetchTrajectoriesFS(type, rowId, setOptionsFS, setRowIdSelected, toggleModal, area);
          }}
          updateData={async (rowId: string, value: unknown, status: RowStatus) => {
            const [topIndex, subIndex] = rowId.split('.').map(Number);
            if (status === 'empty' || status === 'emptyError') {
              const row = subIndex != null ? technicalData[topIndex]?.subRows?.[subIndex] : technicalData[topIndex];
              const current = row?.trajectory ?? null;
              if (current) {
                if (
                  topIndex === 0 &&
                  technicalData[topIndex]?.subRows?.[subIndex]?.trajectory &&
                  technicalData[topIndex]?.subRows?.[subIndex]?.status === TRAJECTORY_SELECTION_STATUS.OK &&
                  shouldDeleteParamModulation(0, technicalData)
                ) {
                  setRowToDelete({ index: [topIndex, subIndex], value: value as string });
                  setIsDeletionModalOpen(true);
                } else {
                  await detachTrajectory(
                    getTrajectoryTypeByIndex(topIndex),
                    [topIndex, subIndex].filter((n) => n !== undefined),
                    status,
                    current,
                    setTechnicalData,
                    topIndex === 0 && shouldDeleteParamModulation(0, technicalData)
                      ? technicalData[1].trajectory
                      : null,
                  );
                  const isRequired = await isParamModulationRequired(studyData.id, studyData?.horizon);
                  setReadOnly({ ...readOnlyRow, ['1']: !isRequired });
                }
              }
            }

            if (status === 'success') {
              const dbTrajectory =
                dbTrajectories.find((traj) => traj.id === value || traj.trajectoryName === value) ?? null;
              if (dbTrajectory) {
                await attachTrajectory(
                  getTrajectoryTypeByIndex(topIndex),
                  [topIndex, subIndex].filter((n) => n !== undefined),
                  status,
                  dbTrajectory,
                  setTechnicalData,
                );
                const isRequired = await isParamModulationRequired(studyData.id, studyData?.horizon);
                setReadOnly({ ...readOnlyRow, ['1']: !isRequired });
              }
            }
          }}
          isReadOnlyEnable={true}
          removeRow={async (value: string, _rowId?: string) => {
            if (
              shouldOpenDeletionModal(TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER, 0, technicalData, value)
            ) {
              setRowToDelete({ index: 0, value });
              setIsDeletionModalOpen(true);
            } else {
              await removeRow(TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER, value, 0, technicalData);
              const isRequired = await isParamModulationRequired(studyData.id, studyData?.horizon);
              setReadOnly({ ...readOnlyRow, ['1']: !isRequired });
            }
          }}
          type={TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER}
        />
        <div className="flex h-fit w-full">
          <PegaseHypothesisTable
            id="economics-parameters-table"
            data={data}
            getTableHeaders={getEditableHypothesisTableHeaders}
            columnHeader={t('thermal.@parametersEconomic')}
            fileStatus={fileStatus}
            isStudyGenerated={isStudyGenerated}
            idSelected={rowIdSelected}
            isReadOnlyEnable={true}
            readOnly={readOnlyParam}
            progress={isTechnicalParametersType(selectedTrajectoryType) ? 0 : progress}
            handleSearch={async (value: string, rowId: string) => {
              const index = Number(rowId.split('.').map(Number)[0]);
              const type =
                index === 0
                  ? TRAJECTORY_TYPE.THERMAL_ECONOMIC_COST_PARAMETER
                  : TRAJECTORY_TYPE.THERMAL_ECONOMIC_PARAMETER;
              setSelectedTrajectoryType(type);
              return await handleTrajectorySearch(type, value, '', setDbTrajectories, studyData);
            }}
            handleImport={async (rowId: string) => {
              const index = Number(rowId.split('.').map(Number)[0]);
              const type =
                index === 0
                  ? TRAJECTORY_TYPE.THERMAL_ECONOMIC_COST_PARAMETER
                  : TRAJECTORY_TYPE.THERMAL_ECONOMIC_PARAMETER;
              setSelectedTrajectoryType(type);
              await handleFetchTrajectoriesFS(type, rowId, setOptionsFS, setRowIdSelected, toggleModal);
            }}
            updateData={async (rowId: string, value: unknown, status: RowStatus) => {
              const indexArray = rowId.split('.').map(Number);
              const type =
                indexArray[0] === 0
                  ? TRAJECTORY_TYPE.THERMAL_ECONOMIC_COST_PARAMETER
                  : TRAJECTORY_TYPE.THERMAL_ECONOMIC_PARAMETER;
              setSelectedTrajectoryType(type);
              if (status === 'empty' || status === 'emptyError') {
                const current = data[indexArray[0]]?.trajectory ?? null;
                if (current) {
                  void detachTrajectory(type, indexArray, status, current, setData);
                }
              }

              if (status === 'success') {
                const dbTrajectory =
                  dbTrajectories.find((traj) => traj.id === value || traj.trajectoryName === value) ?? null;
                if (dbTrajectory) {
                  await attachTrajectory(type, indexArray, status, dbTrajectory, setData);
                }
              }
            }}
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
              const isTechnicalParamType = isTechnicalParametersType(selectedTrajectoryType);
              const dataTable = isTechnicalParamType ? technicalData : data;
              const setDataTable = isTechnicalParamType ? setTechnicalData : setData;
              await importTrajectory(selectedTrajectoryType, value, indexArray, dataTable, setDataTable);
              if (selectedTrajectoryType === TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER) {
                const isRequired = await isParamModulationRequired(studyData.id, studyData?.horizon);
                setReadOnly({ ...readOnlyRow, ['1']: !isRequired });
              }
            }
          }}
          trajectoryType={selectedTrajectoryType ?? getTrajectoryTypeByIndex(Number(rowIdSelected))}
          area={getAreaTrajectoryName(
            rowIdSelected,
            isTechnicalParametersType(selectedTrajectoryType) ? technicalData : data,
          )}
        />
      )}
      {isDeletionModalOpen && (
        <AreaDeletionConfirmationModal
          isOpen={isDeletionModalOpen}
          onClose={() => setIsDeletionModalOpen(false)}
          message={
            shouldDeleteParamModulation(0, technicalData)
              ? t('trajectoryDeletionModal.@confirmMultipleDeletionParamMessage')
              : t('trajectoryDeletionModal.@confirmDeletionParamMessage')
          }
          onConfirm={async () => {
            if (rowToDelete?.value) {
              if (Array.isArray(rowToDelete.index)) {
                const [topIndex, subIndex] = rowToDelete.index;
                const row = subIndex != null ? technicalData[topIndex]?.subRows?.[subIndex] : technicalData[topIndex];
                const current = row?.trajectory ?? null;
                if (current) {
                  await detachTrajectory(
                    TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER,
                    rowToDelete?.index,
                    'empty',
                    current,
                    setTechnicalData,
                    shouldDeleteParamModulation(0, technicalData) ? technicalData[1].trajectory : null,
                  );
                  const isRequired = await isParamModulationRequired(studyData.id, studyData?.horizon);
                  setReadOnly({ ...readOnlyRow, ['1']: !isRequired });
                }
              } else {
                await removeRow(
                  TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER,
                  rowToDelete?.value,
                  0,
                  technicalData,
                );
                const isRequired = await isParamModulationRequired(studyData.id, studyData?.horizon);
                setReadOnly({ ...readOnlyRow, ['1']: !isRequired });
              }
              setIsDeletionModalOpen(false);
            }
          }}
        />
      )}
    </div>
  );
};
