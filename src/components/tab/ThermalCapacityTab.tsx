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
  FileInputStatus,
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
import { getRowDataSelected } from '@/shared/utils/trajectoryUtils.ts';
import { StudyStatus } from '@/shared/types/common/StudyStatus.type.ts';
import { PegaseHypothesisTable } from '@common/layout/PegaseHypothesisTable/PegaseHypothesisTable.tsx';
import getExpandableHypothesisTableHeaders from '@/components/header/ExpandableHypothesisTableHeaders.tsx';
import { ImportTrajectoryModal } from '@common/modal/ImportTrajectoryModal.tsx';
import { useNewStudyModal } from '@/hooks/useNewStudyModal.ts';
import { useLocation } from 'react-router-dom';
import { useFetchHypothesisTrajectories } from '@/hooks/useFetchHypothesisTrajectories.ts';
import StdCheckbox from '@common/forms/stdCheckbox/StdCheckbox.tsx';
import StdCheckboxGroupWrapper from '@common/forms/stdCheckboxGroup/StdCheckboxGroupWrapper.tsx';
import { useUser } from '@/store/contexts/UserContext.tsx';
import { DeletionModal } from '@common/modal/DeletionModal.tsx';
import {
  handleFetchTrajectoriesFS,
  handleImportTrajectory,
  handleSelectionChange,
  handleTrajectoryAttach,
  handleTrajectorySearch,
  handleTrajectoryUnlink,
  removeRow,
} from '@/shared/services/hypothesisTableService.ts';

interface ThermalTabProps {
  defaultAreas: { name: string }[];
  areas: TrajectoryAreaData[];
}

const ThermalCapacityTab = ({ defaultAreas, areas }: ThermalTabProps) => {
  const { t } = useTranslation();
  const { user } = useUser();
  const studyState = useStudy();
  const location = useLocation();
  const study = (location.state as LocationStudy)?.study;
  const dispatch = useStudyDispatch();
  const [checkedValues, setCheckedValues] = useState<string[]>([]);
  const [areasOptions, setAreasOptions] = useState<CheckBoxData[]>([]);
  const [data, setData] = useState<HypothesisRowData[]>([]);
  const [progress, setProgress] = useState(0);
  const [fileStatus, setFileStatus] = useState<FileInputStatus>('empty');
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
            void handleSelectionChange(
              TRAJECTORY_TYPE.THERMAL_CAPACITY,
              value,
              indexRow,
              dispatch,
              setCheckedValues,
              setData,
              setRowToDelete,
              setIsDeletionModalOpen,
              data,
              study?.id,
              isChecked,
            );
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
            handleSearch={async (value: string, area: string) =>
              await handleTrajectorySearch(TRAJECTORY_TYPE.THERMAL_CAPACITY, value, area, setDbTrajectories, study)
            }
            handleImport={async (rowId: string) => {
              const indexArray = rowId.split('.').map((item) => parseInt(item));
              const hypothesis = data[indexArray[0]]?.hypothesis === 'FR' ? 'FR' : '';
              await handleFetchTrajectoriesFS(
                TRAJECTORY_TYPE.THERMAL_CAPACITY,
                rowId,
                setOptionsFS,
                setRowIdSelected,
                toggleModal,
                hypothesis,
              );
            }}
            isReadOnlyEnable={true}
            updateData={(rowId: string, value: unknown, status: RowStatus) => {
              const indexArray = rowId.split('.').map((item) => parseInt(item));
              if (status === 'empty' || status === 'emptyError') {
                const trajectorySelected: DbTrajectory | null =
                  getRowDataSelected(data, indexArray)?.trajectory ?? null;
                if (trajectorySelected)
                  void handleTrajectoryUnlink(
                    TRAJECTORY_TYPE.THERMAL_CAPACITY,
                    indexArray,
                    status,
                    trajectorySelected,
                    study,
                    dispatch,
                    setData,
                    user?.profile?.sub ?? '',
                    t,
                  );
              } else if (status === 'success') {
                const dbTrajectory =
                  dbTrajectories.length > 0
                    ? dbTrajectories.find((item) => item.trajectoryName === value)
                    : getRowDataSelected(data, indexArray)?.trajectory;
                if (dbTrajectory)
                  void handleTrajectoryAttach(
                    TRAJECTORY_TYPE.THERMAL_CAPACITY,
                    indexArray,
                    status,
                    dbTrajectory,
                    study,
                    studyState,
                    dispatch,
                    setData,
                    t,
                    user?.profile?.sub ?? '',
                  );
              }
            }}
            removeRow={(value: string, rowId?: string) => {
              void handleSelectionChange(
                TRAJECTORY_TYPE.THERMAL_CAPACITY,
                value,
                Number(rowId),
                dispatch,
                setCheckedValues,
                setData,
                setRowToDelete,
                setIsDeletionModalOpen,
                data,
                study?.id,
              );
            }}
          />
        )}
      </div>
      {isModalOpen && (
        <ImportTrajectoryModal
          options={optionsFS}
          onClose={async (value?: SelectOption) => {
            toggleModal();
            const indexArray = rowIdSelected.split('.').map((item) => parseInt(item));
            if (value != null) {
              await handleImportTrajectory(
                TRAJECTORY_TYPE.THERMAL_CAPACITY,
                value,
                indexArray,
                data[indexArray[0]]?.hypothesis,
                setFileStatus,
                setProgress,
                study,
                studyState,
                dispatch,
                t,
                user?.profile?.sub ?? '',
                setData,
              );
            }
          }}
          trajectoryType={TRAJECTORY_TYPE.THERMAL_CAPACITY}
          area={
            getRowDataSelected(
              data,
              rowIdSelected.split('.').map((item) => parseInt(item)),
            )?.hypothesis
          }
        />
      )}
      {isDeletionModalOpen && (
        <DeletionModal
          onClose={() => setIsDeletionModalOpen(false)}
          handleDeletionRow={async () => {
            if (rowToDelete?.value) {
              await removeRow(
                TRAJECTORY_TYPE.THERMAL_CAPACITY,
                rowToDelete?.value,
                rowToDelete.index,
                dispatch,
                setCheckedValues,
                setData,
                data,
                study.id,
              );
              setIsDeletionModalOpen(false);
            }
          }}
        />
      )}
    </div>
  );
};

export default ThermalCapacityTab;
