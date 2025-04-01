/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import StdSimpleTable from '@common/data/stdSimpleTable/StdSimpleTable.tsx';
import { ReadOnlyObject } from '@common/data/stdTable/types/readOnly.type';
import getAreaLinkTableHeaders from '@/components/header/AreaLinkTableHeaders.tsx';
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
  AreaAndLinkRowData,
  DbTrajectory,
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
import { getStudyTrajectories } from '@/shared/services/studyService.ts';
import { TrajectoryDataVisualisation } from '@common/modal/TrajectoryDataVisualisation.tsx';
import { generateTrajectoryViewHeader } from '@/components/header/TrajectoryLinkHeader.tsx';

export interface ErrorMessageType {
  index: number;
  message: string;
}

interface AreaLinkTabProps {
  study: StudyDTO;
}

const AreaLinkTab = ({ study }: AreaLinkTabProps) => {
  const studyState = useStudy();
  const [optionsFS, setOptionsFS] = useState<SelectOption[]>();
  const [rowIndexSelected, setRowIndexSelected] = useState<number>(0);
  const [errorInfo, setErrorInfo] = useState<ErrorMessageType>({ index: 0, message: '' });
  const [trajectoryData, setTrajectoryData] = useState<TrajectoryViewData | undefined>();
  const { isModalOpen, toggleModal } = useNewStudyModal();
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const dispatch = useStudyDispatch();
  const { t } = useTranslation();
  const [data, setData] = useState<AreaAndLinkRowData[]>([
    {
      hypothesis: 'Areas',
      trajectory: studyState[`${TRAJECTORY_TYPE.AREA}`] ?? null,
      status: studyState[`${TRAJECTORY_TYPE.AREA}`]
        ? TRAJECTORY_SELECTION_STATUS.OK
        : TRAJECTORY_SELECTION_STATUS.MISSING,
    },
    {
      hypothesis: 'Links',
      trajectory: studyState[`${TRAJECTORY_TYPE.LINK}`] ?? null,
      status: studyState[`${TRAJECTORY_TYPE.LINK}`]
        ? TRAJECTORY_SELECTION_STATUS.OK
        : TRAJECTORY_SELECTION_STATUS.MISSING,
    },
  ]);
  const [readOnly, setReadOnly] = useState<ReadOnlyObject>({
    '0': false,
    '1':
      !studyState[`${TRAJECTORY_TYPE.AREA}`] ||
      (!studyState[`${TRAJECTORY_TYPE.LINK}`] && studyState?.studyStatus === StudyStatus.GENERATED),
  });

  useEffect(() => {
    const getTrajectories = async () => {
      let trajectoryAreaResult;
      let trajectoryLinkResult;
      try {
        [trajectoryAreaResult, trajectoryLinkResult] = await Promise.all([
          getStudyTrajectories(study.id, TRAJECTORY_TYPE.AREA),
          getStudyTrajectories(study.id, TRAJECTORY_TYPE.LINK),
        ]);
      } finally {
        if (
          (trajectoryAreaResult as DbTrajectory[])?.length > 0 ||
          (trajectoryLinkResult as DbTrajectory[])?.length > 0
        ) {
          const trajectoryArea = (trajectoryAreaResult as DbTrajectory[])[0] ?? null;
          const trajectoryLink = (trajectoryLinkResult as DbTrajectory[])[0] ?? null;
          dispatch?.({
            type: STUDY_ACTION.ADD_TRAJECTORIES,
            payload: [trajectoryArea, trajectoryLink].filter(Boolean),
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
            '1': !trajectoryArea || (!trajectoryLink && studyState?.studyStatus === StudyStatus.GENERATED),
          });
        }
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

  const handleControlFailed = async (index: number, trajectoryId: number, trajectoryLabel: string) => {
    try {
      const newDbTrajectory = {
        id: trajectoryId,
        trajectoryName: trajectoryLabel,
        type: null,
        version: null,
        userName: null,
        creationDate: null,
      };
      if (index === 0 && data[1].trajectory) {
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
        setData((prev) => {
          prev[index].trajectory = newDbTrajectory;
          prev[index].status = TRAJECTORY_SELECTION_STATUS.ERROR;
          return prev;
        });
      }
    } finally {
      setReadOnly({ '0': false, '1': false });
    }
  };

  const handleTrajectoryUpdate = useCallback(
    async (index: number, status: RowStatus, trajectoryId: number, trajectoryLabel?: string) => {
      try {
        if (status === 'success' && trajectoryId) {
          const payload = (await linkTrajectoryToStudy(
            index === 0 ? TRAJECTORY_TYPE.AREA : TRAJECTORY_TYPE.LINK,
            trajectoryId,
            study.id,
          )) as DbTrajectory;
          // Update context
          dispatch?.({
            type: index === 0 ? STUDY_ACTION.ADD_TRAJECTORY_AREA : STUDY_ACTION.ADD_TRAJECTORY_LINK,
            payload,
          } as StudyActionType);
          setData((prev) => {
            prev[index].trajectory = payload;
            prev[index].status = getStatus(status);
            return prev;
          });
          setReadOnly({ '0': false, '1': false });
        }

        // Handle deletion case for areas
        if ((trajectoryId != null && status === 'empty') || status === 'emptyError') {
          if (trajectoryId != null && status === 'empty') {
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

        if (status === 'error' && trajectoryId != null && trajectoryLabel) {
          await handleControlFailed(index, trajectoryId, trajectoryLabel);
        }
      } catch (error) {
        //Handle case when control failed during link creation
        if (status === 'success' && trajectoryId != null && trajectoryLabel) {
          await handleControlFailed(index, trajectoryId, trajectoryLabel);
        } else {
          // Reset trajectory line to initial state
          setData((prev) => {
            prev[index].trajectory = null;
            prev[index].status = TRAJECTORY_SELECTION_STATUS.MISSING;
            return prev;
          });
        }
      }
    },
    [study.id],
  );

  const handleTrajectorySearch = useCallback(
    async (index: number, value: string | undefined): Promise<SelectOption[] | undefined> => {
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
      getAreaLinkTableHeaders(
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
              await handleTrajectoryUpdate(rowIndexSelected, status, value, label);
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
