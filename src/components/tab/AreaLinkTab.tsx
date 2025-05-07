/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
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
import { getStatus } from '@/shared/utils/trajectoryUtils.ts';
import { getStudyById, getStudyTrajectories } from '@/shared/services/studyService.ts';
import { TrajectoryDataVisualisation } from '@common/modal/TrajectoryDataVisualisation.tsx';
import { generateTrajectoryViewHeader } from '@/components/header/TrajectoryViewHeader.tsx';
import { useLocation } from 'react-router-dom';
import { useUser } from '@/store/contexts/UserContext.tsx';

export interface ErrorMessageType {
  index: number;
  message: string;
}

const AreaLinkTab = () => {
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

  const [readOnly, setReadOnly] = useState<ReadOnlyObject>({ '0': false, '1': false });

  useEffect(() => {
    setReadOnly({
      '0': false,
      '1':
        !data[0].trajectory ||
        (!studyState[`${TRAJECTORY_TYPE.LINK}`] && studyState?.studyStatus === StudyStatus.GENERATED),
    });
  }, [studyState?.studyStatus]);

  useEffect(() => {
    const getTrajectories = async () => {
      let trajectoryAreaResult;
      let trajectoryLinkResult;
      let studyData;
      try {
        [studyData, trajectoryAreaResult, trajectoryLinkResult] = await Promise.all([
          getStudyById(study.id),
          getStudyTrajectories(study.id, TRAJECTORY_TYPE.AREA),
          getStudyTrajectories(study.id, TRAJECTORY_TYPE.LINK),
        ]);
        if (
          (trajectoryAreaResult as DbTrajectory[])?.length > 0 ||
          (trajectoryLinkResult as DbTrajectory[])?.length > 0
        ) {
          const trajectoryArea = (trajectoryAreaResult as DbTrajectory[])[0] ?? null;
          const trajectoryLink = (trajectoryLinkResult as DbTrajectory[])[0] ?? null;
          dispatch?.({
            type: STUDY_ACTION.ADD_TRAJECTORIES,
            payload: [
              trajectoryArea && { ...trajectoryArea, state: TRAJECTORY_SELECTION_STATUS.OK },
              trajectoryLink && {
                ...trajectoryLink,
                state: TRAJECTORY_SELECTION_STATUS.OK,
              },
            ].filter(Boolean),
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

  const handleTrajectoryError = async (index: number, trajectoryId: number, trajectoryLabel: string) => {
    try {
      const newDbTrajectory = {
        id: trajectoryId,
        trajectoryName: trajectoryLabel,
        type: index === 0 ? TRAJECTORY_TYPE.AREA : TRAJECTORY_TYPE.LINK,
        version: 0,
        userName: user?.profile?.sub ?? '',
        creationDate: new Date(),
        state: TRAJECTORY_SELECTION_STATUS.ERROR,
        messages: [],
      };
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
      dispatch?.({
        type: index === 0 ? STUDY_ACTION.ADD_TRAJECTORY_AREA : STUDY_ACTION.ADD_TRAJECTORY_LINK,
        payload: newDbTrajectory,
      } as StudyActionType);
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
    trajectoryId: number,
    status?: RowStatus,
    trajectoryLabel?: string | null,
    index?: number | undefined,
  ) => {
    try {
      if (trajectoryId != null && status === 'success') {
        await linkTrajectoryToStudy(index === 0 ? TRAJECTORY_TYPE.AREA : TRAJECTORY_TYPE.LINK, trajectoryId, study.id)
          .then((payload) => {
            dispatch?.({
              type: index === 0 ? STUDY_ACTION.ADD_TRAJECTORY_AREA : STUDY_ACTION.ADD_TRAJECTORY_LINK,
              payload: { ...payload, state: TRAJECTORY_SELECTION_STATUS.OK },
            } as StudyActionType);
            setData((prev) => {
              if (index != null && prev[index]) {
                prev[index].trajectory = payload as DbTrajectory;
                prev[index].status = getStatus(status);
              }
              return prev;
            });
            setReadOnly({ '0': false, '1': false });
          })
          .catch(async () => {
            if (index != null) {
              await handleTrajectoryError(index, trajectoryId, trajectoryLabel ?? '');
            }
          });
      }

      // Handle deletion case for areas
      if (
        (index != null && trajectoryId != null && status === 'empty') ||
        (index != null && trajectoryId != null && status === 'emptyError')
      ) {
        await handleTrajectoryDeletion(index, status, trajectoryId);
      }

      if (index != null && status === 'error' && trajectoryId != null && trajectoryLabel) {
        await handleTrajectoryError(index, trajectoryId, trajectoryLabel);
      }
    } catch (error) {
      // Reset trajectory line to initial state
      setData((prev) => {
        if (index != null && prev[index]) {
          prev[index].trajectory = null;
          prev[index].status = TRAJECTORY_SELECTION_STATUS.MISSING;
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
        // silent handler
      }
    } else {
      return;
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
      ),
    [data, studyState?.studyStatus, errorInfo],
  );

  return (
    <div className="flex-1">
      <StdSimpleTable
        id="example-table"
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
          onClose={async (status, value, label) => {
            if (status && value != null) {
              await handleTrajectoryUpdate(value, status, label, rowIndexSelected);
            }
            toggleModal();
          }}
          trajectoryType={rowIndexSelected === 0 ? TRAJECTORY_TYPE.AREA : TRAJECTORY_TYPE.LINK}
          studyHorizon={study.horizon}
          studyId={study.id}
        />
      )}
      {isViewModalOpen && trajectoryData && (
        <TrajectoryDataVisualisation trajectoryData={trajectoryData} onClose={() => setIsViewModalOpen(false)} />
      )}
    </div>
  );
};

export default AreaLinkTab;
