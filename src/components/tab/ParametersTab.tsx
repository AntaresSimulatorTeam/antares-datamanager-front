import { useTranslation } from 'react-i18next';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CheckBoxData,
  DbTrajectory,
  DropdownItemOption,
  HypothesisRowData,
  RowStatus,
  TableOperationRow,
  TabProps,
} from '@/shared/types';
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
import { addRow, handleTrajectorySearch } from '@/shared/services/hypothesisTableService.ts';
import { useTrajectoryImport } from '@/hooks/useTrajectoryImport.ts';
import { useTrajectoryAttach } from '@/hooks/useTrajectoryAttach';
import { useTrajectoryDetach } from '@/hooks/useTrajectoryDetach';
import { CheckBoxList } from '@/components/list/CheckBoxList.tsx';
import { useHypothesisTableRemoveRow } from '@/hooks/useHypothesisTableRemoveRow.ts';
import {
  getCheckedValues,
  getParamForFetchFSTrajectory,
  shouldOpenDeletionModal,
} from '@/shared/helpers/hypothesisTableHelper.ts';
import { AreaDeletionConfirmationModal } from '@common/modal/AreaDeletionConfirmationModal.tsx';
import { useFetchHypothesisParametersTrajectories } from '@/hooks/useFetchHypothesisParametersTrajectories.ts';
import { useFetchFixHypothesisTrajectories } from '@/hooks/useFetchFixHypothesisTrajectories.ts';
import { useTrajectoryFetchFromFSHandler } from '@/hooks/useTrajectoryFetchFromFSHandler.ts';
import { HypothesisType } from '@/shared/types/HypothesisTable.ts';

export const ParametersTab = ({ studyData }: TabProps) => {
  const { t } = useTranslation();
  const studyState = useStudy();
  const dispatch = useStudyDispatch();
  const { isModalOpen, toggleModal } = useNewStudyModal();
  const [checkedValues, setCheckedValues] = useState<string[]>([]);
  const [technicalReadOnly, setTechnicalReadOnly] = useState<ReadOnlyObject>({});
  const [readOnlyParam, setReadOnlyParam] = useState<ReadOnlyObject>({});
  const [areasOptions, setAreasOptions] = useState<CheckBoxData[]>([]);
  const [technicalData, setTechnicalData] = useState<HypothesisRowData[]>([]);
  const [data, setData] = useState<HypothesisRowData[]>([]);
  const [optionsFS, setOptionsFS] = useState<DropdownItemOption[]>();
  const [rowIdSelected, setRowIdSelected] = useState<string>('0');
  const [rowToDelete, setRowToDelete] = useState<{
    index: number;
    subIndex?: number;
    value?: string;
    operation: TableOperationRow;
  } | null>(null);
  const [isDeletionModalOpen, setIsDeletionModalOpen] = useState(false);
  const [isStudyGenerated, setIsStudyGenerated] = useState(
    studyState.studyStatus === StudyStatus.GENERATED || studyData.status === StudyStatus.GENERATED,
  );
  const [dbTrajectories, setDbTrajectories] = useState<DbTrajectory[]>([]);
  const [selectedTrajectoryType, setSelectedTrajectoryType] = useState<TRAJECTORY_TYPE>(
    TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER,
  );
  const defaultAreas = useMemo(() => studyState?.defaultAreas ?? [], [studyState?.defaultAreas]);
  const areas = useMemo(() => studyState?.areas ?? [], [studyState?.areas]);
  const { hypothesisTrajectories, areasTrajectoryOptions, dropDownListOptions, readOnlyRow } =
    useFetchHypothesisParametersTrajectories(areas, studyData, defaultAreas, isStudyGenerated);
  const configs = useMemo(
    () => [
      [
        { type: TRAJECTORY_TYPE.THERMAL_ECONOMIC_COST_PARAMETER, labelKey: t('thermal.@costs') },
        { type: TRAJECTORY_TYPE.THERMAL_ECONOMIC_PARAMETER, labelKey: t('thermal.@economics') },
      ],
    ],
    [t],
  );

  const options = useMemo(
    () => ({
      withReadOnlyRow: false,
    }),
    [],
  );
  const { firstTableData } = useFetchFixHypothesisTrajectories(configs, options, isStudyGenerated, studyData?.id);
  const { handleFetchFromFS } = useTrajectoryFetchFromFSHandler();
  const { fileStatus, progress, importTrajectory } = useTrajectoryImport(studyData, dispatch);
  const { attachTrajectory } = useTrajectoryAttach(studyData, dispatch);
  const { removeRow } = useHypothesisTableRemoveRow(
    studyData,
    dispatch,
    setTechnicalData,
    setCheckedValues,
    setTechnicalReadOnly,
  );
  const { detachTrajectory } = useTrajectoryDetach(
    studyData,
    dispatch,
    setIsDeletionModalOpen,
    setRowIdSelected,
  );

  useEffect(() => {
    const setHypothesis = () => {
      areasTrajectoryOptions && setAreasOptions(areasTrajectoryOptions);
      dropDownListOptions && setCheckedValues(dropDownListOptions);
      hypothesisTrajectories && setTechnicalData(hypothesisTrajectories);
      firstTableData && setData(firstTableData);
      setTechnicalReadOnly(readOnlyRow);
    };
    setHypothesis();
  }, [areasTrajectoryOptions, dropDownListOptions, hypothesisTrajectories, readOnlyRow, firstTableData]);

  useEffect(() => {
    if (studyState.studyStatus === StudyStatus.GENERATED) {
      setIsStudyGenerated(true);
      const newTechnicalData = filterRow(technicalData);
      setTechnicalData(newTechnicalData);
      const newCheckedValues = getCheckedValues(newTechnicalData[0]?.subRows ?? [], studyState.areas ?? [], studyState?.defaultAreas ?? []);
      setCheckedValues(newCheckedValues);
      const rows = generateReadOnlyIndexMap(technicalData);
      setTechnicalReadOnly(rows);
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
          studyState?.defaultAreas ?? [],
        );
      } else if (
        shouldOpenDeletionModal(TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER, 0, technicalData, value)
      ) {
        setRowToDelete({ index: 0, value, operation: 'remove' });
        setIsDeletionModalOpen(true);
      } else {
        await removeRow(TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER, 0, technicalData, value);
      }
    },
    [technicalData, dispatch, removeRow],
  );

  const handleTrajectoryFromDB = useCallback(
    async (tableType: TRAJECTORY_TYPE, tableData: HypothesisRowData[], fileNameContains: string, rowId: string) => {
      const indexArray = rowId.split('.').map(Number);
      let typeToUse = tableType;
      let hypothesis = '';
      if (tableType === TRAJECTORY_TYPE.THERMAL_ECONOMIC_COST_PARAMETER) {
        if (indexArray[0] === 1) {
          typeToUse = TRAJECTORY_TYPE.THERMAL_ECONOMIC_PARAMETER;
        }
        setSelectedTrajectoryType(typeToUse);
      } else {
        typeToUse = getTrajectoryTypeByIndex(indexArray[0]);
        hypothesis = tableData[indexArray[0]]?.subRows?.[indexArray[1]]?.hypothesis ?? '';
      }
      return await handleTrajectorySearch(
        typeToUse,
        setDbTrajectories,
        studyData?.horizon,
        {
          ...(indexArray.length === 2 && {
            area: hypothesis,
          }),
          fileNameContains,
        },
      );
    },
    [studyData?.horizon],
  );

  const handleFetchTrajectoriesFromFS = useCallback(
    async (rowId: string, tableData: HypothesisRowData[], type: TRAJECTORY_TYPE) => {
      const hypothesis = getAreaTrajectoryName(rowId, tableData);
      const { typeToUse, areaToUse, isDefaultArea } = getParamForFetchFSTrajectory(
        type,
        rowId.split('.').map(Number),
        data.length,
        hypothesis,
      );
      const results = await handleFetchFromFS({ typeToUse, areaToUse, isDefaultArea });
      setOptionsFS(results);
      setSelectedTrajectoryType(type);
      setRowIdSelected(rowId);
      toggleModal();
    },
    [data.length, handleFetchFromFS, toggleModal],
  );

  const handleHypothesisTableUpdate = useCallback(
    async (tableType: TRAJECTORY_TYPE, rowId: string, value: unknown, status: RowStatus) => {
      const [topIndex, subIndex] = rowId.split('.').map(Number);
      let typeToUse = tableType;
      if (tableType === TRAJECTORY_TYPE.THERMAL_ECONOMIC_COST_PARAMETER) {
         if (topIndex === 1) {
           typeToUse = TRAJECTORY_TYPE.THERMAL_ECONOMIC_PARAMETER;
         }
        setSelectedTrajectoryType(typeToUse);
      } else {
        typeToUse = getTrajectoryTypeByIndex(topIndex);
      }

      const dataToUse = tableType === TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER ? technicalData : data;
      const dataSetterToUse = tableType === TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER ? setTechnicalData : setData;
      const readOnlySetterToUse = tableType === TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER ? setTechnicalReadOnly : setReadOnlyParam;
      if (status === 'empty' || status === 'emptyError') {
        const row = subIndex == null ? technicalData[topIndex] : technicalData[topIndex]?.subRows?.[subIndex];
        if (
          typeToUse === TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER &&
          topIndex === 0 &&
          row?.trajectory &&
          row?.status === TRAJECTORY_SELECTION_STATUS.OK &&
          shouldDeleteParamModulation(0, technicalData)
        ) {
          setRowToDelete({ index: topIndex, subIndex, value: row?.hypothesis, operation: 'empty' });
          setIsDeletionModalOpen(true);
        } else {
          const hypothesis = tableType === TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER ? technicalData[topIndex]?.subRows?.[subIndex]?.hypothesis : data[topIndex]?.hypothesis;

          await detachTrajectory(
            typeToUse,
            [topIndex, subIndex].filter((n) => n !== undefined),
            dataSetterToUse,
            dataToUse,
            status,
            hypothesis ?? '',
            readOnlySetterToUse
          );
        }
      }

      if (status === 'success') {
        const dbTrajectory = dbTrajectories.find((traj) => traj.id == value) ?? null;
        if (dbTrajectory) {
          await attachTrajectory(
            typeToUse,
            [topIndex, subIndex].filter((n) => n !== undefined),
            status,
            dbTrajectory,
            dataSetterToUse,
            readOnlySetterToUse
          );
        }
      }
    },
    [attachTrajectory, dbTrajectories, detachTrajectory, technicalData],
  );

  return (
    <div className="flex min-h-0 w-full gap-6 pb-6 xl:gap-7 2xl:gap-8">
      <CheckBoxList
        checkedValues={checkedValues}
        options={areasOptions}
        handleSelectionChange={handleSelectionChange}
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
          readOnly={technicalReadOnly}
          progress={isTechnicalParametersType(selectedTrajectoryType) ? progress : 0}
          idSelected={rowIdSelected}
          handleSearch={async (fileNameContains: string, rowId: string) => await handleTrajectoryFromDB(TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER, technicalData, fileNameContains, rowId)}
          handleImport={async (rowId: string) =>
            await handleFetchTrajectoriesFromFS(
              rowId,
              technicalData,
              TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER,
            )
          }
          updateData={async (rowId: string, value: unknown, status: RowStatus) =>
            await handleHypothesisTableUpdate(TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER, rowId, value, status)
          }
          isReadOnlyEnable={true}
          removeRow={async (value: string, _rowId?: string) => {
            if (
              shouldOpenDeletionModal(TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER, 0, technicalData, value)
            ) {
              setRowToDelete({ index: 0, value, operation: 'remove' });
              setIsDeletionModalOpen(true);
            } else {
              await removeRow(TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER, 0, technicalData, value);
            }
          }}
          type={TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER}
        />
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
          handleSearch={async (fileNameContains: string, rowId: string) => await handleTrajectoryFromDB(TRAJECTORY_TYPE.THERMAL_ECONOMIC_COST_PARAMETER, data, fileNameContains, rowId)}
          handleImport={async (rowId: string) =>
            await handleFetchTrajectoriesFromFS(rowId, data, TRAJECTORY_TYPE.THERMAL_ECONOMIC_COST_PARAMETER)
          }
          updateData={async (rowId: string, value: unknown, status: RowStatus) =>
            await handleHypothesisTableUpdate(TRAJECTORY_TYPE.THERMAL_ECONOMIC_COST_PARAMETER, rowId, value, status)
          }
        />
      </div>
        <ImportTrajectoryModal
          options={optionsFS}
          isOpen={isModalOpen}
          onClose={async (
            typeToUse?: TRAJECTORY_TYPE,
            value?: DropdownItemOption,
            hypothesis?: HypothesisType,
            indexArray?: number[],
          ) => {
            toggleModal();
            if (value != null) {
              const isTechnicalParamType = typeToUse ? isTechnicalParametersType(typeToUse) : false;
              const setDataTable = isTechnicalParamType ? setTechnicalData : setData;
              const setReadOnlyTable = isTechnicalParamType ? setTechnicalReadOnly : setReadOnlyParam;
              await importTrajectory(setDataTable, value, typeToUse, indexArray, hypothesis, setReadOnlyTable);
            }
          }}
          tabType={selectedTrajectoryType ?? getTrajectoryTypeByIndex(Number(rowIdSelected))}
          hypothesis={getAreaTrajectoryName(
            rowIdSelected,
            isTechnicalParametersType(selectedTrajectoryType) ? technicalData : data,
          )}
          indexArray={rowIdSelected?.split('.').map(Number)}
          rowsNb={data.length}
        />
        <AreaDeletionConfirmationModal
          isOpen={isDeletionModalOpen}
          onClose={() => setIsDeletionModalOpen(false)}
          message={
            shouldDeleteParamModulation(0, technicalData)
              ? t('trajectoryDeletionModal.@confirmMultipleDeletionParamMessage')
              : t('trajectoryDeletionModal.@confirmDeletionMessage')
          }
          onConfirm={async () => {
            if (rowToDelete?.value) {
              if (rowToDelete?.operation === 'empty') {
                const { index, subIndex, value } = rowToDelete;
                const row = subIndex == null ? technicalData[index] : technicalData[index]?.subRows?.[subIndex];
                const current = row?.trajectory ?? null;
                if (current && subIndex != null) {
                  await detachTrajectory(
                    TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER,
                    [index, subIndex],
                    setTechnicalData,
                    technicalData,
                    'empty',
                    value,
                    setTechnicalReadOnly
                  );
                }
              } else {
                await removeRow(
                  TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER,
                  0,
                  technicalData,
                  rowToDelete?.value,
                );
              }
              setIsDeletionModalOpen(false);
            }
          }}
        />
    </div>
  );
};
