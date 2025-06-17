/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import StdSimpleTable from '@common/data/stdSimpleTable/StdSimpleTable.tsx';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  DbTrajectory,
  ErrorMessageType,
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
  getDefaultLoadHypothesis,
  getTrajectoryDataByTypeAndId,
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
import getLoadHypothesisTableHeaders from '@/components/header/LoadHypothesisTableHeader.tsx';
import { sortKeepLastName } from '@/shared/utils/sortUtils.tsx';
import {
  buildEmptyRowData,
  buildErrorTrajectory,
  buildRowData,
  removeDuplicate,
  retrieveReadOnlyArea,
} from '@/shared/utils/trajectoryUtils.ts';
import { AREA_OTHERS } from '@/shared/const/studyConfig.ts';
import { ImportTrajectoryModal } from '@common/modal/ImportTrajectoryModal.tsx';
import { useNewStudyModal } from '@/hooks/useNewStudyModal.ts';
import { DeletionModal } from '@common/modal/DeletionModal.tsx';
import { useUser } from '@/store/contexts/UserContext.tsx';
import { StudyStatus } from '@/shared/types/common/StudyStatus.type.ts';

export type CheckBoxData = {
  name: string;
  isDefault: boolean;
};

const LoadTab = () => {
  const { t } = useTranslation();
  const studyState = useStudy();
  const { user } = useUser();
  const location = useLocation();
  const study = (location.state as LocationStudy)?.study;
  const dispatch = useStudyDispatch();
  //const navigate = useNavigate();
  const [readOnly, setReadOnly] = useState<ReadOnlyObject>({});
  const [readOnlyAreas, setReadOnlyAreas] = useState<string[]>([]);
  const [data, setData] = useState<HypothesisRowData[]>([]);
  const [errorInfo, setErrorInfo] = useState<ErrorMessageType>({ index: 0, message: '' });
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
  const [isStudyGenerated, _] = useState(
    studyState.studyStatus === StudyStatus.GENERATED || study.status === StudyStatus.GENERATED,
  );

  const setReadOnlyForGeneratedStudy = (rows: HypothesisRowData[]) => {
    const areaWithoutTrajectory = rows.map((row) => {
      if (row.trajectory == null) {
        return row.hypothesis;
      } else {
        return null;
      }
    });
    const readOnlyRows = retrieveReadOnlyArea(rows, areaWithoutTrajectory.filter(Boolean) as string[]);
    setReadOnly(readOnlyRows);
  };

  useEffect(() => {
    const fetchHypothesis = async () => {
      try {
        const areaDefault: CheckBoxData[] = (await getDefaultLoadHypothesis())?.map((area) => ({
          name: area.name,
          isDefault: true,
        }));
        const trajectoryAreaId =
          studyState && studyState?.[`${TRAJECTORY_TYPE.AREA}`]
            ? studyState?.[`${TRAJECTORY_TYPE.AREA}`]?.[0]?.id
            : null;

        let newArea: CheckBoxData[];
        const defaultAreaListNotIncludedInList: string[] = [];
        if (trajectoryAreaId != null) {
          const trajectoryAreas = (await getTrajectoryDataByTypeAndId(
            TRAJECTORY_TYPE.AREA,
            trajectoryAreaId,
          )) as unknown as TrajectoryAreaData[];

          // Build dropdown list options
          if (trajectoryAreas.length > 0) {
            newArea = trajectoryAreas
              .map((trajectoryArea) => {
                if (!areaDefault?.some((item) => item.name === trajectoryArea.areaName)) {
                  return { name: trajectoryArea.areaName, isDefault: false };
                }
              })
              .filter(Boolean) as CheckBoxData[];
            setAreasDefaultOptions(areaDefault);
            setAreasOptions(areaDefault?.concat(newArea));

            // Find default area not included in areas trajectory list
            areaDefault.forEach((defaultArea) => {
              if (!trajectoryAreas.some((trajectoryArea) => trajectoryArea.areaName === defaultArea.name)) {
                defaultAreaListNotIncludedInList.push(defaultArea.name);
              }
            });
          } else {
            setAreasOptions(areaDefault);
          }
        }

        const trajectoryLinked = await getStudyTrajectories(study?.id, TRAJECTORY_TYPE.LOAD);
        if (trajectoryLinked?.length > 0) {
          dispatch?.({
            type: STUDY_ACTION.ADD_TRAJECTORIES_LOAD,
            payload: trajectoryLinked,
          });
        }
        areaDefault.push({
          name: AREA_OTHERS,
          isDefault: true,
        });

        // Build hypothesis table
        const areaDataDefault: HypothesisRowData[] = areaDefault?.map((area) => {
          const trajectoryArea = trajectoryLinked?.find((trajectory) => trajectory.loadArea === area.name);
          return buildRowData(area.name, true, trajectoryArea);
        });

        const emptyAreaSelected = (studyState[TRAJECTORY_TYPE.LOAD] as DbTrajectory[]) ?? [];
        const emptyArea = removeDuplicate(trajectoryLinked.concat(emptyAreaSelected));
        const areaData = emptyArea
          .map((trajectory: DbTrajectory) => {
            if (!areaDefault.some((item: CheckBoxData) => item.name === trajectory.loadArea)) {
              return buildRowData(trajectory.loadArea as string, false, trajectory);
            }
          })
          .filter(Boolean) as HypothesisRowData[];

        const dataTrajectories =
          areaData.length > 0 ? sortKeepLastName(areaDataDefault.concat(areaData), AREA_OTHERS) : areaDataDefault;
        setData(dataTrajectories);
        if (isStudyGenerated) {
          setReadOnlyForGeneratedStudy(dataTrajectories);
        } else if (defaultAreaListNotIncludedInList.length > 0 && !isStudyGenerated) {
          const readOnlyRows = retrieveReadOnlyArea(dataTrajectories, defaultAreaListNotIncludedInList);
          setReadOnly(readOnlyRows);
          setReadOnlyAreas(defaultAreaListNotIncludedInList);
        }

        if (areaDefault.length > 0) {
          const defaultCheckList: string[] = areaDefault.map((item) => item.name);
          const checkList = emptyArea
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
  }, []);

  useEffect(() => {
    setReadOnlyForGeneratedStudy(data);
  }, [studyState.studyStatus, study?.status]);

  const handleFetchTrajectoriesFS = async (index: number) => {
    try {
      const results = await fetchTrajectoriesFromFS(TRAJECTORY_TYPE.LOAD);
      setOptionsFS(convertToFSSelectionOptionType(results));
      toggleModal();
    } catch (error) {
      setErrorInfo({ index, message: t('studyDetails.@select_file_fs_error') });
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

    // TODO : Do not remove - uncomment
    // notifyAlert({
    //   icon: StdIconId.Close,
    //   message: `Error: ${trajectoryLabel} cannot be saved for ${data[rowIndex]?.hypothesis}`,
    //   type: 'error',
    //   filledIcon: true,
    //   action: {
    //     label: t('studyDetails.@viewLog'),
    //     onClick: () => void navigate('/logs'),
    //   },
    // });
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
          payload: data[rowIndex].hypothesis === 'Other areas' ? AREA_OTHERS : data[rowIndex].hypothesis,
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
          if (data[rowIndex].hypothesis === 'Other areas') {
            return trajectory.loadArea === AREA_OTHERS;
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
        data[rowIndexSelected]?.hypothesis === 'Other areas' ? AREA_OTHERS : data[rowIndexSelected]?.hypothesis,
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

  const handleRemoveRow = async (indexRow: number, value?: string) => {
    if (data?.[indexRow]) {
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

  const removeRow = async (indexRow: number, valueToDelete?: string) => {
    if (data[indexRow].trajectory && data[indexRow].status === TRAJECTORY_SELECTION_STATUS.OK) {
      setRowToDelete({ index: indexRow, value: valueToDelete });
      setIsDeletionModalOpen(true);
    } else {
      await handleRemoveRow(indexRow, valueToDelete);
    }
  };

  const addRow = (name: string) => {
    dispatch?.({
      type: STUDY_ACTION.ADD_TRAJECTORY_LOAD,
      payload: buildEmptyRowData(name),
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
      AREA_OTHERS,
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
        await removeRow(data.findIndex((row) => row.hypothesis === name));
        setCheckedValues((prev) => [...prev.filter((prevName) => prevName !== name)]);
      } catch {
        // Silent handler
      }
    }
  };

  const columns = useMemo(
    () =>
      getLoadHypothesisTableHeaders(
        t,
        handleFetchTrajectoriesFS,
        handleTrajectorySearch,
        errorInfo,
        setErrorInfo,
        studyState?.studyStatus,
        progress,
        fileStatus,
        rowIndexSelected,
      ),
    [data, studyState?.studyStatus, errorInfo, progress, fileStatus],
  );

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
            onChange={(value: string, status?: boolean) => void handleSelectionChange(value, status)}
            checkedValues={checkedValues}
          >
            {areasOptions?.map((area, index) => (
              <div key={`${index}-${area.name}`} className="my-1">
                <RdsCheckbox
                  key={`load-checkbox-${area.name}`}
                  label={area.name}
                  value={area.name}
                  name={''}
                  defaultChecked={area.isDefault}
                  disabled={area.isDefault || isStudyGenerated}
                  checked={area.isDefault || isStudyGenerated}
                />
                {index === Math.max(areasDefaultOptions?.length - 2, 0) && <RdsDivider extraClasses="mt-1" />}
              </div>
            ))}
          </RdsCheckboxGroupWrapper>
        </div>
        <div className="flex h-fit w-full">
          <StdSimpleTable
            id="load-table"
            data={data}
            columns={columns}
            enableColumnResizing={false}
            enableReadOnly={true}
            state={{ readOnly }}
            updateData={(rowIndex: number, value: unknown, status?: RowStatus, label?: string) => {
              void handleTrajectoryUpdate(rowIndex, value as number, status, label);
            }}
            removeRow={(rowIndex: number, value: unknown) => {
              void removeRow(rowIndex, value as string);
            }}
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
                await handleRemoveRow(rowToDelete.index, rowToDelete?.value);
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
