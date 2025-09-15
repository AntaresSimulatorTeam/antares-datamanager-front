/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useEffect, useState } from 'react';
import {
  CheckBoxData,
  DbTrajectory,
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
import { RdsDivider } from 'rte-design-system-react';
import { ReadOnlyObject } from '@common/data/stdTable/types/readOnly.type';
import getEditableHypothesisTableHeaders from '@/components/header/EditableHypothesisTableHeaders.tsx';
import { ImportTrajectoryModal } from '@common/modal/ImportTrajectoryModal.tsx';
import { useNewStudyModal } from '@/hooks/useNewStudyModal.ts';
import { DeletionModal } from '@common/modal/DeletionModal.tsx';
import { StudyStatus } from '@/shared/types/common/StudyStatus.type.ts';
import { PegaseHypothesisTable } from '@common/layout/PegaseHypothesisTable/PegaseHypothesisTable.tsx';
import { useFetchHypothesisTrajectories } from '@/hooks/useFetchHypothesisTrajectories.ts';
import { addRow, handleFetchTrajectoriesFS, handleTrajectorySearch } from '@/shared/services/hypothesisTableService.ts';
import { getReadOnlyForGeneratedStudy, shouldOpenDeletionModal } from '@/shared/helpers/hypothesisTableHelper.ts';
import StdCheckboxGroupWrapper from '@common/forms/stdCheckboxGroup/StdCheckboxGroupWrapper.tsx';
import StdCheckbox from '@common/forms/stdCheckbox/StdCheckbox.tsx';
import { useTrajectoryImport } from '@/hooks/useTrajectoryImport.ts';
import { useTrajectoryAttach } from '@/hooks/useTrajectoryAttach.ts';
import { useTrajectoryDetach } from '@/hooks/useTrajectoryDetach.ts';
import { useHypothesisTableRemoveRow } from '@/hooks/useHypothesisTableRemoveRow.ts';
import { OTHER_AREAS, OTHER_AREAS_LABEL } from '@/shared/const/studyConfig.ts';

interface LoadTabProps {
  defaultAreas: { name: string }[];
  areas: TrajectoryAreaData[];
}

const LoadTab = ({ defaultAreas, areas }: LoadTabProps) => {
  const { t } = useTranslation();
  const studyState = useStudy();
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
  const [isStudyGenerated, setIsStudyGenerated] = useState(
    studyState.studyStatus === StudyStatus.GENERATED || study.status === StudyStatus.GENERATED,
  );
  const { hypothesisTrajectories, areasTrajectoryOptions, dropDownListOptions, readOnlyRow } =
    useFetchHypothesisTrajectories(study?.id, TRAJECTORY_TYPE.LOAD, defaultAreas, areas, isStudyGenerated);
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
  }, [studyState.studyStatus, study?.status, data]);

  return (
    <div className="flex h-full w-full flex-col gap-4">
      <div className="flex h-full w-full gap-6">
        <div className="flex h-fit w-28 flex-col rounded border border-gray-400 p-2">
          <div className="border-b border-gray-400 pb-2">
            <SearchBar onSearch={() => {}} placeholder={t('studyDetails.@search_area')} />
          </div>
          <StdCheckboxGroupWrapper
            label={''}
            name={''}
            onChange={(value: string, isChecked?: boolean) => {
              const indexRow = data.findIndex((row) => row.hypothesis === value);
              if (isChecked) {
                addRow(TRAJECTORY_TYPE.LOAD, value, dispatch, setCheckedValues, setData);
              } else if (shouldOpenDeletionModal(TRAJECTORY_TYPE.LOAD, indexRow, data)) {
                setRowToDelete({ index: indexRow, value });
                setIsDeletionModalOpen(true);
              } else {
                void removeRow(TRAJECTORY_TYPE.LOAD, value, indexRow, data);
              }
            }}
            checkedValues={checkedValues}
            disabled={isStudyGenerated}
          >
            {areasOptions?.map((area, index) => (
              <div key={`${index}-${area.name}`} className="my-1">
                <StdCheckbox
                  key={`load-checkbox-${area.name}`}
                  label={
                    area.name !== OTHER_AREAS && area.isDefault
                      ? `${area.name} (${t('studyDetails.@default')})`
                      : area.name
                  }
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
            handleSearch={async (value: string, rowId: string) => {
              const area =
                data[Number(rowId)]?.hypothesis === OTHER_AREAS_LABEL ? OTHER_AREAS : data[Number(rowId)]?.hypothesis;
              return await handleTrajectorySearch(TRAJECTORY_TYPE.LOAD, value, area, setDbTrajectories, study);
            }}
            handleImport={async (rowId: string) => {
              await handleFetchTrajectoriesFS(
                TRAJECTORY_TYPE.LOAD,
                rowId,
                setOptionsFS,
                setRowIdSelected,
                toggleModal,
                data[Number(rowId)]?.hypothesis,
              );
            }}
            removeRow={(value: string, rowId?: string) => {
              if (shouldOpenDeletionModal(TRAJECTORY_TYPE.LOAD, Number(rowId), data)) {
                setRowToDelete({ index: Number(rowId), value });
                setIsDeletionModalOpen(true);
              } else {
                void removeRow(TRAJECTORY_TYPE.LOAD, value, Number(rowId), data);
              }
            }}
            updateData={(rowId: string, value: unknown, status: RowStatus) => {
              const index = Number(rowId);
              const trajectory = data[index]?.trajectory;
              if ((status === 'empty' && trajectory) || (status === 'emptyError' && trajectory)) {
                void detachTrajectory(TRAJECTORY_TYPE.LOAD, [index], status, trajectory);
              } else if (status === 'success') {
                const dbTrajectory = dbTrajectories.find((item) => item.trajectoryName === value) ?? trajectory;
                if (dbTrajectory) void attachTrajectory(TRAJECTORY_TYPE.LOAD, [Number(rowId)], status, dbTrajectory);
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
              if (value != null) {
                await importTrajectory(TRAJECTORY_TYPE.LOAD, value, [Number(rowIdSelected)], data);
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
                await removeRow(TRAJECTORY_TYPE.LOAD, rowToDelete?.value, rowToDelete.index, data);
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
