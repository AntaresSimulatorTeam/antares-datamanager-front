/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import SearchBar from '@/pages/pegase/home/components/SearchBar.tsx';
import { RdsDivider } from 'rte-design-system-react';
import {
  CheckBoxData,
  DbTrajectory,
  HypothesisRowData,
  LocationStudy,
  RowStatus,
  SelectOption,
  TrajectoryAreaData,
} from '@/shared/types';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { useStudy, useStudyDispatch } from '@/store/contexts/StudyContext.tsx';
import { ReadOnlyObject } from '@common/data/stdTable/types/readOnly.type';
import { getAreaTrajectoryName, getRowDataSelected } from '@/shared/utils/trajectoryUtils.ts';
import { StudyStatus } from '@/shared/types/common/StudyStatus.type.ts';
import { PegaseHypothesisTable } from '@common/layout/PegaseHypothesisTable/PegaseHypothesisTable.tsx';
import getExpandableHypothesisTableHeaders from '@/components/header/ExpandableHypothesisTableHeaders.tsx';
import { ImportTrajectoryModal } from '@common/modal/ImportTrajectoryModal.tsx';
import { useNewStudyModal } from '@/hooks/useNewStudyModal.ts';
import { useLocation } from 'react-router-dom';
import { useFetchHypothesisTrajectories } from '@/hooks/useFetchHypothesisTrajectories.ts';
import StdCheckbox from '@common/forms/stdCheckbox/StdCheckbox.tsx';
import StdCheckboxGroupWrapper from '@common/forms/stdCheckboxGroup/StdCheckboxGroupWrapper.tsx';
import { DeletionModal } from '@common/modal/DeletionModal.tsx';
import { addRow, handleFetchTrajectoriesFS, handleTrajectorySearch } from '@/shared/services/hypothesisTableService.ts';
import { useTrajectoryImport } from '@/hooks/useTrajectoryImport.ts';
import { useTrajectoryAttach } from '@/hooks/useTrajectoryAttach.ts';
import { useHypothesisTableRemoveRow } from '@/hooks/useHypothesisTableRemoveRow.ts';
import { useTrajectoryDetach } from '@/hooks/useTrajectoryDetach.ts';
import { shouldOpenDeletionModal } from '@/shared/helpers/hypothesisTableHelper.ts';
import { OTHER_AREAS_LABEL } from '@/shared/const/studyConfig';
import { OTHER_AREAS } from '@/shared/const/studyConfig.ts';

interface ThermalTabProps {
  defaultAreas: { name: string }[];
  areas: TrajectoryAreaData[];
}

const ThermalCapacityTab = ({ defaultAreas, areas }: ThermalTabProps) => {
  const { t } = useTranslation();
  const studyState = useStudy();
  const location = useLocation();
  const study = (location.state as LocationStudy)?.study;
  const dispatch = useStudyDispatch();
  const [checkedValues, setCheckedValues] = useState<string[]>([]);
  const [areasOptions, setAreasOptions] = useState<CheckBoxData[]>([]);
  const [data, setData] = useState<HypothesisRowData[]>([]);
  const [rowIdSelected, setRowIdSelected] = useState<string>('0');
  const [readOnly, setReadOnly] = useState<ReadOnlyObject>({});
  const { isModalOpen, toggleModal } = useNewStudyModal();
  const [optionsFS, setOptionsFS] = useState<SelectOption[]>();
  const [dbTrajectories, setDbTrajectories] = useState<DbTrajectory[]>([]);
  const [rowToDelete, setRowToDelete] = useState<{ index: number; value?: string } | null>(null);
  const [isDeletionModalOpen, setIsDeletionModalOpen] = useState(false);
  const [isStudyGenerated] = useState(
    studyState.studyStatus === StudyStatus.GENERATED || study.status === StudyStatus.GENERATED,
  );
  const { hypothesisTrajectories, areasTrajectoryOptions, dropDownListOptions, readOnlyRow } =
    useFetchHypothesisTrajectories(study?.id, TRAJECTORY_TYPE.THERMAL_CAPACITY, defaultAreas, areas, isStudyGenerated);
  const { fileStatus, progress, importTrajectory } = useTrajectoryImport(study, studyState, dispatch, setData);
  const { attachTrajectory } = useTrajectoryAttach(study, studyState, dispatch, setData);
  const { removeRow } = useHypothesisTableRemoveRow(study, dispatch, setData, setCheckedValues);
  const { detachTrajectory } = useTrajectoryDetach(study, dispatch, setData);

  useEffect(() => {
    const setHypothesis = () => {
      areasTrajectoryOptions && setAreasOptions(areasTrajectoryOptions);
      dropDownListOptions && setCheckedValues(dropDownListOptions);
      hypothesisTrajectories && setData(hypothesisTrajectories);
      setReadOnly(readOnlyRow);
    };
    setHypothesis();
  }, [areas, areasTrajectoryOptions, defaultAreas, dropDownListOptions, hypothesisTrajectories, readOnlyRow]);

  return (
    <div className="flex h-full w-full gap-6">
      <div className="flex h-fit w-28 flex-col gap-1 rounded border border-gray-400 p-2">
        <div className="border-b border-gray-400 pb-2">
          <SearchBar onSearch={() => {}} placeholder={t('studyDetails.@search_area')} />
        </div>
        <StdCheckboxGroupWrapper
          label={''}
          name={''}
          onChange={(value: string, isChecked?: boolean) => {
            const indexRow = data.findIndex((row) => row.hypothesis === value);
            if (isChecked) {
              addRow(TRAJECTORY_TYPE.THERMAL_CAPACITY, value, dispatch, setCheckedValues, setData);
            } else if (shouldOpenDeletionModal(TRAJECTORY_TYPE.THERMAL_CAPACITY, indexRow, data)) {
              setRowToDelete({ index: indexRow, value });
              setIsDeletionModalOpen(true);
            } else {
              void removeRow(TRAJECTORY_TYPE.THERMAL_CAPACITY, value, indexRow, data);
            }
          }}
          checkedValues={checkedValues}
        >
          {areasOptions?.map((area, index) => (
            <div key={`${area.name}`} className="my-1">
              <StdCheckbox
                key={`nested-${area.name}`}
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
        {defaultAreas.length > 0 && (
          <PegaseHypothesisTable
            id="thermal-table"
            data={data}
            getTableHeaders={getExpandableHypothesisTableHeaders}
            fileStatus={fileStatus}
            studyState={studyState?.studyStatus ?? StudyStatus.IN_PROGRESS}
            readOnly={readOnly}
            progress={progress}
            idSelected={rowIdSelected}
            handleSearch={async (value: string, rowId: string) => {
              const indexArray = rowId.split('.').map(Number);
              const area =
                data[indexArray[0]]?.hypothesis === OTHER_AREAS_LABEL ? OTHER_AREAS : data[indexArray[0]]?.hypothesis;
              const technology =
                indexArray?.length > 1 ? data[indexArray[0]]?.subRows?.[indexArray[1]]?.hypothesis : undefined;
              return await handleTrajectorySearch(
                TRAJECTORY_TYPE.THERMAL_CAPACITY,
                value,
                area,
                setDbTrajectories,
                study,
                technology,
              );
            }}
            handleImport={async (rowId: string) => {
              const indexArray = rowId.split('.').map(Number);
              await handleFetchTrajectoriesFS(
                TRAJECTORY_TYPE.THERMAL_CAPACITY,
                rowId,
                setOptionsFS,
                setRowIdSelected,
                toggleModal,
                data[indexArray[0]]?.hypothesis === 'FR' ? 'FR' : '',
              );
            }}
            isReadOnlyEnable={true}
            updateData={(rowId: string, value: unknown, status: RowStatus) => {
              const indexArray = rowId.split('.').map(Number);
              if (status === 'empty' || status === 'emptyError') {
                const trajectorySelected: DbTrajectory | null =
                  getRowDataSelected(data, indexArray)?.trajectory ?? null;
                if (trajectorySelected) {
                  void detachTrajectory(TRAJECTORY_TYPE.THERMAL_CAPACITY, indexArray, status, trajectorySelected);
                }
              } else if (status === 'success') {
                const dbTrajectory =
                  dbTrajectories.length > 0
                    ? dbTrajectories.find((item) => item.trajectoryName === value)
                    : getRowDataSelected(data, indexArray)?.trajectory;
                if (dbTrajectory) {
                  void attachTrajectory(TRAJECTORY_TYPE.THERMAL_CAPACITY, indexArray, status, dbTrajectory);
                }
              }
            }}
            removeRow={(value: string, rowId?: string) => {
              if (shouldOpenDeletionModal(TRAJECTORY_TYPE.THERMAL_CAPACITY, Number(rowId), data)) {
                setRowToDelete({ index: Number(rowId), value });
                setIsDeletionModalOpen(true);
              } else {
                void removeRow(TRAJECTORY_TYPE.THERMAL_CAPACITY, value, Number(rowId), data);
              }
            }}
          />
        )}
      </div>
      {isModalOpen && (
        <ImportTrajectoryModal
          options={optionsFS}
          onClose={async (value?: SelectOption) => {
            toggleModal();
            if (value != null) {
              const indexArray = rowIdSelected.split('.').map(Number);
              await importTrajectory(TRAJECTORY_TYPE.THERMAL_CAPACITY, value, indexArray, data);
            }
          }}
          trajectoryType={TRAJECTORY_TYPE.THERMAL_CAPACITY}
          area={getAreaTrajectoryName(rowIdSelected, data)}
        />
      )}
      {isDeletionModalOpen && (
        <DeletionModal
          onClose={() => setIsDeletionModalOpen(false)}
          handleDeletionRow={async () => {
            if (rowToDelete?.value) {
              await removeRow(TRAJECTORY_TYPE.THERMAL_CAPACITY, rowToDelete?.value, rowToDelete.index, data);
              setIsDeletionModalOpen(false);
            }
          }}
        />
      )}
    </div>
  );
};

export default ThermalCapacityTab;
