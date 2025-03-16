/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import StdSimpleTable from '@common/data/stdSimpleTable/StdSimpleTable.tsx';
import { ReadOnlyObject } from '@common/data/stdTable/types/readOnly.type';
import getAreaLinkTableHeaders from '@/pages/pegase/studies/studyDetails/AreaLinkTableHeaders.tsx';
import { useNewStudyModal } from '@/hooks/useNewStudyModal.ts';
import { useTranslation } from 'react-i18next';
import {
  fetchTrajectoriesFromDB,
  fetchTrajectoriesFromFS,
  linkTrajectoryToStudy,
  unlinkTrajectoryFromStudy,
} from '@/shared/services/trajectoryService.ts';
import { TRAJECTORY_SELECTION_STATUS, TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { AreaAndLinkRowData, DbTrajectory, RowStatus, SelectOption, StudyActionType, StudyDTO } from '@/shared/types';
import { getStatus } from '@/shared/utils/trajectoryUtils';
import { convertToFSSelectionOptionType, convertToSelectionOptionType } from '@/shared/utils/formFormatter';
import { ImportTrajectoryModal } from '@common/modal/ImportTrajectoryModal.tsx';
import { useStudy, useStudyDispatch } from '@/store/contexts/StudyContext';
import { STUDY_ACTION } from '@/shared/enum/study.ts';
import { StudyStatus } from '@/shared/types/common/StudyStatus.type.ts';

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
  const { isModalOpen, toggleModal } = useNewStudyModal();
  const dispatch = useStudyDispatch();
  const { t } = useTranslation();
  const [data, setData] = useState<AreaAndLinkRowData[]>([
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
  const [readOnly, setReadOnly] = useState<ReadOnlyObject>({
    '0': false,
    '1': !studyState[`${TRAJECTORY_TYPE.AREA}`],
  });
  const trajectoryArea = studyState[`${TRAJECTORY_TYPE.AREA}`] ?? null;
  const trajectoryLink = studyState[`${TRAJECTORY_TYPE.LINK}`] ?? null;

  useEffect(() => {
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
  }, [trajectoryArea, trajectoryLink, studyState?.studyStatus]);

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

  const handleTrajectoryUpdate = useCallback(
    async (index: number, status: RowStatus, trajectory?: SelectOption | DbTrajectory) => {
      const updatedData = [...data];
      try {
        if (status === 'success' && trajectory?.id) {
          const payload = (await linkTrajectoryToStudy(
            index === 0 ? TRAJECTORY_TYPE.AREA : TRAJECTORY_TYPE.LINK,
            trajectory.id,
            study.id,
          )) as DbTrajectory;
          // Update context
          dispatch?.({
            type: index === 0 ? STUDY_ACTION.ADD_TRAJECTORY_AREA : STUDY_ACTION.ADD_TRAJECTORY_LINK,
            payload,
          } as StudyActionType);
          // Update data state
          updatedData[index].trajectory = payload;
          updatedData[index].status = getStatus(status);
          setReadOnly({ '0': false, '1': false });
        }

        // Handle deletion case for areas
        if (status === 'empty') {
          // Reset trajectory line to initial state in case of trajectory error status
          if (updatedData[index]?.trajectory || updatedData[index].status === TRAJECTORY_SELECTION_STATUS.ERROR) {
            if (updatedData[index]?.trajectory) {
              await unlinkTrajectoryFromStudy(updatedData[index].trajectory.id, study.id);
              dispatch?.({
                type: index === 0 ? STUDY_ACTION.CLEAR_AREA_TRAJECTORY : STUDY_ACTION.CLEAR_LINK_TRAJECTORY,
              } as StudyActionType);
              setReadOnly({ '0': false, '1': index === 0 });
            }
            updatedData[index].trajectory = null;
            updatedData[index].status = TRAJECTORY_SELECTION_STATUS.MISSING;
          }
        }

        if (status === 'error' && trajectory) {
          updatedData[index].trajectory = {
            id: (trajectory as SelectOption).id,
            trajectoryName: (trajectory as SelectOption).label,
            type: null,
            version: null,
            userName: null,
            creationDate: null,
          };
          updatedData[index].status = TRAJECTORY_SELECTION_STATUS.ERROR;
        }
      } catch {
        // Reset trajectory line to initial state
        updatedData[index].trajectory = null;
        updatedData[index].status = TRAJECTORY_SELECTION_STATUS.MISSING;
      } finally {
        setData(updatedData);
      }
    },
    [],
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

  const closeModal = useCallback(
    async (status: RowStatus, value?: DbTrajectory | SelectOption) => {
      try {
        await handleTrajectoryUpdate(rowIndexSelected, status, value);
      } finally {
        toggleModal();
      }
    },
    [rowIndexSelected],
  );

  const columns = useMemo(
    () =>
      getAreaLinkTableHeaders(
        t,
        handleTrajectoryUpdate,
        handleFetchTrajectoriesFS,
        handleTrajectorySearch,
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
          onClose={closeModal}
          trajectoryType={rowIndexSelected === 0 ? TRAJECTORY_TYPE.AREA : TRAJECTORY_TYPE.LINK}
          studyHorizon={study.horizon}
          studyId={study.id}
        />
      )}
    </div>
  );
};

export default AreaLinkTab;
