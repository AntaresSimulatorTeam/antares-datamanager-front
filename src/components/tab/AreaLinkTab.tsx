/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState } from 'react';
import StdSimpleTable from '@common/data/stdSimpleTable/StdSimpleTable.tsx';
import { ReadOnlyObject } from '@common/data/stdTable/types/readOnly.type';
import getHypothesisTableHeaders from '@/components/header/HypothesisTableHeaders.tsx';
import { useNewStudyModal } from '@/hooks/useNewStudyModal.ts';
import { useTranslation } from 'react-i18next';
import {
  fetchTrajectoriesFromDB,
  fetchTrajectoriesFromFS,
  getStudyTrajectoriesWithWarnings,
  getTrajectoryDataByTypeAndId,
  linkTrajectoryToStudy,
  unlinkAllTrajectoriesFromStudy,
  unlinkTrajectoryFromStudy,
  uploadTrajectory,
} from '@/shared/services/trajectoryService.ts';
import { TRAJECTORY_SELECTION_STATUS, TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import {
  DbTrajectory,
  HypothesisRowData,
  LocationStudy,
  RowStatus,
  SelectOption,
  StudyActionType,
  TrajectoryAreaDataScheme,
  TrajectoryBackendError,
  TrajectoryLinkDataScheme,
  TrajectoryViewData,
} from '@/shared/types';
import { convertToFSSelectionOptionType, convertToSelectionOptionType } from '@/shared/utils/formFormatter';
import { ImportTrajectoryModal } from '@common/modal/ImportTrajectoryModal.tsx';
import { useStudy, useStudyDispatch } from '@/store/contexts/StudyContext';
import { STUDY_ACTION } from '@/shared/enum/study.ts';
import { StudyStatus } from '@/shared/types/common/StudyStatus.type.ts';
import { buildErrorTrajectory, getStatus } from '@/shared/utils/trajectoryUtils.ts';
import { getStudyById } from '@/shared/services/studyService.ts';
import { TrajectoryDataVisualisation } from '@common/modal/TrajectoryDataVisualisation.tsx';
import { generateTrajectoryViewHeader } from '@/components/header/TrajectoryViewHeader.tsx';
import { useLocation } from 'react-router-dom';
import { useUser } from '@/store/contexts/UserContext.tsx';
import { ErrorMessageType } from '@/shared/types/Generic.type.ts';
import { computeReadOnlyState } from '@/shared/utils/computeReadOnlyState';
import { FileInputStatus } from 'rte-design-system-react';
import { notifyAlert } from '@/shared/notification/notification.tsx';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps.ts';
import { AreaDeletionConfirmationModal } from '@common/modal/AreaDeletionConfirmationModal.tsx';
import { isBusinessError } from '@/shared/utils/errorUtils.ts';

interface AreaLinkTabProps {
  setErrorMessage: Dispatch<SetStateAction<string>>;
}

export const AreaLinkTab = ({ setErrorMessage }: AreaLinkTabProps) => {
  const studyState = useStudy();
  const location = useLocation();
  const study = (location.state as LocationStudy)?.study;
  const { isModalOpen, toggleModal } = useNewStudyModal();
  const dispatch = useStudyDispatch();
  const { t } = useTranslation();
  const { user } = useUser();
  const [optionsFS, setOptionsFS] = useState<SelectOption[]>();
  const [rowIndexSelected, setRowIndexSelected] = useState<number>(0);
  const [errorInfo, setErrorInfo] = useState<ErrorMessageType>({ index: 0, message: '' });
  const [trajectoryData, setTrajectoryData] = useState<TrajectoryViewData | undefined>();
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [data, setData] = useState<HypothesisRowData[]>([]);
  const [progress, setProgress] = useState(0);
  const [fileStatus, setFileStatus] = useState<FileInputStatus>('empty');
  const [readOnly, setReadOnly] = useState<ReadOnlyObject>({ '0': false, '1': false });
  const [isAreaDeletionConfirmOpen, setIsAreaDeletionConfirmOpen] = useState(false);

  const areaTrajectory = data[0]?.trajectory;
  const areaStatus = data[0]?.status;
  const studyStatus = studyState.studyStatus!;
  const hasLinkTrajectory = !!studyState?.[TRAJECTORY_TYPE.LINK];

  useEffect(() => {
    setReadOnly(computeReadOnlyState(areaTrajectory, areaStatus, studyStatus, hasLinkTrajectory));
  }, [areaTrajectory, areaStatus, studyStatus, hasLinkTrajectory]);

  useEffect(() => {
    const getTrajectories = async () => {
      let trajectoryAreaResult;
      let trajectoryLinkResult;
      let studyData;
      try {
        setErrorMessage('');
        [studyData, trajectoryAreaResult, trajectoryLinkResult] = await Promise.all([
          getStudyById(study.id),
          getStudyTrajectoriesWithWarnings(study.id, TRAJECTORY_TYPE.AREA),
          getStudyTrajectoriesWithWarnings(study.id, TRAJECTORY_TYPE.LINK),
        ]);
        const trajectoryArea: DbTrajectory | null = trajectoryAreaResult?.trajectories[0] ?? null;
        const trajectoryLink: DbTrajectory | null = trajectoryLinkResult?.trajectories[0] ?? null;
        dispatch?.({
          type: STUDY_ACTION.ADD_TRAJECTORIES,
          payload: {
            ...(trajectoryArea && { [TRAJECTORY_TYPE.AREA]: trajectoryAreaResult }),
            ...(trajectoryLink && { [TRAJECTORY_TYPE.LINK]: trajectoryLinkResult }),
          },
        });
        setData([
          {
            hypothesis: 'Areas',
            trajectory: trajectoryArea,
            status: trajectoryArea ? TRAJECTORY_SELECTION_STATUS.OK : TRAJECTORY_SELECTION_STATUS.MISSING,
          },
          {
            hypothesis: 'Links',
            trajectory: trajectoryLink,
            status: trajectoryLink ? TRAJECTORY_SELECTION_STATUS.OK : TRAJECTORY_SELECTION_STATUS.MISSING,
          },
        ]);
        setReadOnly({
          '0': false,
          '1': !trajectoryArea || (!trajectoryLink && studyData?.status === StudyStatus.GENERATED),
        });
      } catch {
        //Silent handler
      }
    };
    void getTrajectories();
  }, [dispatch, setErrorMessage, study.id]);

  const handleFetchTrajectoriesFS = async (index: number) => {
    try {
      const results = await fetchTrajectoriesFromFS(index === 0 ? TRAJECTORY_TYPE.AREA : TRAJECTORY_TYPE.LINK);
      setOptionsFS(convertToFSSelectionOptionType(results));
      toggleModal();
    } catch (error) {
      setErrorInfo({ index, message: t('studyDetails.@select_file_fs_error') });
    } finally {
      setRowIndexSelected(index);
    }
  };

  const handleTrajectoryError = async (
    rowIndex: number,
    trajectoryId: number,
    trajectoryLabel: string,
    errorMessage?: string,
  ) => {
    try {
      const newDbTrajectory = buildErrorTrajectory(
        rowIndex === 0 ? TRAJECTORY_TYPE.AREA : TRAJECTORY_TYPE.LINK,
        trajectoryId,
        trajectoryLabel,
        user?.profile?.sub ?? null,
        undefined,
      );

      //Case: area control failed and a trajectory Links is linked to the study with ok status
      const shouldUnlink =
        rowIndex === 0 && data[1]?.trajectory && data[1]?.status !== TRAJECTORY_SELECTION_STATUS.ERROR;
      if (shouldUnlink && data[1]?.trajectory?.id) {
        await unlinkTrajectoryFromStudy(data[1]?.trajectory?.id, study.id);
        dispatch?.({
          type: STUDY_ACTION.CLEAR_TRAJECTORY_BY_TYPE,
          payload: [TRAJECTORY_TYPE.LINK],
        } as StudyActionType);
      }
      setData((prev) =>
        prev.map((item, index) => {
          if (index === rowIndex) {
            return {
              ...item,
              trajectory: newDbTrajectory,
              status: TRAJECTORY_SELECTION_STATUS.ERROR,
            };
          } else if (shouldUnlink) {
            return {
              ...item,
              trajectory: null,
              status: TRAJECTORY_SELECTION_STATUS.MISSING,
            };
          } else {
            return item;
          }
        }),
      );

      setReadOnly({ '0': false, '1': false });
      notifyAlert({
        icon: StdIconId.Close,
        message: t('studyDetails.@notificationAlert', {
          studyName: study?.name ?? '',
          trajectoryName: trajectoryLabel,
          trajectoryType: rowIndex === 0 ? TRAJECTORY_TYPE.AREA : TRAJECTORY_TYPE.LINK,
        }),
        content: errorMessage,
        type: 'error',
        filledIcon: true,
      });
    } catch {
      //Silent handler
    }
  };

  const unlinkWithConfirmationCheck = async (trajectoryId: number, rowIndex: number): Promise<void> => {
    try {
      await unlinkTrajectoryFromStudy(trajectoryId, study.id);
      setErrorMessage(t('studyDetails.@add_trajectories_message'));
      dispatch?.({
        type: STUDY_ACTION.CLEAR_TRAJECTORY_BY_TYPE,
        payload: rowIndex === 0 ? [TRAJECTORY_TYPE.AREA] : [TRAJECTORY_TYPE.LINK],
      });
      const hasLinks = rowIndex === 0 && data[1].trajectory;
      setData((prev) =>
        prev.map((item, index) =>
          index === rowIndex || hasLinks
            ? {
                ...item,
                trajectory: null,
                status: TRAJECTORY_SELECTION_STATUS.MISSING,
              }
            : item,
        ),
      );
      setReadOnly({ '0': false, '1': rowIndex === 0 });
    } catch (error) {
      if ((error as TrajectoryBackendError).message.includes('Confirmation required')) {
        setRowIndexSelected(rowIndex);
        setIsAreaDeletionConfirmOpen(true);
      }
    }
  };

  const handleTrajectoryDeletion = async (rowIndex: number, status: RowStatus, trajectoryId: number) => {
    if (status === 'empty') {
      await unlinkWithConfirmationCheck(trajectoryId, rowIndex);
    } else if (status === 'emptyError') {
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
    }
  };

  const handleConfirmedAreaDeletion = async () => {
    await unlinkAllTrajectoriesFromStudy(study.id);

    dispatch?.({ type: STUDY_ACTION.RESET_STUDY_STATE });
    setData([
      { hypothesis: 'Areas', trajectory: null, status: TRAJECTORY_SELECTION_STATUS.MISSING },
      { hypothesis: 'Links', trajectory: null, status: TRAJECTORY_SELECTION_STATUS.MISSING },
    ]);

    setReadOnly({ '0': false, '1': true });
    setIsAreaDeletionConfirmOpen(false);
    setErrorMessage(t('studyDetails.@add_trajectories_message'));
  };

  const handleTrajectoryUpdate = async (
    rowIndex: number,
    trajectoryId: number,
    status: RowStatus,
    trajectoryLabel?: string,
    errorMessage?: string,
  ) => {
    try {
      if (trajectoryId != null && status === 'success') {
        setErrorMessage('');
        const trajectoryType = rowIndex === 0 ? TRAJECTORY_TYPE.AREA : TRAJECTORY_TYPE.LINK;
        await linkTrajectoryToStudy(trajectoryType, trajectoryId, study.id);
        const result = await getStudyTrajectoriesWithWarnings(study.id, trajectoryType);
        const newTrajectory = result?.trajectories?.[0];
        if (newTrajectory) {
          dispatch?.({
            type: STUDY_ACTION.ADD_TRAJECTORIES,
            payload: { [trajectoryType]: result },
          });
        }
        setData((prev) =>
          prev.map((item, index) =>
            index === rowIndex
              ? {
                  ...item,
                  trajectory: newTrajectory ?? null,
                  status: getStatus(newTrajectory ? status : 'empty'),
                }
              : item,
          ),
        );
        setReadOnly({ '0': false, '1': false });
      }

      // Handle deletion case for areas
      if (
        (rowIndex != null && trajectoryId != null && status === 'empty') ||
        (rowIndex != null && trajectoryId != null && status === 'emptyError')
      ) {
        await handleTrajectoryDeletion(rowIndex, status, trajectoryId);
      }

      if (rowIndex != null && status === 'error' && trajectoryId != null && trajectoryLabel) {
        await handleTrajectoryError(rowIndex, trajectoryId, trajectoryLabel, errorMessage);
      }
    } catch (error) {
      if (rowIndex != null) {
        await handleTrajectoryError(rowIndex, trajectoryId, trajectoryLabel ?? '', (error as Error).message);
      }
    }
  };

  const handleTrajectorySearch = useCallback(
    async (value?: string, index?: number): Promise<SelectOption[] | undefined> => {
      try {
        const results = await fetchTrajectoriesFromDB(
          index === 0 ? TRAJECTORY_TYPE.AREA : TRAJECTORY_TYPE.LINK,
          study.horizon,
          value,
          '',
        );
        return convertToSelectionOptionType(results);
      } catch {
        // silent handler
      }
    },
    [study.horizon],
  );

  const handleViewTrajectory = async (index: number) => {
    const trajectory = data[index].trajectory as unknown as DbTrajectory;
    if (trajectory) {
      try {
        const results = await getTrajectoryDataByTypeAndId(trajectory.type, trajectory.id);
        const columns =
          trajectory.type === TRAJECTORY_TYPE.AREA
            ? generateTrajectoryViewHeader(TrajectoryAreaDataScheme, t, 350)
            : generateTrajectoryViewHeader(TrajectoryLinkDataScheme, t, 128);
        setTrajectoryData({
          trajectory,
          data: results,
          columns,
        });
        setIsViewModalOpen(true);
      } catch (error) {
        //Silent error
      }
    } else {
      return;
    }
  };

  const handleImportTrajectory = async (value: SelectOption) => {
    setFileStatus('loading');
    let newTrajectory: DbTrajectory;
    try {
      newTrajectory = await uploadTrajectory(
        rowIndexSelected === 0 ? TRAJECTORY_TYPE.AREA : TRAJECTORY_TYPE.LINK,
        value.label,
        study.horizon,
        study.id,
        data[rowIndexSelected]?.hypothesis,
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
      if (isBusinessError(error)) {
        await handleTrajectoryUpdate(
          rowIndexSelected,
          value.id,
          'error',
          value.label,
          error?.antaresErrorMessage ?? '',
        );
      }
    }
  };

  const columns = useMemo(
    () =>
      getHypothesisTableHeaders(
        t,
        handleTrajectoryUpdate,
        handleFetchTrajectoriesFS,
        handleTrajectorySearch,
        handleViewTrajectory,
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
    <div className="flex h-fit w-full">
      <StdSimpleTable
        id="area-link-table"
        data={data}
        columns={columns}
        columnSize="meta"
        enableColumnResizing={false}
        enableReadOnly={true}
        state={{ readOnly }}
      />
      {isModalOpen && (
        <ImportTrajectoryModal
          options={optionsFS}
          onClose={async (value?: SelectOption) => {
            toggleModal();
            if (value != null) {
              await handleImportTrajectory(value);
            }
          }}
          trajectoryType={rowIndexSelected === 0 ? TRAJECTORY_TYPE.AREA : TRAJECTORY_TYPE.LINK}
        />
      )}
      {isViewModalOpen && trajectoryData && (
        <TrajectoryDataVisualisation trajectoryData={trajectoryData} onClose={() => setIsViewModalOpen(false)} />
      )}
      <AreaDeletionConfirmationModal
        isOpen={isAreaDeletionConfirmOpen}
        onClose={() => setIsAreaDeletionConfirmOpen(false)}
        onConfirm={handleConfirmedAreaDeletion}
      />
    </div>
  );
};
