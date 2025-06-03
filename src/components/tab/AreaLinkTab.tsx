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
  getTrajectoryDataByTypeAndId,
  linkTrajectoryToStudy,
  unlinkTrajectoryFromStudy,
  uploadTrajectory,
} from '@/shared/services/trajectoryService.ts';
import { TRAJECTORY_SELECTION_STATUS, TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import {
  DbTrajectory,
  HypothesisRowData,
  LocationState,
  RowStatus,
  SelectOption,
  StudyActionType,
  StudyDTO,
  TrajectoryAreaDataScheme,
  TrajectoryLinkDataScheme,
  TrajectoryViewData,
} from '@/shared/types';
import { convertToFSSelectionOptionType, convertToSelectionOptionType } from '@/shared/utils/formFormatter';
import { ImportTrajectoryModal } from '@common/modal/ImportTrajectoryModal.tsx';
import { useStudy, useStudyDispatch } from '@/store/contexts/StudyContext';
import { STUDY_ACTION } from '@/shared/enum/study.ts';
import { StudyStatus } from '@/shared/types/common/StudyStatus.type.ts';
import { buildErrorTrajectory, getStatus } from '@/shared/utils/trajectoryUtils.ts';
import { getStudyById, getStudyTrajectories } from '@/shared/services/studyService.ts';
import { TrajectoryDataVisualisation } from '@common/modal/TrajectoryDataVisualisation.tsx';
import { generateTrajectoryViewHeader } from '@/components/header/TrajectoryViewHeader.tsx';
import { useLocation } from 'react-router-dom';
import { useUser } from '@/store/contexts/UserContext.tsx';
import { ErrorMessageType } from '@/shared/types/Generic.type.ts';
import { computeReadOnlyState } from '@/shared/utils/computeReadOnlyState';
import { BackendError } from '@/shared/utils/errrorHandler.ts';
import { FileInputStatus } from 'rte-design-system-react';

interface AreaLinkTabProps {
  setErrorMessage: Dispatch<SetStateAction<string>>;
}

const AreaLinkTab = ({ setErrorMessage }: AreaLinkTabProps) => {
  const studyState = useStudy();
  const location = useLocation();
  const study = (location.state as LocationState)?.study;
  const { isModalOpen, toggleModal } = useNewStudyModal();
  const dispatch = useStudyDispatch();
  const { t } = useTranslation();
  const { user } = useUser();
  const [optionsFS, setOptionsFS] = useState<SelectOption[]>();
  const [rowIndexSelected, setRowIndexSelected] = useState<number>(0);
  const [errorInfo, setErrorInfo] = useState<ErrorMessageType>({ index: 0, message: '' });
  const [trajectoryData, setTrajectoryData] = useState<TrajectoryViewData | undefined>();
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [data, setData] = useState<HypothesisRowData[]>([
    {
      hypothesis: 'Areas',
      trajectory: null,
      status: TRAJECTORY_SELECTION_STATUS.MISSING,
    },
    {
      hypothesis: 'Links',
      trajectory: null,
      status: TRAJECTORY_SELECTION_STATUS.MISSING,
    },
  ]);
  const [progress, setProgress] = useState(0);
  const [fileStatus, setFileStatus] = useState<FileInputStatus>('empty');
  const [readOnly, setReadOnly] = useState<ReadOnlyObject>({ '0': false, '1': false });

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
          getStudyTrajectories(study.id, TRAJECTORY_TYPE.AREA),
          getStudyTrajectories(study.id, TRAJECTORY_TYPE.LINK),
        ]);
        if (
          (trajectoryAreaResult as DbTrajectory[])?.length > 0 ||
          (trajectoryLinkResult as DbTrajectory[])?.length > 0
        ) {
          const trajectoryArea: DbTrajectory = (trajectoryAreaResult as DbTrajectory[])[0] ?? null;
          const trajectoryLink: DbTrajectory = (trajectoryLinkResult as DbTrajectory[])[0] ?? null;
          dispatch?.({
            type: STUDY_ACTION.ADD_AREA_TRAJECTORIES,
            payload: [trajectoryArea && { ...trajectoryArea }, trajectoryLink && { ...trajectoryLink }].filter(Boolean),
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
            '1': !trajectoryArea || (!trajectoryLink && (studyData as StudyDTO)?.status === StudyStatus.GENERATED),
          });
        }
      } catch {
        //Silent handler
      }
    };
    void getTrajectories();
  }, []);

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
    index: number,
    trajectoryId: number,
    trajectoryLabel: string,
    errorMessage?: string,
  ) => {
    try {
      const newDbTrajectory = buildErrorTrajectory(
        index === 0 ? TRAJECTORY_TYPE.AREA : TRAJECTORY_TYPE.LINK,
        trajectoryId,
        trajectoryLabel,
        errorMessage,
        user?.profile?.sub,
      );

      //Case: area control failed and a trajectory Links is linked to the study with ok status
      if (index === 0 && data[1]?.trajectory && data[1]?.status != TRAJECTORY_SELECTION_STATUS.ERROR) {
        await unlinkTrajectoryFromStudy(data[1].trajectory.id, study.id);
        dispatch?.({
          type: STUDY_ACTION.CLEAR_LINK_TRAJECTORY,
        } as StudyActionType);
        setData((prev) => {
          prev[0].trajectory = newDbTrajectory;
          prev[0].status = TRAJECTORY_SELECTION_STATUS.ERROR;
          prev[1].trajectory = null;
          prev[1].status = TRAJECTORY_SELECTION_STATUS.MISSING;
          return prev;
        });
      } else {
        //Case: links control failed and a trajectory area is linked to the study
        setData((prev) => {
          prev[index].trajectory = newDbTrajectory;
          prev[index].status = TRAJECTORY_SELECTION_STATUS.ERROR;
          return prev;
        });
      }
      setReadOnly({ '0': false, '1': false });
    } catch {
      //Silent handler
    }
  };

  const handleTrajectoryDeletion = async (index: number, status: RowStatus, trajectoryId: number) => {
    if (index === 0 && data[1].trajectory) {
      if (status === 'empty') {
        await unlinkTrajectoryFromStudy(trajectoryId, study.id);
        if (data[1]?.status != TRAJECTORY_SELECTION_STATUS.ERROR) {
          await unlinkTrajectoryFromStudy(data[1].trajectory.id, study.id);
        }
      }
      setErrorMessage(t('studyDetails.@add_trajectories_message'));
      dispatch?.({
        type: STUDY_ACTION.CLEAR_AREA_AND_LINK_TRAJECTORY,
      } as StudyActionType);
      setData((prev) => {
        prev[0].trajectory = null;
        prev[0].status = TRAJECTORY_SELECTION_STATUS.MISSING;
        prev[1].trajectory = null;
        prev[1].status = TRAJECTORY_SELECTION_STATUS.MISSING;
        return prev;
      });
      setReadOnly({ '0': false, '1': true });
    } else {
      if (status === 'empty') {
        await unlinkTrajectoryFromStudy(trajectoryId, study.id);
      }

      index === 0 ? setErrorMessage(t('studyDetails.@add_trajectories_message')) : setErrorMessage('');
      dispatch?.({
        type: index === 0 ? STUDY_ACTION.CLEAR_AREA_TRAJECTORY : STUDY_ACTION.CLEAR_LINK_TRAJECTORY,
      } as StudyActionType);
      setData((prev) => {
        prev[index].trajectory = null;
        prev[index].status = TRAJECTORY_SELECTION_STATUS.MISSING;
        return prev;
      });
      setReadOnly({ '0': false, '1': index === 0 });
    }
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
        await linkTrajectoryToStudy(
          rowIndex === 0 ? TRAJECTORY_TYPE.AREA : TRAJECTORY_TYPE.LINK,
          trajectoryId,
          study.id,
        )
          .then((payload) => {
            dispatch?.({
              type: rowIndex === 0 ? STUDY_ACTION.ADD_TRAJECTORY_AREA : STUDY_ACTION.ADD_TRAJECTORY_LINK,
              payload,
            } as StudyActionType);
            setData((prev) => {
              if (rowIndex != null && prev[rowIndex]) {
                prev[rowIndex].trajectory = payload;
                prev[rowIndex].status = getStatus(status);
              }
              return prev;
            });
            setReadOnly({ '0': false, '1': false });
          })
          .catch(async (error: unknown) => {
            if (rowIndex != null) {
              await handleTrajectoryError(
                rowIndex,
                trajectoryId,
                trajectoryLabel ?? '',
                (error as BackendError).antaresErrorMessage,
              );
            }
          });
      }

      // Handle deletion case for areas
      if (
        (rowIndex != null && trajectoryId != null && status === 'empty') ||
        (rowIndex != null && trajectoryId != null && status === 'emptyError')
      ) {
        await handleTrajectoryDeletion(rowIndex, status, trajectoryId);
      }

      if (rowIndex != null && status === 'error' && trajectoryId != null && trajectoryLabel && !!errorMessage) {
        await handleTrajectoryError(rowIndex, trajectoryId, trajectoryLabel, errorMessage);
      }
    } catch (error) {
      // Reset trajectory line to initial state
      setData((prev) => {
        if (rowIndex != null && prev[rowIndex]) {
          prev[rowIndex].trajectory = null;
          prev[rowIndex].status = TRAJECTORY_SELECTION_STATUS.MISSING;
        }
        return prev;
      });
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
        TRAJECTORY_TYPE.LOAD,
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
      await handleTrajectoryUpdate(rowIndexSelected, value.id, 'error', value.label, (error as Error)?.message);
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
    </div>
  );
};

export default AreaLinkTab;
