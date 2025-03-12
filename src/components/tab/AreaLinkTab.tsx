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
import { useFetchTrajectoriesFromDB } from '@/hooks/useFetchTrajectoriesFromDB.ts';
import { getStatus, getTrajectoryDB } from '@/shared/utils/trajectoryUtils';
import { convertToFSSelectionOptionType, convertToSelectionOptionType } from '@/shared/utils/formFormatter';
import { ImportTrajectoryModal } from '@common/modal/ImportTrajectoryModal.tsx';
import { useStudy, useStudyDispatch } from '@/store/contexts/StudyContext';
import { STUDY_ACTION } from '@/shared/enum/study.ts';
import { SelectOption } from '@/shared/types/Input.type.ts';

interface AreaLinkTabProps {
  study: StudyDTO;
}

const AreaLinkTab = ({ study }: AreaLinkTabProps) => {
  const studyState = useStudy();
  const trajectoryArea: DbTrajectory | null = studyState[`${TRAJECTORY_TYPE.AREA}`] ?? null;
  const trajectoryLink: DbTrajectory | null = studyState[`${TRAJECTORY_TYPE.LINK}`] ?? null;
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
      '1': !trajectoryArea,
    });
  }, [studyState, trajectoryArea, trajectoryLink]);

  const [optionsDB, setOptionsDB] = useState<SelectOption[][]>();
  const [optionsFS, setOptionsFS] = useState<SelectOption[]>();
  const [rowIndexSelected, setRowIndexSelected] = useState<number>(0);
  const { isModalOpen, toggleModal } = useNewStudyModal();
  const dispatch = useStudyDispatch();
  const { t } = useTranslation();
  const { trajectories: trajectoriesArea } = useFetchTrajectoriesFromDB(TRAJECTORY_TYPE.AREA, study.horizon);
  const { trajectories: trajectoriesLink } = useFetchTrajectoriesFromDB(TRAJECTORY_TYPE.LINK, study.horizon);

  useEffect(() => {
    if (trajectoriesArea && trajectoriesLink) {
      setOptionsDB([convertToSelectionOptionType(trajectoriesArea), convertToSelectionOptionType(trajectoriesLink)]);
    }
  }, [trajectoriesArea, trajectoriesLink]);

  const handleFetchTrajectoriesFS = async (index: number) => {
    try {
      const results = await fetchTrajectoriesFromFS(index === 0 ? TRAJECTORY_TYPE.AREA : TRAJECTORY_TYPE.LINK);
      setOptionsFS(convertToFSSelectionOptionType(results));
      toggleModal();
    } finally {
      setRowIndexSelected(index);
    }
  };

  const handleTrajectoryUpdate = useCallback(
    async (index: number, status: RowStatus, trajectory?: SelectOption | DbTrajectory) => {
      const updatedData = [...data];
      const payload: DbTrajectory | undefined =
        trajectory && 'label' in trajectory
          ? getTrajectoryDB(index === 0 ? trajectoriesArea : trajectoriesLink, trajectory.id)
          : trajectory;

      try {
        if (status === 'success' && payload) {
          await linkTrajectoryToStudy(payload.type, payload.id, study.id);
          // Update context
          dispatch?.({
            type: index === 0 ? STUDY_ACTION.ADD_TRAJECTORY_AREA : STUDY_ACTION.ADD_TRAJECTORY_LINK,
            payload,
          } as StudyActionType);
          // Update data state
          updatedData[index].trajectory = payload ?? null;
          updatedData[index].status = getStatus(status);
          setReadOnly({ '0': false, '1': false });
        }

        // Handle deletion case for areas
        if (status === 'empty') {
          // Reset trajectory line to initial state when in cas of trajectory error status
          if (updatedData[index].status === TRAJECTORY_SELECTION_STATUS.ERROR) {
            updatedData[index].trajectory = null;
            updatedData[index].status = TRAJECTORY_SELECTION_STATUS.MISSING;
          } else {
            if (index === 0 && updatedData[0]?.trajectory) {
              await unlinkTrajectoryFromStudy(updatedData[0].trajectory.id, study.id);
              if (updatedData[1].trajectory && updatedData[1].status === TRAJECTORY_SELECTION_STATUS.OK) {
                await unlinkTrajectoryFromStudy(updatedData[1].trajectory.id, study.id);
              }
              updatedData.forEach((rowData) => {
                rowData.trajectory = null;
                rowData.status = TRAJECTORY_SELECTION_STATUS.MISSING;
              });
              dispatch?.({
                type: STUDY_ACTION.CLEAR_AREA_LINK_TRAJECTORY,
              } as StudyActionType);
              setReadOnly({ '0': false, '1': true });
            } else if (index === 1 && updatedData[1].trajectory) {
              await unlinkTrajectoryFromStudy(updatedData[1].trajectory.id, study.id);
              updatedData[1].trajectory = null;
              updatedData[1].status = TRAJECTORY_SELECTION_STATUS.MISSING;
              dispatch?.({
                type: STUDY_ACTION.CLEAR_LINK_TRAJECTORY,
              } as StudyActionType);
              setReadOnly({ '0': false, '1': false });
            }
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
    [trajectoriesArea, trajectoriesLink],
  );

  const handleTrajectorySearch = async (
    index: number,
    value: string | undefined,
  ): Promise<SelectOption[] | undefined> => {
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
  };

  const closeModal = useCallback(
    async (status: RowStatus, value?: DbTrajectory | SelectOption) => {
      try {
        await handleTrajectoryUpdate(rowIndexSelected, status, value);
        // Update trajectory list options (synchronized with update of trajectory list in BDD after trajectory import) for dropdown
        if (status !== 'error' && value) {
          setOptionsDB((prev) => {
            if (prev && prev[rowIndexSelected]?.length >= 0) {
              prev[rowIndexSelected] = [
                ...prev[rowIndexSelected],
                {
                  id: (value as DbTrajectory).id,
                  label: (value as DbTrajectory).trajectoryName,
                },
              ];
              return prev;
            }
          });
        }
      } finally {
        toggleModal();
      }
    },
    [rowIndexSelected],
  );

  const columns = useMemo(
    () =>
      getAreaLinkTableHeaders(optionsDB, t, handleTrajectoryUpdate, handleFetchTrajectoriesFS, handleTrajectorySearch),
    [data, optionsDB],
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
        />
      )}
    </div>
  );
};

export default AreaLinkTab;
