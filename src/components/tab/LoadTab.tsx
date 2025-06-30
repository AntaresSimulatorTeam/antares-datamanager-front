/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect, useState } from 'react';
import {
  DbTrajectory,
  HypothesisRowData,
  LocationStudy,
  RowStatus,
  SelectOption,
  TrajectoryAreaData,
} from '@/shared/types';
import { TRAJECTORY_SELECTION_STATUS, TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { useTranslation } from 'react-i18next';
import { useStudy, useStudyDispatch } from '@/store/contexts/StudyContext.tsx';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  fetchTrajectoriesFromDB,
  fetchTrajectoriesFromFS,
  linkTrajectoryToStudy,
  unlinkTrajectoryFromStudy,
  uploadTrajectory,
} from '@/shared/services/trajectoryService.ts';
import { convertToFSSelectionOptionType, convertToSelectionOptionType } from '@/shared/utils/formFormatter.ts';
import SearchBar from '@/pages/pegase/home/components/SearchBar.tsx';
import { FileInputStatus, RdsCheckbox, RdsCheckboxGroupWrapper, RdsDivider } from 'rte-design-system-react';
import { getStudyTrajectories } from '@/shared/services/studyService.ts';
import { STUDY_ACTION } from '@/shared/enum/study.ts';
import { ReadOnlyObject } from '@common/data/stdTable/types/readOnly.type';
import getEditableHypothesisTableHeaders from '@/components/header/EditableHypothesisTableHeaders.tsx';
import { sortKeepLastName } from '@/shared/utils/sortUtils.tsx';
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
import { useFetchTrajectoriesLinked } from '@/hooks/useFetchTrajectoriesLinked.ts';

export type CheckBoxData = {
  name: string;
  isDefault: boolean;
};

interface LoadTabProps {
  defaultAreas: CheckBoxData[];
  areas: TrajectoryAreaData[];
}

const LoadTab = ({ defaultAreas, areas }: LoadTabProps) => {
  const { t } = useTranslation();
  const studyState = useStudy();
  const { user } = useUser();
  const location = useLocation();
  const study = (location.state as LocationStudy)?.study;
  const dispatch = useStudyDispatch();
  const navigate = useNavigate();
  const [readOnly, setReadOnly] = useState<ReadOnlyObject>({});
  const [readOnlyAreas, setReadOnlyAreas] = useState<string[]>([]);
  const [data, setData] = useState<HypothesisRowData[]>([]);
  const [areasOptions, setAreasOptions] = useState<CheckBoxData[]>([]);
  const [areasDefaultOptions, setAreasDefaultOptions] = useState<CheckBoxData[]>([]);
  const [checkedValues, setCheckedValues] = useState<string[]>([]);
  const { isModalOpen, toggleModal } = useNewStudyModal();
  const [isDeletionModalOpen, setIsDeletionModalOpen] = useState(false);
  const [rowIndexSelected, setRowIndexSelected] = useState<number>(0);
  const [optionsFS, setOptionsFS] = useState<SelectOption[]>();
  const [rowToDelete, setRowToDelete] = useState<{ index: number; value?: string } | null>(null);
  const [progress, setProgress] = useState(0);
  const [fileStatus, setFileStatus] = useState<FileInputStatus>('empty');
  const [isStudyGenerated, setIsStudyGenerated] = useState(
    studyState.studyStatus === StudyStatus.GENERATED || study.status === StudyStatus.GENERATED,
  );
  const { trajectoryLinked, emptyAreas } = useFetchTrajectoriesLinked(study?.id, TRAJECTORY_TYPE.LOAD);

  const setReadOnlyForGeneratedStudy = (rows: HypothesisRowData[]) => {
    const areaWithoutTrajectory = rows.map((row) => (row.trajectory == null ? row.hypothesis : null));
    const readOnlyRows = retrieveReadOnlyArea(rows, areaWithoutTrajectory.filter(Boolean) as string[]);
    setReadOnly(readOnlyRows);
  };

  useEffect(() => {
    const fetchHypothesis = () => {
      try {
        const defaultAreaListNotIncludedInList: string[] = [];
        // Build dropdown list options
        if (areas.length > 0) {
          const newArea = areas
            .map((trajectoryArea) => {
              if (!defaultAreas?.some((item) => item.name === trajectoryArea.areaName)) {
                return { name: trajectoryArea.areaName, isDefault: false };
              }
            })
            .filter(Boolean) as CheckBoxData[];
          setAreasDefaultOptions(defaultAreas);
          setAreasOptions(defaultAreas?.concat(newArea));

          // Find default area not included in areas trajectory list
          defaultAreas.forEach((defaultArea) => {
            if (!areas.some((trajectoryArea) => trajectoryArea.areaName === defaultArea.name)) {
              defaultAreaListNotIncludedInList.push(defaultArea.name);
            }
          });
        } else {
          setAreasOptions(defaultAreas);
        }

        const areaDefaultOther = [
          ...defaultAreas,
          {
            name: OTHER_AREAS,
            isDefault: true,
          },
        ];
        if (areaDefaultOther.length > 0) {
          // Build hypothesis table
          const areaDataDefault: HypothesisRowData[] = areaDefaultOther?.map((area) => {
            const trajectoryArea = trajectoryLinked?.find((trajectory) => trajectory.loadArea === area.name);
            return buildRowData(area.name, true, trajectoryArea);
          });
          const areaData = emptyAreas
            .map((trajectory: DbTrajectory) => {
              if (!areaDefaultOther.some((item: CheckBoxData) => item.name === trajectory.loadArea)) {
                return buildRowData(trajectory.loadArea as string, false, trajectory);
              }
            })
            .filter(Boolean) as HypothesisRowData[];

          const dataTrajectories =
            areaData.length > 0
              ? sortKeepLastName(areaDataDefault.concat(areaData), OTHER_AREAS_LABEL)
              : areaDataDefault;
          setData(dataTrajectories);

          if (isStudyGenerated) {
            setReadOnlyForGeneratedStudy(dataTrajectories);
          } else if (defaultAreaListNotIncludedInList.length > 0 && !isStudyGenerated) {
            const readOnlyRows = retrieveReadOnlyArea(dataTrajectories, defaultAreaListNotIncludedInList);
            setReadOnly(readOnlyRows);
            setReadOnlyAreas(defaultAreaListNotIncludedInList);
          }
        }

        if (defaultAreas.length > 0) {
          const defaultCheckList: string[] = defaultAreas.map((item) => item.name);
          const checkList = emptyAreas
            .map((trajectory) => {
              if (trajectory.loadArea) return trajectory.loadArea;
            })
            .filter(Boolean) as string[];
          setCheckedValues(defaultCheckList.concat(checkList));
        }
      } catch {
        //silent handler
      }
    };

    void fetchHypothesis();
  }, [trajectoryLinked, emptyAreas]);

  useEffect(() => {
    if (studyState.studyStatus === StudyStatus.GENERATED || study?.status === StudyStatus.GENERATED) {
      setIsStudyGenerated(true);
      setReadOnlyForGeneratedStudy(data);
    }
  }, [studyState.studyStatus, study?.status]);

  const handleFetchTrajectoriesFS = async (index: number): Promise<void> => {
    try {
      const results = await fetchTrajectoriesFromFS(TRAJECTORY_TYPE.LOAD);
      setOptionsFS(convertToFSSelectionOptionType(results));
      toggleModal();
    } finally {
      setRowIndexSelected(index);
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
      errorMessage,
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
      message: `Error: ${trajectoryLabel} cannot be saved for ${data[rowIndex]?.hypothesis}`,
      type: 'error',
      filledIcon: true,
      action: {
        label: t('studyDetails.@viewLog'),
        onClick: () => void navigate('/logs'),
      },
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
      if (status === 'empty' || status === 'emptyError') {
        if (status === 'empty') {
          await unlinkTrajectoryFromStudy(trajectoryId, study.id);
        }
        dispatch?.({
          type: STUDY_ACTION.EMPTY_LOAD_TRAJECTORY,
          payload: data[rowIndex].hypothesis === OTHER_AREAS_LABEL ? OTHER_AREAS : data[rowIndex].hypothesis,
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
        const newTrajectories = await getStudyTrajectories(study.id, TRAJECTORY_TYPE.LOAD);
        const newTrajectory = newTrajectories?.find((trajectory) => {
          if (data[rowIndex].hypothesis === OTHER_AREAS_LABEL) {
            return trajectory.loadArea === OTHER_AREAS;
          } else {
            return trajectory.loadArea === data[rowIndex].hypothesis;
          }
        });
        if (newTrajectory && newTrajectory.loadArea) {
          const isDefaultAreaNotInState =
            areasDefaultOptions?.some((area) => area.name === newTrajectory.loadArea) &&
            !studyState?.[`${TRAJECTORY_TYPE.LOAD}`]?.some(
              (trajectory) => trajectory.loadArea === newTrajectory.loadArea,
            );
          dispatch?.({
            type: isDefaultAreaNotInState ? STUDY_ACTION.ADD_TRAJECTORY_LOAD : STUDY_ACTION.UPDATE_LOAD_TRAJECTORY,
            payload: newTrajectory,
          });
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
        data[rowIndexSelected]?.hypothesis === OTHER_AREAS_LABEL ? OTHER_AREAS : data[rowIndexSelected]?.hypothesis,
        (progressValue: number) => {
          setProgress(+progressValue?.toFixed(0));
        },
      );
      setFileStatus('success');
      if (newTrajectory.id != null) {
        await handleTrajectoryUpdate(rowIndexSelected, newTrajectory.id, 'success', newTrajectory.trajectoryName);
      }
    } catch (error) {
      setFileStatus('error');
      await handleTrajectoryUpdate(rowIndexSelected, value.id, 'error', value.label, (error as Error)?.message);
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
    if (indexRow && data?.[indexRow]) {
      dispatch?.({
        type: STUDY_ACTION.DELETE_LOAD_TRAJECTORY,
        payload: data[indexRow].hypothesis,
      });
      if (data[indexRow]?.trajectory && data[indexRow]?.status === TRAJECTORY_SELECTION_STATUS.OK) {
        await unlinkTrajectoryFromStudy(data[indexRow].trajectory.id, study.id);
      }
    }
    const newDataSorted = data.filter((_row: HypothesisRowData, index: number) => index !== indexRow);
    setData(newDataSorted);
    if (readOnlyAreas.length > 0) {
      const readOnlyRows = retrieveReadOnlyArea(newDataSorted, readOnlyAreas);
      setReadOnly(readOnlyRows);
    }
    if (value) {
      setCheckedValues((prev) => [...prev.filter((name) => name !== value)]);
    }
  };

  const removeRow = async (valueToDelete?: string, indexRow?: number) => {
    if (indexRow && data[indexRow].trajectory && data[indexRow].status === TRAJECTORY_SELECTION_STATUS.OK) {
      setRowToDelete({ index: indexRow, value: valueToDelete });
      setIsDeletionModalOpen(true);
    } else {
      await handleRemoveRow(valueToDelete, indexRow);
    }
  };

  const addRow = (name: string) => {
    dispatch?.({
      type: STUDY_ACTION.ADD_TRAJECTORY_LOAD,
      payload: buildEmptyTrajectory(name, TRAJECTORY_TYPE.LOAD),
    });
    const newDataSorted = sortKeepLastName(
      [
        {
          hypothesis: name,
          trajectory: null,
          status: TRAJECTORY_SELECTION_STATUS.MISSING,
          isDefault: false,
        },
        ...data,
      ],
      OTHER_AREAS_LABEL,
    );

    setData(newDataSorted);
    if (readOnlyAreas.length > 0) {
      const readOnlyRows = retrieveReadOnlyArea(newDataSorted, readOnlyAreas);
      setReadOnly(readOnlyRows);
    }
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
        <div className="flex h-fit w-28 flex-col gap-1 rounded border border-gray-400 p-2">
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
                {index === Math.max(areasDefaultOptions?.length - 1, 1) && <RdsDivider extraClasses="mt-1" />}
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
            indexSelected={rowIndexSelected}
            handleSearch={handleTrajectorySearch}
            handleImport={async (index: number) => await handleFetchTrajectoriesFS(index)}
            removeRow={(value: string, rowIndex?: number) => void removeRow(value, rowIndex)}
            updateData={(rowIndex: number, value: unknown, status?: RowStatus, label?: string) =>
              void handleTrajectoryUpdate(rowIndex, value as number, status, label)
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
            area={data[rowIndexSelected]?.hypothesis}
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
