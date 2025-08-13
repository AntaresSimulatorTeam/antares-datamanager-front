/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useEffect, useState } from 'react';
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
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { useTranslation } from 'react-i18next';
import { useStudy, useStudyDispatch } from '@/store/contexts/StudyContext.tsx';
import { useLocation } from 'react-router-dom';
import SearchBar from '@/pages/pegase/home/components/SearchBar.tsx';
import { RdsCheckbox, RdsCheckboxGroupWrapper, RdsDivider } from 'rte-design-system-react';
import { ReadOnlyObject } from '@common/data/stdTable/types/readOnly.type';
import getEditableHypothesisTableHeaders from '@/components/header/EditableHypothesisTableHeaders.tsx';
import { ImportTrajectoryModal } from '@common/modal/ImportTrajectoryModal.tsx';
import { useNewStudyModal } from '@/hooks/useNewStudyModal.ts';
import { DeletionModal } from '@common/modal/DeletionModal.tsx';
import { useUser } from '@/store/contexts/UserContext.tsx';
import { StudyStatus } from '@/shared/types/common/StudyStatus.type.ts';
import { PegaseHypothesisTable } from '@common/layout/PegaseHypothesisTable/PegaseHypothesisTable.tsx';
import { useFetchHypothesisTrajectories } from '@/hooks/useFetchHypothesisTrajectories.ts';
import {
  handleFetchTrajectoriesFS,
  handleImportTrajectory,
  handleSelectionChange,
  handleTrajectoryAttach,
  handleTrajectorySearch,
  handleTrajectoryUnlink,
  removeRow,
} from '@/shared/services/hypothesisTableService.ts';
import { getReadOnlyForGeneratedStudy } from '@/shared/helpers/hypothesisTableHelper.ts';

interface LoadTabProps {
  defaultAreas: { name: string }[];
  areas: TrajectoryAreaData[];
}

const LoadTab = ({ defaultAreas, areas }: LoadTabProps) => {
  const { t } = useTranslation();
  const studyState = useStudy();
  const { user } = useUser();
  const location = useLocation();
  const study = (location.state as LocationStudy)?.study;
  const dispatch = useStudyDispatch();
  const [readOnly, setReadOnly] = useState<ReadOnlyObject>({});
  const [data, setData] = useState<HypothesisRowData[]>([]);
  const [areasOptions, setAreasOptions] = useState<CheckBoxData[]>([]);
  const [checkedValues, setCheckedValues] = useState<string[]>([]);
  const { isModalOpen, toggleModal } = useNewStudyModal();
  const [isDeletionModalOpen, setIsDeletionModalOpen] = useState(false);
  const [rowIdSelected, setRowIdSelected] = useState<string>('0');
  const [optionsFS, setOptionsFS] = useState<SelectOption[]>();
  const [dbTrajectories, setDbTrajectories] = useState<DbTrajectory[]>([]);
  const [rowToDelete, setRowToDelete] = useState<{ index: number; value?: string } | null>(null);
  const [progress, setProgress] = useState(0);
  const [fileStatus, setFileStatus] = useState<FileInputStatus>('empty');
  const [isStudyGenerated, setIsStudyGenerated] = useState(
    studyState.studyStatus === StudyStatus.GENERATED || study.status === StudyStatus.GENERATED,
  );
  const { hypothesisTrajectories, areasTrajectoryOptions, dropDownListOptions, readOnlyRow } =
    useFetchHypothesisTrajectories(study?.id, TRAJECTORY_TYPE.LOAD, defaultAreas, areas, isStudyGenerated);

  useEffect(() => {
    const setHypothesis = () => {
      areasTrajectoryOptions && setAreasOptions(areasTrajectoryOptions);
      dropDownListOptions && setCheckedValues(dropDownListOptions);
      hypothesisTrajectories && setData(hypothesisTrajectories);
      setReadOnly(readOnlyRow);
    };
    void setHypothesis();
  }, [
    hypothesisTrajectories,
    areas,
    defaultAreas,
    isStudyGenerated,
    areasTrajectoryOptions,
    dropDownListOptions,
    readOnlyRow,
  ]);

  useEffect(() => {
    if (studyState.studyStatus === StudyStatus.GENERATED || study?.status === StudyStatus.GENERATED) {
      setIsStudyGenerated(true);
      const rows = getReadOnlyForGeneratedStudy(data);
      setReadOnly(rows);
    }
  }, [studyState.studyStatus, study?.status]);

  return (
    <div className="flex h-full w-full flex-col gap-4">
      <div className="flex h-full w-full gap-6">
        <div className="flex h-fit w-28 flex-col rounded border border-gray-400 p-2">
          <div className="border-b border-gray-400 pb-2">
            <SearchBar onSearch={() => {}} placeholder={t('studyDetails.@search_area')} />
          </div>
          <RdsCheckboxGroupWrapper
            label={''}
            name={''}
            onChange={(value: string, isChecked?: boolean) => {
              const indexRow = data.findIndex((row) => row.hypothesis === value);
              void handleSelectionChange(
                TRAJECTORY_TYPE.LOAD,
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
            disabled={isStudyGenerated}
          >
            {areasOptions?.map((area, index) => (
              <div key={`${index}-${area.name}`} className="my-1">
                <RdsCheckbox
                  key={`load-checkbox-${area.name}`}
                  label={area.name}
                  value={area.name}
                  name={''}
                  defaultChecked={area.isDefault}
                  disabled={area.isDefault}
                  checked={area.isDefault}
                />
                {defaultAreas?.length > 0 && index === Math.max(defaultAreas?.length - 1, 0) && (
                  <RdsDivider extraClasses="mt-1" />
                )}
              </div>
            ))}
          </RdsCheckboxGroupWrapper>
        </div>
        <div className="flex h-fit w-full">
          <PegaseHypothesisTable
            id="load-table"
            data={data}
            getTableHeaders={getEditableHypothesisTableHeaders}
            fileStatus={fileStatus}
            studyState={studyState?.studyStatus ?? StudyStatus.IN_PROGRESS}
            readOnly={readOnly}
            progress={progress}
            idSelected={String(rowIdSelected)}
            handleSearch={async (value, area) =>
              await handleTrajectorySearch(TRAJECTORY_TYPE.LOAD, value, area, setDbTrajectories, study)
            }
            handleImport={async (rowId: string) =>
              await handleFetchTrajectoriesFS(TRAJECTORY_TYPE.LOAD, rowId, setOptionsFS, setRowIdSelected, toggleModal)
            }
            removeRow={(value: string, rowId?: string) =>
              void handleSelectionChange(
                TRAJECTORY_TYPE.LOAD,
                value,
                Number(rowId),
                dispatch,
                setCheckedValues,
                setData,
                setRowToDelete,
                setIsDeletionModalOpen,
                data,
                study?.id,
              )
            }
            updateData={(rowId: string, value: unknown, status: RowStatus) => {
              const index = Number(rowId);
              const trajectory = data[index]?.trajectory;
              if ((status === 'empty' && trajectory) || (status === 'emptyError' && trajectory)) {
                void handleTrajectoryUnlink(
                  TRAJECTORY_TYPE.LOAD,
                  [index],
                  status,
                  trajectory,
                  study,
                  dispatch,
                  setData,
                  user?.profile?.sub ?? '',
                  t,
                );
              } else if (status === 'success') {
                const dbTrajectory = dbTrajectories.find((item) => item.trajectoryName === value) ?? trajectory;
                if (dbTrajectory)
                  void handleTrajectoryAttach(
                    TRAJECTORY_TYPE.LOAD,
                    [Number(rowId)],
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
            isReadOnlyEnable={true}
          />
        </div>
        {isModalOpen && (
          <ImportTrajectoryModal
            options={optionsFS}
            onClose={async (value?: SelectOption) => {
              toggleModal();
              const indexArray = rowIdSelected.split('.').map((item) => parseInt(item));
              if (value != null) {
                await handleImportTrajectory(
                  TRAJECTORY_TYPE.LOAD,
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
            trajectoryType={TRAJECTORY_TYPE.LOAD}
            area={data[Number(rowIdSelected)]?.hypothesis}
          />
        )}
        {isDeletionModalOpen && (
          <DeletionModal
            onClose={() => setIsDeletionModalOpen(false)}
            handleDeletionRow={async () => {
              if (rowToDelete?.value) {
                await removeRow(
                  TRAJECTORY_TYPE.LOAD,
                  rowToDelete?.value,
                  rowToDelete.index,
                  dispatch,
                  setCheckedValues,
                  setData,
                  data,
                  study?.id,
                );
                setIsDeletionModalOpen(false);
              }
            }}
          />
        )}
      </div>
    </div>
  );
};

export default LoadTab;
