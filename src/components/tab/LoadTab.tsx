/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect, useState } from 'react';
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
import { TRAJECTORY_SELECTION_STATUS, TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { useTranslation } from 'react-i18next';
import { useStudy, useStudyDispatch } from '@/store/contexts/StudyContext.tsx';
import { useLocation } from 'react-router-dom';
import {
  fetchTrajectoriesFromDB,
  fetchTrajectoriesFromFS,
  getStudyTrajectoriesWithWarnings,
  linkTrajectoryToStudy,
  unlinkTrajectoryFromStudy,
  uploadTrajectory,
} from '@/shared/services/trajectoryService.ts';
import { convertToFSSelectionOptionType, convertToSelectionOptionType } from '@/shared/utils/formFormatter.ts';
import SearchBar from '@/pages/pegase/home/components/SearchBar.tsx';
import { RdsCheckbox, RdsCheckboxGroupWrapper, RdsDivider } from 'rte-design-system-react';
import { STUDY_ACTION } from '@/shared/enum/study.ts';
import { ReadOnlyObject } from '@common/data/stdTable/types/readOnly.type';
import getEditableHypothesisTableHeaders from '@/components/header/EditableHypothesisTableHeaders.tsx';
import { sortWithFixedPosition } from '@/shared/utils/sortUtils.ts';
import {
  buildEmptyTrajectory,
  buildErrorTrajectory,
  buildRowData,
  retrieveReadOnlyArea,
} from '@/shared/utils/trajectoryUtils.ts';
import { OTHER_AREAS, OTHER_AREAS_LABEL } from '@/shared/const/studyConfig.ts';
import { ImportTrajectoryModal } from '@common/modal/ImportTrajectoryModal.tsx';
import { useNewStudyModal } from '@/hooks/useNewStudyModal.ts';
import { DeletionModal } from '@common/modal/DeletionModal.tsx';
import { useUser } from '@/store/contexts/UserContext.tsx';
import { StudyStatus } from '@/shared/types/common/StudyStatus.type.ts';
import { notifyAlert } from '@/shared/notification/notification.tsx';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps.ts';
import { PegaseHypothesisTable } from '@common/layout/PegaseHypothesisTable/PegaseHypothesisTable.tsx';
import { useFetchHypothesisTrajectories } from '@/hooks/useFetchHypothesisTrajectories.ts';
import { setReadOnlyForGeneratedStudy } from '@/shared/helpers/hypothesisTableHelper.ts';
import { fetchWarningMessagesFromType } from '@/shared/services/warningService.ts';

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
  const [rowIdSelected, setRowIdSelected] = useState<number>(0);
  const [optionsFS, setOptionsFS] = useState<SelectOption[]>();
  const [rowToDelete, setRowToDelete] = useState<{ index: number; value?: string } | null>(null);
  const [progress, setProgress] = useState(0);
  const [fileStatus, setFileStatus] = useState<FileInputStatus>('empty');
  const [isStudyGenerated, setIsStudyGenerated] = useState(
    studyState.studyStatus === StudyStatus.GENERATED || study.status === StudyStatus.GENERATED,
  );
  const { hypothesisTrajectories } = useFetchHypothesisTrajectories(study?.id, TRAJECTORY_TYPE.LOAD, defaultAreas);

  useEffect(() => {
    const fetchHypothesis = () => {
      try {
        // Build dropdown list options
        const newArea = (areas || [])
          .map((trajectoryArea) => {
            if (!defaultAreas?.some((item) => item.name === trajectoryArea.areaName)) {
              return { name: trajectoryArea.areaName, isDefault: false };
            }
          })
          .filter(Boolean) as CheckBoxData[];
        setAreasOptions(defaultAreas?.map((area) => ({ name: area.name, isDefault: true }))?.concat(newArea));

        if (defaultAreas.length > 0) {
          const checkList = hypothesisTrajectories
            .map((trajectory) => {
              if (trajectory.loadArea) return trajectory.loadArea;
            })
            .filter(Boolean) as string[];
          setCheckedValues(defaultAreas.map((item) => item.name).concat(checkList));
        }

        // Build hypothesis table
        if (hypothesisTrajectories.length > 0) {
          const areaData = hypothesisTrajectories
            .map((trajectory: DbTrajectory) => {
              if (trajectory.loadArea) {
                return buildRowData(
                  trajectory.loadArea,
                  defaultAreas.some((item: { name: string }) => item.name === trajectory.loadArea) ||
                    trajectory.loadArea === OTHER_AREAS,
                  trajectory,
                );
              }
            })
            .filter(Boolean) as HypothesisRowData[];
          const dataTrajectories = sortWithFixedPosition(areaData);
          setData(dataTrajectories);

          // Find default area not included in areas trajectory list
          const defaultAreaListNotIncludedInList = defaultAreas
            .map((defaultArea) => {
              if (!areas.some((trajectoryArea) => trajectoryArea.areaName === defaultArea.name)) {
                return defaultArea.name;
              }
            })
            .filter(Boolean) as string[];
          if (isStudyGenerated) {
            setReadOnlyForGeneratedStudy(dataTrajectories, setReadOnly);
          } else if (defaultAreaListNotIncludedInList.length > 0 && !isStudyGenerated) {
            setReadOnly(retrieveReadOnlyArea(dataTrajectories, defaultAreaListNotIncludedInList));
          }
        }
      } catch {
        //silent handler
      }
    };

    void fetchHypothesis();
  }, [hypothesisTrajectories, areas, defaultAreas, isStudyGenerated]);

  useEffect(() => {
    if (studyState.studyStatus === StudyStatus.GENERATED || study?.status === StudyStatus.GENERATED) {
      setIsStudyGenerated(true);
      setReadOnlyForGeneratedStudy(data, setReadOnly);
    }
  }, [studyState.studyStatus, study?.status]);

  const handleFetchTrajectoriesFS = async (rowId: string): Promise<void> => {
    try {
      const results = await fetchTrajectoriesFromFS(TRAJECTORY_TYPE.LOAD);
      setOptionsFS(convertToFSSelectionOptionType(results));
      toggleModal();
    } finally {
      setRowIdSelected(Number(rowId));
    }
  };

  const handleTrajectoryError = (
    rowIndex: number,
    trajectoryId: number,
    trajectoryLabel: string,
    errorMessage: string,
  ) => {
    const newDbTrajectory = buildErrorTrajectory(
      TRAJECTORY_TYPE.LOAD,
      trajectoryId,
      trajectoryLabel,
      user?.profile?.sub,
      data[rowIndex]?.hypothesis,
    );
    setData((prev) =>
      prev.map((item, index) =>
        index === rowIndex
          ? {
              ...item,
              trajectory: newDbTrajectory,
              status: TRAJECTORY_SELECTION_STATUS.ERROR,
            }
          : item,
      ),
    );

    notifyAlert({
      icon: StdIconId.Close,
      message: t('studyDetails.@notificationAlert', {
        studyName: study?.name ?? '',
        trajectoryName: trajectoryLabel,
        trajectoryType: data[rowIndex]?.hypothesis,
      }),
      content: errorMessage,
      type: 'error',
      filledIcon: true,
    });
  };

  const handleTrajectoryUpdate = async (
    rowIndex: number,
    trajectoryId: number,
    status?: RowStatus,
    trajectoryLabel?: string,
    errorMessage?: string,
  ) => {
    try {
      if ((status === 'empty' && data[rowIndex].trajectory) || (status === 'emptyError' && data[rowIndex].trajectory)) {
        if (status === 'empty') {
          await unlinkTrajectoryFromStudy(trajectoryId, study.id);
        }
        const warningMessages = await fetchWarningMessagesFromType(TRAJECTORY_TYPE.LOAD, study.id);
        dispatch?.({
          type: STUDY_ACTION.UPDATE_TRAJECTORY,
          payload: { trajectory: data[rowIndex].trajectory, warningMessages, status },
        });
        setData((prev) =>
          prev.map((item, index) =>
            index === rowIndex
              ? {
                  ...item,
                  trajectory: null,
                  status: TRAJECTORY_SELECTION_STATUS.MISSING,
                }
              : item,
          ),
        );
      } else if (status === 'success') {
        await linkTrajectoryToStudy(TRAJECTORY_TYPE.LOAD, trajectoryId, study.id);
        const result = await getStudyTrajectoriesWithWarnings(study.id, TRAJECTORY_TYPE.LOAD);
        const newTrajectory = result?.trajectories?.find((trajectory) => {
          if (data[rowIndex].hypothesis === OTHER_AREAS_LABEL) {
            return trajectory.loadArea === OTHER_AREAS;
          } else {
            return trajectory.loadArea === data[rowIndex].hypothesis;
          }
        });
        if (newTrajectory) {
          const payloadResult = { trajectory: newTrajectory, warningMessages: result.warningMessages, status };
          dispatch?.({ type: STUDY_ACTION.UPDATE_TRAJECTORY, payload: payloadResult });
        }
        setData((prev) =>
          prev.map((item, index) =>
            index === rowIndex
              ? {
                  ...item,
                  trajectory: newTrajectory ?? null,
                  status: newTrajectory ? TRAJECTORY_SELECTION_STATUS.OK : TRAJECTORY_SELECTION_STATUS.MISSING,
                }
              : item,
          ),
        );
      }
      if (rowIndex != null && status === 'error' && trajectoryId != null && trajectoryLabel && !!errorMessage) {
        handleTrajectoryError(rowIndex, trajectoryId, trajectoryLabel, errorMessage);
      }
    } catch (error) {
      if (rowIndex != null) {
        handleTrajectoryError(rowIndex, trajectoryId, trajectoryLabel ?? '', (error as Error).message);
      }
    }
  };

  const handleImportTrajectory = async (value: SelectOption) => {
    setFileStatus('loading');
    let newTrajectory: DbTrajectory;
    try {
      newTrajectory = await uploadTrajectory(
        TRAJECTORY_TYPE.LOAD,
        value.label,
        study.horizon,
        study.id,
        data[rowIdSelected]?.hypothesis === OTHER_AREAS_LABEL ? OTHER_AREAS : data[rowIdSelected]?.hypothesis,
        (progressValue: number) => {
          setProgress(+progressValue?.toFixed(0));
        },
      );
      setFileStatus('success');
      if (newTrajectory.id != null) {
        await handleTrajectoryUpdate(rowIdSelected, newTrajectory.id, 'success', newTrajectory.trajectoryName);
      }
    } catch (error) {
      setFileStatus('error');
      await handleTrajectoryUpdate(rowIdSelected, value.id, 'error', value.label, (error as Error)?.message);
    }
  };

  const handleTrajectorySearch = useCallback(
    async (value?: string, area?: string): Promise<SelectOption[] | undefined> => {
      try {
        const results = await fetchTrajectoriesFromDB(TRAJECTORY_TYPE.LOAD, study.horizon, value, area);
        return convertToSelectionOptionType(results);
      } catch {
        // silent handler
      }
    },
    [study.horizon],
  );

  const handleRemoveRow = async (value?: string, indexRow?: number) => {
    if (indexRow && data[indexRow].hypothesis) {
      dispatch?.({
        type: STUDY_ACTION.DELETE_TRAJECTORY,
        payload: { area: data[indexRow].hypothesis, type: TRAJECTORY_TYPE.LOAD },
      });
      if (data[indexRow]?.trajectory && data[indexRow]?.status === TRAJECTORY_SELECTION_STATUS.OK) {
        await unlinkTrajectoryFromStudy(data[indexRow].trajectory.id, study.id);
      }
    }
    const newDataSorted = data.filter((_row: HypothesisRowData, index: number) => index !== indexRow);
    setData(sortWithFixedPosition(newDataSorted));
    if (value) {
      setCheckedValues((prev) => [...prev.filter((name) => name !== value)]);
    }
  };

  const removeRow = async (value?: string, indexRow?: number) => {
    if (indexRow && data[indexRow].trajectory && data[indexRow].status === TRAJECTORY_SELECTION_STATUS.OK) {
      setRowToDelete({ index: indexRow, value });
      setIsDeletionModalOpen(true);
    } else {
      await handleRemoveRow(value, indexRow);
    }
  };

  const addRow = (value: string) => {
    dispatch?.({
      type: STUDY_ACTION.ADD_TRAJECTORIES,
      payload: {
        [TRAJECTORY_TYPE.LOAD]: {
          trajectories: [buildEmptyTrajectory(value, TRAJECTORY_TYPE.LOAD)],
          warningMessages: [],
        },
      },
    });
    const newDataSorted = sortWithFixedPosition([
      {
        hypothesis: value,
        trajectory: null,
        status: TRAJECTORY_SELECTION_STATUS.MISSING,
        isDefault: false,
      },
      ...data,
    ]);

    setData(sortWithFixedPosition(newDataSorted));
  };

  const handleSelectionChange = async (name: string, isChecked?: boolean) => {
    if (isChecked) {
      if (checkedValues?.includes(name)) {
        return;
      } else {
        addRow(name);
        setCheckedValues((prev) => [...prev, name]);
      }
    } else {
      try {
        await removeRow(
          name,
          data.findIndex((row) => row.hypothesis === name),
        );
      } catch {
        // Silent handler
      }
    }
  };

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
            onChange={(value: string, isChecked?: boolean) => void handleSelectionChange(value, isChecked)}
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
            handleSearch={handleTrajectorySearch}
            handleImport={async (rowId: string) => await handleFetchTrajectoriesFS(rowId)}
            removeRow={(value: string, rowId?: string) => void removeRow(value, Number(rowId))}
            updateData={(rowId: string, value: unknown, status?: RowStatus, label?: string) =>
              void handleTrajectoryUpdate(Number(rowId), value as number, status, label)
            }
            isReadOnlyEnable={true}
          />
        </div>
        {isModalOpen && (
          <ImportTrajectoryModal
            options={optionsFS}
            onClose={async (value?: SelectOption) => {
              toggleModal();
              if (value != null) {
                await handleImportTrajectory(value);
              }
            }}
            trajectoryType={TRAJECTORY_TYPE.LOAD}
            area={data[rowIdSelected]?.hypothesis}
          />
        )}
        {isDeletionModalOpen && (
          <DeletionModal
            onClose={() => setIsDeletionModalOpen(false)}
            handleDeletionRow={async () => {
              if (rowToDelete) {
                await handleRemoveRow(rowToDelete?.value, rowToDelete.index);
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
