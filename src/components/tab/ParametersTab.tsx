import { useTranslation } from 'react-i18next';
import { useCallback, useEffect, useState } from 'react';
import {
  CheckBoxData,
  DbTrajectory,
  HypothesisRowData,
  LocationStudy,
  RowStatus,
  SelectOption,
  TabProps,
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
import {
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
import { shouldOpenDeletionModal } from '@/shared/helpers/hypothesisTableHelper.ts';
import { AreaDeletionConfirmationModal } from '@common/modal/AreaDeletionConfirmationModal.tsx';
import { useFetchHypothesisParametersTrajectories } from '@/hooks/useFetchHypothesisParametersTrajectories.ts';
import { useFetchFixHypothesisTrajectories } from '@/hooks/useFetchFixHypothesisTrajectories.ts';

export const ParametersTab = ({ defaultAreas, areas }: TabProps) => {
  const { t } = useTranslation();
  const studyState = useStudy();
  const location = useLocation();
  const study = (location.state as LocationStudy)?.study;
  const dispatch = useStudyDispatch();
  const { isModalOpen, toggleModal } = useNewStudyModal();
  const [checkedValues, setCheckedValues] = useState<string[]>([]);
  const [readOnly, setReadOnly] = useState<ReadOnlyObject>({});
  const [areasOptions, setAreasOptions] = useState<CheckBoxData[]>([]);
  const [technicalData, setTechnicalData] = useState<HypothesisRowData[]>([]);
  const [data, setData] = useState<HypothesisRowData[]>([]);
  const [optionsFS, setOptionsFS] = useState<SelectOption[]>();
  const [rowIdSelected, setRowIdSelected] = useState<string>('0');
  const [rowToDelete, setRowToDelete] = useState<{ index: number | number[]; value?: string } | null>(null);
  const [isDeletionModalOpen, setIsDeletionModalOpen] = useState(false);
  const [isStudyGenerated, setIsStudyGenerated] = useState(
    studyState.studyStatus === StudyStatus.GENERATED || study.status === StudyStatus.GENERATED,
  );
  const [dbTrajectories, setDbTrajectories] = useState<DbTrajectory[]>([]);
  const [selectedTrajectoryType, setSelectedTrajectoryType] = useState<TRAJECTORY_TYPE>(
    TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER,
  );
  const { hypothesisTrajectories, areasTrajectoryOptions, dropDownListOptions, readOnlyRow } =
    useFetchHypothesisParametersTrajectories(areas, study?.id, defaultAreas, isStudyGenerated);

  const configs = [
    { type: TRAJECTORY_TYPE.THERMAL_ECONOMIC_COST_PARAMETER, labelKey: t('thermal.@costs') },
    { type: TRAJECTORY_TYPE.THERMAL_ECONOMIC_PARAMETER, labelKey: t('thermal.@economics') },
  ];
  const options = { withReadOnlyRow: false, isStudyGenerated };
  const { hypothesisTrajectories: economicData } = useFetchFixHypothesisTrajectories(configs, options, study?.id);

  const { fileStatus, progress, importTrajectory } = useTrajectoryImport(
    study,
    studyState,
    dispatch,
    isTechnicalParametersType(selectedTrajectoryType) ? setTechnicalData : setData,
  );
  const { attachTrajectory } = useTrajectoryAttach(
    study,
    studyState,
    dispatch,
    isTechnicalParametersType(selectedTrajectoryType) ? setTechnicalData : setData,
  );
  const { removeRow } = useHypothesisTableRemoveRow(study, dispatch, setTechnicalData, setCheckedValues);
  const { detachTrajectory } = useTrajectoryDetach(
    study,
    dispatch,
    isTechnicalParametersType(selectedTrajectoryType) ? setTechnicalData : setData,
  );

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
    const updateHypothesisTable = () => {
      const hasSpecificTrajectory =
        technicalData[0]?.subRows?.some((row) => row.status === TRAJECTORY_SELECTION_STATUS.OK) ?? false;
      const newReadOnlyRow = { ...readOnlyRow, ['1']: !hasSpecificTrajectory };
      setReadOnly(newReadOnlyRow);
    };
    void updateHypothesisTable();
  }, [detachTrajectory, technicalData]);

  useEffect(() => {
    if (isStudyGenerated) {
      setIsStudyGenerated(true);
      const rows = generateReadOnlyIndexMap(technicalData);
      setReadOnly(rows);
    }
  }, [isStudyGenerated]);

  const handleSelectionChange = useCallback(
    async (value: string, isChecked: boolean) => {
      if (isChecked) {
        addRow(
          TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER,
          value,
          dispatch,
          setCheckedValues,
          setTechnicalData,
        );
      } else if (
        shouldOpenDeletionModal(TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER, 0, technicalData, value)
      ) {
        setRowToDelete({ index: 0, value });
        setIsDeletionModalOpen(true);
      } else {
        await removeRow(TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER, value, 0, technicalData);
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
          studyState={studyState?.studyStatus ?? StudyStatus.IN_PROGRESS}
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
              study,
            );
          }}
          handleImport={async (rowId: string) => {
            const indexArray = rowId.split('.').map(Number);
            const type = getTrajectoryTypeByIndex(indexArray[0]);
            setSelectedTrajectoryType(type);
            const area = technicalData[indexArray[0]]?.subRows?.[indexArray[1]]?.hypothesis;
            await handleFetchTrajectoriesFS(type, rowId, setOptionsFS, setRowIdSelected, toggleModal, area);
          }}
          updateData={(rowId: string, value: unknown, status: RowStatus) => {
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
                  void detachTrajectory(
                    getTrajectoryTypeByIndex(topIndex),
                    [topIndex, subIndex].filter((n) => n !== undefined),
                    status,
                    current,
                    topIndex === 0 && shouldDeleteParamModulation(0, technicalData)
                      ? technicalData[1].trajectory
                      : null,
                  );
                }
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
          removeRow={(value: string, _rowId?: string) => {
            if (
              shouldOpenDeletionModal(TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER, 0, technicalData, value)
            ) {
              setRowToDelete({ index: 0, value });
              setIsDeletionModalOpen(true);
            } else {
              void removeRow(TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER, value, 0, technicalData);
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
            studyState={studyState?.studyStatus ?? StudyStatus.IN_PROGRESS}
            idSelected={rowIdSelected}
            progress={isTechnicalParametersType(selectedTrajectoryType) ? 0 : progress}
            handleSearch={async (value: string, rowId: string) => {
              const index = Number(rowId.split('.').map(Number)[0]);
              return await handleTrajectorySearch(
                index === 0
                  ? TRAJECTORY_TYPE.THERMAL_ECONOMIC_COST_PARAMETER
                  : TRAJECTORY_TYPE.THERMAL_ECONOMIC_PARAMETER,
                value,
                '',
                setDbTrajectories,
                study,
              );
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
            updateData={(rowId: string, value: unknown, status: RowStatus) => {
              const indexArray = rowId.split('.').map(Number);
              const type =
                indexArray[0] === 0
                  ? TRAJECTORY_TYPE.THERMAL_ECONOMIC_COST_PARAMETER
                  : TRAJECTORY_TYPE.THERMAL_ECONOMIC_PARAMETER;
              if (status === 'empty' || status === 'emptyError') {
                const current = data[indexArray[0]]?.trajectory ?? null;
                if (current) {
                  void detachTrajectory(type, indexArray, status, current);
                }
              }

              if (status === 'success') {
                const dbTrajectory =
                  dbTrajectories.find((traj) => traj.id === value || traj.trajectoryName === value) ?? null;
                if (dbTrajectory) {
                  void attachTrajectory(type, indexArray, status, dbTrajectory);
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
              const dataTable = isTechnicalParametersType(selectedTrajectoryType) ? technicalData : data;
              await importTrajectory(selectedTrajectoryType, value, indexArray, dataTable);
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
                    shouldDeleteParamModulation(0, technicalData) ? technicalData[1].trajectory : null,
                  );
                }
              } else {
                await removeRow(
                  TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER,
                  rowToDelete?.value,
                  0,
                  technicalData,
                );
              }
              setIsDeletionModalOpen(false);
            }
          }}
        />
      )}
    </div>
  );
};
