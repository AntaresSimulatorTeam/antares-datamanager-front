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
import { useCallback, useEffect, useState } from 'react';
import { TRAJECTORY_SELECTION_STATUS, TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { useStudy, useStudyDispatch } from '@/store/contexts/StudyContext.tsx';
import { ReadOnlyObject } from '@common/data/stdTable/types/readOnly.type';
import {
  buildEmptyTrajectory,
  buildErrorTrajectory,
  buildRowWithSubRowsData,
  getHypothesis,
  getRowDataSelected,
  retrieveReadOnlyArea,
  setNestedData,
} from '@/shared/utils/trajectoryUtils.ts';
import { StudyStatus } from '@/shared/types/common/StudyStatus.type.ts';
import { sortWithFixedPosition } from '@/shared/utils/sortUtils.ts';
import { OTHER_AREAS, OTHER_AREAS_LABEL } from '@/shared/const/studyConfig.ts';
import { PegaseHypothesisTable } from '@common/layout/PegaseHypothesisTable/PegaseHypothesisTable.tsx';
import getExpandableHypothesisTableHeaders from '@/components/header/ExpandableHypothesisTableHeaders.tsx';
import { ImportTrajectoryModal } from '@common/modal/ImportTrajectoryModal.tsx';
import { useNewStudyModal } from '@/hooks/useNewStudyModal.ts';
import {
  fetchTrajectoriesFromDB,
  fetchTrajectoriesFromFS,
  getStudyTrajectoriesWithWarnings,
  linkTrajectoryToStudy,
  unlinkTrajectoryFromStudy,
  uploadTrajectoryWithTechnology,
} from '@/shared/services/trajectoryService.ts';
import { convertToFSSelectionOptionType, convertToSelectionOptionType } from '@/shared/utils/formFormatter.ts';
import { useLocation } from 'react-router-dom';
import { useFetchHypothesisTrajectories } from '@/hooks/useFetchHypothesisTrajectories.ts';
import StdCheckbox from '@common/forms/stdCheckbox/StdCheckbox.tsx';
import StdCheckboxGroupWrapper from '@common/forms/stdCheckboxGroup/StdCheckboxGroupWrapper.tsx';
import { ThermalOptions } from '@/mocks/data/list/names.ts';
import { STUDY_ACTION } from '@/shared/enum/study.ts';
import { notifyAlert } from '@/shared/notification/notification.tsx';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps.ts';
import { useUser } from '@/store/contexts/UserContext.tsx';
import { fetchWarningMessagesFromType } from '@/shared/services/warningService.ts';
import { DeletionModal } from '@common/modal/DeletionModal.tsx';

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
  const [rowToDelete, setRowToDelete] = useState<{ index: number; value?: string } | null>(null);
  const [isDeletionModalOpen, setIsDeletionModalOpen] = useState(false);
  const { hypothesisTrajectories } = useFetchHypothesisTrajectories(
    study?.id,
    TRAJECTORY_TYPE.THERMAL_CAPACITY,
    defaultAreas,
  );

  useEffect(() => {
    const fetchHypothesis = () => {
      try {
        // Hypothesis table => set read only
        // Find default area not included in areas trajectory list
        const defaultAreaListNotIncludedInList: string[] = defaultAreas
          .map((defaultArea) => {
            if (!areas.some((trajectoryArea) => trajectoryArea.areaName === defaultArea.name)) {
              return defaultArea.name;
            }
          })
          .filter(Boolean) as string[];

        const areaData = hypothesisTrajectories
          .map((trajectory) => {
            if (trajectory.loadArea) {
              return buildRowWithSubRowsData(
                trajectory,
                ThermalOptions,
                defaultAreas,
                defaultAreaListNotIncludedInList,
              );
            }
          })
          .filter(Boolean) as HypothesisRowData[];
        const dataTrajectories = sortWithFixedPosition(areaData);
        setData(dataTrajectories);
        setReadOnly(retrieveReadOnlyArea(dataTrajectories, defaultAreaListNotIncludedInList));

        // Build checkbox list options
        const newArea = areas
          .map((trajectoryArea) => {
            if (!defaultAreas?.some((item) => item.name === trajectoryArea.areaName)) {
              return { name: trajectoryArea.areaName, isDefault: false };
            }
          })
          .filter(Boolean) as CheckBoxData[];
        const checkBoxDefaultData = defaultAreas?.map((area) => ({ name: area.name, isDefault: true }));
        setAreasOptions(newArea.length > 0 ? checkBoxDefaultData.concat(newArea) : checkBoxDefaultData);
        setCheckedValues(defaultAreas.map((item) => item.name));
      } catch {
        // Silent handler
      }
    };
    void fetchHypothesis();
  }, [areas, defaultAreas, hypothesisTrajectories]);

  const addRow = (value: string) => {
    dispatch?.({
      type: STUDY_ACTION.ADD_TRAJECTORIES,
      payload: {
        [TRAJECTORY_TYPE.THERMAL_CAPACITY]: {
          trajectories: [buildEmptyTrajectory(value, TRAJECTORY_TYPE.THERMAL_CAPACITY)],
          warningMessages: [],
        },
      },
    });
    const newRow: HypothesisRowData = {
      hypothesis: value,
      trajectory: null,
      status: TRAJECTORY_SELECTION_STATUS.MISSING,
      isDefault: false,
      subRows: ThermalOptions.map((option) => ({
        hypothesis: option,
        trajectory: null,
        status: TRAJECTORY_SELECTION_STATUS.MISSING,
        isDefault: true,
        subRows: null,
      })),
    };

    // Checked only area
    setCheckedValues((prev) => [...prev, value]);
    setData(sortWithFixedPosition([newRow, ...data]));
  };

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
    setData(sortWithFixedPosition(data.filter((item) => item.hypothesis !== value)));
    if (value) {
      setCheckedValues((prev) => [...prev.filter((name) => name !== value)]);
    }
  };

  const removeRow = async (value: string, rowId?: number) => {
    // Deletion modal
    if (rowId != null && data[rowId].trajectory && data[rowId].status === TRAJECTORY_SELECTION_STATUS.OK) {
      setRowToDelete({ index: rowId, value });
      setIsDeletionModalOpen(true);
    } else {
      // remove
      await handleRemoveRow(value, rowId);
    }
  };

  const handleSelectionChange = async (value: string, isChecked: boolean) => {
    if (isChecked) {
      addRow(value);
    } else {
      void removeRow(value);
    }
  };

  const handleFetchTrajectoriesFS = async (rowId: string): Promise<void> => {
    try {
      const indexArray = rowId.split('.').map((item) => parseInt(item));
      const results = await fetchTrajectoriesFromFS(
        TRAJECTORY_TYPE.THERMAL_CAPACITY,
        '',
        data[indexArray[0]]?.hypothesis === 'FR' ? 'FR' : '',
      );
      setOptionsFS(convertToFSSelectionOptionType(results));
      setRowIdSelected(rowId);
      toggleModal();
    } catch {
      // Silent handler
    }
  };

  const handleTrajectorySearch = useCallback(
    async (value?: string, area?: string): Promise<SelectOption[] | undefined> => {
      try {
        const results = await fetchTrajectoriesFromDB(TRAJECTORY_TYPE.THERMAL_CAPACITY, study.horizon, value, area);
        return convertToSelectionOptionType(results);
      } catch {
        // silent handler
      }
    },
    [study.horizon],
  );

  const handleTrajectoryError = (
    indexArray: number[],
    trajectoryId: number,
    trajectoryLabel: string,
    errorMessage: string,
  ) => {
    const hypothesis = getRowDataSelected(data, indexArray)?.hypothesis;
    const newDbTrajectory = buildErrorTrajectory(
      TRAJECTORY_TYPE.THERMAL_CAPACITY,
      trajectoryId,
      trajectoryLabel,
      user?.profile?.sub,
      hypothesis,
    );
    setData((prev) =>
      setNestedData(prev, indexArray, { trajectory: newDbTrajectory, status: TRAJECTORY_SELECTION_STATUS.ERROR }),
    );

    notifyAlert({
      icon: StdIconId.Close,
      message: t('studyDetails.@notificationAlert', {
        studyName: study?.name ?? '',
        trajectoryName: trajectoryLabel,
        trajectoryType: hypothesis,
      }),
      content: errorMessage,
      type: 'error',
      filledIcon: true,
    });
  };

  const handleTrajectoryUpdate = async (
    rowId: string,
    trajectoryId: number,
    status?: RowStatus,
    trajectoryLabel?: string,
    errorMessage?: string,
  ) => {
    const indexArray = rowId.split('.').map((item) => parseInt(item));
    try {
      const trajectorySelected: DbTrajectory | null | undefined = getRowDataSelected(data, indexArray)?.trajectory;

      if ((status === 'empty' && trajectorySelected) || (status === 'emptyError' && trajectorySelected)) {
        if (status === 'empty') {
          await unlinkTrajectoryFromStudy(trajectoryId, study.id);
        }
        const warningMessages = await fetchWarningMessagesFromType(TRAJECTORY_TYPE.THERMAL_CAPACITY, study.id);
        dispatch?.({
          type: STUDY_ACTION.UPDATE_TRAJECTORY,
          payload: { trajectory: trajectorySelected, warningMessages, status },
        });
        const newEmptyTrajectory: Pick<HypothesisRowData, 'trajectory' | 'status'> = {
          trajectory: null,
          status: TRAJECTORY_SELECTION_STATUS.MISSING,
        };
        setData((prev) => setNestedData(prev, indexArray, newEmptyTrajectory));
      }
      if (status === 'success') {
        await linkTrajectoryToStudy(TRAJECTORY_TYPE.THERMAL_CAPACITY, trajectoryId, study.id);
        const result = await getStudyTrajectoriesWithWarnings(study.id, TRAJECTORY_TYPE.THERMAL_CAPACITY);
        const newTrajectory = result?.trajectories?.find((trajectory) => {
          if (data[indexArray[0]].hypothesis === OTHER_AREAS_LABEL) {
            return trajectory.loadArea === OTHER_AREAS;
          } else {
            return trajectory.loadArea === data[indexArray[0]].hypothesis;
          }
        });
        if (newTrajectory) {
          const payloadResult = { trajectory: newTrajectory, warningMessages: result.warningMessages, status };
          dispatch?.({ type: STUDY_ACTION.UPDATE_TRAJECTORY, payload: payloadResult });
        }
        const newEmptyTrajectory = {
          trajectory: newTrajectory ?? null,
          status: newTrajectory ? TRAJECTORY_SELECTION_STATUS.OK : TRAJECTORY_SELECTION_STATUS.MISSING,
        };
        setData((prev) => setNestedData(prev, indexArray, newEmptyTrajectory));
      }
      if (status === 'error' && trajectoryId != null && trajectoryLabel && !!errorMessage) {
        handleTrajectoryError(indexArray, trajectoryId, trajectoryLabel, errorMessage);
      }
    } catch (error) {
      if (indexArray.length) {
        handleTrajectoryError(indexArray, trajectoryId, trajectoryLabel ?? '', (error as Error).message);
      }
    }
  };

  const handleImportTrajectory = async (value: SelectOption) => {
    setFileStatus('loading');
    let newTrajectory: DbTrajectory;
    const rowSelectedData = getHypothesis(data, rowIdSelected);

    try {
      newTrajectory = await uploadTrajectoryWithTechnology(
        rowSelectedData.hypothesis,
        value.label,
        study.horizon,
        study.id,
        true,
        (progressValue: number) => {
          setProgress(+progressValue?.toFixed(0));
        },
        rowSelectedData?.technology,
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

  return (
    <div className="flex h-full w-full gap-6">
      <div className="flex h-fit w-28 flex-col gap-1 rounded border border-gray-400 p-2">
        <div className="border-b border-gray-400 pb-2">
          <SearchBar onSearch={() => {}} placeholder={t('studyDetails.@search_area')} />
        </div>
        <StdCheckboxGroupWrapper
          label={''}
          name={''}
          onChange={(valueChecked: string, isChecked?: boolean) =>
            void handleSelectionChange?.(valueChecked, isChecked ?? false)
          }
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
            handleSearch={handleTrajectorySearch}
            handleImport={async (rowId: string) => await handleFetchTrajectoriesFS(rowId)}
            isReadOnlyEnable={true}
            updateData={(rowId: string, value: unknown, status?: RowStatus, label?: string) =>
              void handleTrajectoryUpdate(rowId, value as number, status, label)
            }
            removeRow={(value: string, rowId?: string) => {
              void removeRow(value, Number(rowId));
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
              await handleImportTrajectory(value);
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
            if (rowToDelete) {
              await handleRemoveRow(rowToDelete?.value, rowToDelete.index);
              setIsDeletionModalOpen(false);
            }
          }}
        />
      )}
    </div>
  );
};

export default ThermalCapacityTab;
