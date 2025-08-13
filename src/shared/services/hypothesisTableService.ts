import { buildEmptyTrajectory, buildErrorTrajectory, setNestedData } from '@/shared/utils/trajectoryUtils.ts';
import { TRAJECTORY_SELECTION_STATUS, TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { notifyAlert } from '@/shared/notification/notification.tsx';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps.ts';
import { Dispatch, SetStateAction } from 'react';
import {
  DbTrajectory,
  FileInputStatus,
  HypothesisRowData,
  RowStatus,
  SelectOption,
  StudyActionType,
  StudyDTO,
  StudyState,
  StudyTrajectoriesData,
} from '@/shared/types';
import { STUDY_ACTION } from '@/shared/enum/study.ts';
import { ThermalOptions } from '@/mocks/data/list/names.ts';
import { sortWithFixedPosition } from '@/shared/utils/sortUtils.ts';
import {
  fetchTrajectoriesFromDB,
  fetchTrajectoriesFromFS,
  getStudyTrajectoriesWithWarnings,
  linkTrajectoryToStudy,
  unlinkTrajectoryFromStudy,
  uploadTrajectory,
} from '@/shared/services/trajectoryService.ts';
import { convertToFSSelectionOptionType, convertToSelectionOptionType } from '@/shared/utils/formFormatter.ts';
import { TFunction } from 'i18next';
import { OTHER_AREAS, OTHER_AREAS_LABEL } from '@/shared/const/studyConfig.ts';
import { fetchWarningMessagesFromType } from '@/shared/services/warningService.ts';

export const handleTrajectoryError = (
  type: TRAJECTORY_TYPE,
  rowIndex: number[],
  trajectory: { id: number; label: string },
  hypothesis: string,
  userName: string,
  setData: Dispatch<SetStateAction<HypothesisRowData[]>>,
  alert: { message: string; content: string },
) => {
  const newDbTrajectory = buildErrorTrajectory(type, trajectory.id, trajectory.label, userName, hypothesis);
  setData((prev) =>
    setNestedData(prev, rowIndex, { trajectory: newDbTrajectory, status: TRAJECTORY_SELECTION_STATUS.ERROR }),
  );

  notifyAlert({
    icon: StdIconId.Close,
    message: alert.message,
    content: alert.content,
    type: 'error',
    filledIcon: true,
  });
};

export const addRow = (
  type: TRAJECTORY_TYPE,
  value: string,
  dispatch: Dispatch<StudyActionType> | null,
  setCheckedValues: Dispatch<SetStateAction<string[]>>,
  setData: Dispatch<SetStateAction<HypothesisRowData[]>>,
) => {
  dispatch?.({
    type: STUDY_ACTION.ADD_TRAJECTORIES,
    payload: {
      [type]: {
        trajectories: [buildEmptyTrajectory(value, type)],
        warningMessages: [],
      },
    },
  });
  const hasSubRows = type === TRAJECTORY_TYPE.THERMAL_CAPACITY;
  const newRow: HypothesisRowData = {
    hypothesis: value,
    trajectory: null,
    status: TRAJECTORY_SELECTION_STATUS.MISSING,
    isDefault: false,
    subRows: hasSubRows
      ? ThermalOptions.map((option) => ({
          hypothesis: option,
          trajectory: null,
          status: TRAJECTORY_SELECTION_STATUS.MISSING,
          isDefault: true,
          subRows: null,
        }))
      : null,
  };
  setCheckedValues((prev) => [...prev, value]);
  setData((prev) => sortWithFixedPosition([newRow, ...prev]));
};

export const handleTrajectoryAttach = async (
  type: TRAJECTORY_TYPE,
  indexArray: number[],
  status: RowStatus,
  trajectory: DbTrajectory,
  study: StudyDTO,
  studyState: Partial<StudyState>,
  dispatch: Dispatch<StudyActionType> | null,
  setData: Dispatch<SetStateAction<HypothesisRowData[]>>,
  t: TFunction<'translation', undefined>,
  userName: string,
) => {
  try {
    await linkTrajectoryToStudy(type, trajectory.id, study.id);
    const result = await getStudyTrajectoriesWithWarnings(study.id, type);
    const newDbTrajectory = result?.trajectories?.find((resultTrajectory) => resultTrajectory.id === trajectory.id);

    if (newDbTrajectory) {
      if (studyState[newDbTrajectory.type]?.trajectories?.find((item) => item.area === newDbTrajectory.area)) {
        const payloadResult = { trajectory: newDbTrajectory, warningMessages: result.warningMessages, status };
        dispatch?.({ type: STUDY_ACTION.UPDATE_TRAJECTORY, payload: payloadResult });
      } else {
        const payloadResult: StudyTrajectoriesData = {
          [type]: {
            trajectories: [newDbTrajectory],
            warningMessages: result.warningMessages,
          },
        };
        dispatch?.({ type: STUDY_ACTION.ADD_TRAJECTORIES, payload: payloadResult });
      }
    }
    const newTrajectory = {
      trajectory: newDbTrajectory ?? null,
      status: newDbTrajectory ? TRAJECTORY_SELECTION_STATUS.OK : TRAJECTORY_SELECTION_STATUS.MISSING,
    };

    setData((prev) => setNestedData(prev, indexArray, newTrajectory));
  } catch (error) {
    if (indexArray.length) {
      const message = t('studyDetails.@notificationAlert', {
        studyName: study?.name ?? '',
        trajectoryName: trajectory.trajectoryName,
        trajectoryType: trajectory.area,
      });
      handleTrajectoryError(
        TRAJECTORY_TYPE.LOAD,
        indexArray,
        { id: trajectory.id, label: trajectory.trajectoryName },
        trajectory.area ?? '',
        userName,
        setData,
        { message, content: (error as Error).message },
      );
    }
  }
};

export const handleFetchTrajectoriesFS = async (
  type: TRAJECTORY_TYPE,
  rowId: string,
  setOptionsFS: Dispatch<SetStateAction<SelectOption[] | undefined>>,
  setRowIdSelected: Dispatch<SetStateAction<string>>,
  toggleModal: () => void,
  hypothesis?: string,
): Promise<void> => {
  try {
    //const indexArray = rowId.split('.').map((item) => parseInt(item));
    const results = await fetchTrajectoriesFromFS(type, '', hypothesis);
    setOptionsFS(convertToFSSelectionOptionType(results));
    setRowIdSelected(rowId);
    toggleModal();
  } catch {
    // Silent handler
  }
};

export const handleImportTrajectory = async (
  type: TRAJECTORY_TYPE,
  value: SelectOption,
  indexArray: number[],
  hypothesis: string,
  setFileStatus: Dispatch<SetStateAction<FileInputStatus>>,
  setProgress: Dispatch<SetStateAction<number>>,
  study: StudyDTO,
  studyState: Partial<StudyState>,
  dispatch: Dispatch<StudyActionType> | null,
  t: TFunction<'translation', undefined>,
  userName: string,
  setData: Dispatch<SetStateAction<HypothesisRowData[]>>,
  technology?: string,
) => {
  setFileStatus('loading');
  let newTrajectory: DbTrajectory;
  try {
    newTrajectory = await uploadTrajectory(
      type,
      value.label,
      study.horizon,
      study.id,
      hypothesis === OTHER_AREAS_LABEL ? OTHER_AREAS : hypothesis,
      (progressValue: number) => {
        setProgress(+progressValue?.toFixed(0));
      },
      !!TRAJECTORY_TYPE.THERMAL_CAPACITY,
      technology,
    );
    setFileStatus('success');
    if (newTrajectory.id != null) {
      await handleTrajectoryAttach(
        type,
        indexArray,
        'success',
        newTrajectory,
        study,
        studyState,
        dispatch,
        setData,
        t,
        userName,
      );
    }
  } catch (error) {
    setFileStatus('error');
    const message = t('studyDetails.@notificationAlert', {
      studyName: study?.name ?? '',
      trajectoryName: value.label,
      trajectoryType: hypothesis,
    });
    handleTrajectoryError(
      type,
      indexArray,
      { id: value.id, label: value.label },
      technology ?? hypothesis,
      userName,
      setData,
      { message, content: (error as Error).message },
    );
  }
};

export const handleTrajectoryUnlink = async (
  type: TRAJECTORY_TYPE,
  indexArray: number[],
  status: RowStatus,
  trajectorySelected: DbTrajectory,
  study: StudyDTO,
  dispatch: Dispatch<StudyActionType> | null,
  setData: Dispatch<SetStateAction<HypothesisRowData[]>>,
  userName: string,
  t: TFunction<'translation', undefined>,
) => {
  try {
    if (trajectorySelected && status) {
      if (status === 'empty') {
        await unlinkTrajectoryFromStudy(trajectorySelected.id, study.id);
      }
      const warningMessages = await fetchWarningMessagesFromType(type, study.id);
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
  } catch (error) {
    if (indexArray.length && trajectorySelected && trajectorySelected.area) {
      const message = t('studyDetails.@notificationAlert', {
        studyName: study?.name ?? '',
        trajectoryName: trajectorySelected.trajectoryName,
        trajectoryType: trajectorySelected.area,
      });
      handleTrajectoryError(
        type,
        indexArray,
        { id: trajectorySelected.id, label: trajectorySelected.trajectoryName },
        trajectorySelected.area,
        userName,
        setData,
        { message, content: (error as Error).message },
      );
    }
  }
};

export const handleTrajectorySearch = async (
  type: TRAJECTORY_TYPE,
  value: string,
  area: string,
  setDbTrajectories: Dispatch<SetStateAction<DbTrajectory[]>>,
  study: StudyDTO,
) => {
  try {
    const results = await fetchTrajectoriesFromDB(type, study.horizon, value, area);
    setDbTrajectories(results);
    return convertToSelectionOptionType(results);
  } catch {
    // silent handler
  }
};

export const removeRow = async (
  type: TRAJECTORY_TYPE,
  value: string,
  indexRow: number,
  dispatch: Dispatch<StudyActionType> | null,
  setCheckedValues: Dispatch<SetStateAction<string[]>>,
  setData: Dispatch<SetStateAction<HypothesisRowData[]>>,
  data: HypothesisRowData[],
  studyId?: number,
) => {
  if (indexRow && data[indexRow].hypothesis) {
    dispatch?.({
      type: STUDY_ACTION.DELETE_TRAJECTORY,
      payload: { area: data[indexRow].hypothesis, type },
    });
    if (studyId != null && data[indexRow]?.trajectory && data[indexRow]?.status === TRAJECTORY_SELECTION_STATUS.OK) {
      // TODO ANT-3698 for THERMAL CAPACITY
      await unlinkTrajectoryFromStudy(data[indexRow].trajectory.id, studyId);
    }
  }
  const newDataSorted = data.filter((item: HypothesisRowData) => item.hypothesis !== value);
  setData(sortWithFixedPosition(newDataSorted));
  if (value) {
    setCheckedValues((prev) => [...prev.filter((name) => name !== value)]);
  }
};

export const handleSelectionChange = async (
  type: TRAJECTORY_TYPE,
  value: string,
  indexRow: number,
  dispatch: Dispatch<StudyActionType> | null,
  setCheckedValues: Dispatch<SetStateAction<string[]>>,
  setData: Dispatch<SetStateAction<HypothesisRowData[]>>,
  setRowToDelete: Dispatch<SetStateAction<{ index: number; value?: string } | null>>,
  setIsDeletionModalOpen: Dispatch<SetStateAction<boolean>>,
  data: HypothesisRowData[],
  studyId?: number,
  isChecked?: boolean,
) => {
  if (isChecked) {
    addRow(type, value, dispatch, setCheckedValues, setData);
  } else {
    try {
      const hasTrajectoryLinkedToTechnology =
        indexRow != null
          ? (data[indexRow]?.subRows || [])?.some(
              (item: HypothesisRowData) => item.trajectory && item.status === TRAJECTORY_SELECTION_STATUS.OK,
            )
          : false;
      const hasTrajectoryLinkedToArea =
        indexRow != null
          ? data[indexRow].trajectory && data[indexRow].status === TRAJECTORY_SELECTION_STATUS.OK
          : false;
      const shouldOpenModal =
        (hasTrajectoryLinkedToArea && type !== TRAJECTORY_TYPE.THERMAL_CAPACITY) ||
        (hasTrajectoryLinkedToArea && hasTrajectoryLinkedToTechnology);
      if (shouldOpenModal) {
        setRowToDelete({ index: indexRow, value });
        setIsDeletionModalOpen(true);
      } else {
        await removeRow(type, value, indexRow, dispatch, setCheckedValues, setData, data, studyId);
      }
    } catch {
      // Silent handler
    }
  }
};
