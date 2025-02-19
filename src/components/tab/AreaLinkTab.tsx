/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useEffect, useMemo, useState } from 'react';
import StdSimpleTable from '@common/data/stdSimpleTable/StdSimpleTable.tsx';
import { ReadOnlyObject } from '@common/data/stdTable/types/readOnly.type';
import getAreaLinkTableHeaders from '@/pages/pegase/studies/studyDetails/AreaLinkTableHeaders.tsx';
import { useNewStudyModal } from '@/hooks/useNewStudyModal.ts';
import { useTranslation } from 'react-i18next';
import { fetchTrajectoriesFromDB, fetchTrajectoriesFromFS } from '@/shared/services/trajectoryService.ts';
import { TRAJECTORY_SELECTION_STATUS, TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { AreaAndLinkRowData, DbTrajectory, RowStatus } from '@/shared/types';
import { useFetchTrajectoriesFromDB } from '@/hooks/useFetchTrajectoriesFromDB.ts';
import {
  convertToFSSelectionOptionType,
  convertToSelectionOptionType,
  getStatus,
} from '@/shared/utils/formFormatter.ts';
import { ImportTrajectoryModal } from '@common/modal/ImportTrajectoryModal.tsx';

interface AreaLinkTabProps {
  studyHorizon: string;
}

const AreaLinkTab = ({ studyHorizon }: AreaLinkTabProps) => {
  const [data, setData] = useState<AreaAndLinkRowData[]>([
    { hypothesis: 'Areas', trajectory: null, status: TRAJECTORY_SELECTION_STATUS.MISSING },
    { hypothesis: 'Links', trajectory: null, status: TRAJECTORY_SELECTION_STATUS.MISSING },
  ]);
  const [readOnly, setReadOnly] = useState<ReadOnlyObject>({ '0': false, '1': !data[0].trajectory });
  const [optionsDB, setOptionsDB] = useState<SelectOption[][]>();
  const [optionsFS, setOptionsFS] = useState<SelectOption[]>();
  const [rowIndexSelected, setRowIndexSelected] = useState<number>(0);
  const { isModalOpen, toggleModal } = useNewStudyModal();
  const { t } = useTranslation();
  const { trajectories: trajectoriesArea } = useFetchTrajectoriesFromDB(TRAJECTORY_TYPE.AREA, studyHorizon);
  const { trajectories: trajectoriesLink } = useFetchTrajectoriesFromDB(TRAJECTORY_TYPE.LINK, studyHorizon);

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

  const handleTrajectoryUpdate = (index: number, trajectory: SelectOption | DbTrajectory | null, status: RowStatus) => {
    const updatedData = [...data];
    updatedData[index].trajectory = trajectory
      ? ((trajectory as SelectOption)?.label ?? (trajectory as DbTrajectory)?.trajectory_name)
      : null;
    updatedData[index].status = getStatus(status);

    // Handle deletion case
    if (index === 0 && status === 'empty') {
      updatedData[1].trajectory = null;
      updatedData[1].status = TRAJECTORY_SELECTION_STATUS.MISSING;
      setReadOnly({ '0': false, '1': true });
    } else {
      setReadOnly({ '0': false, '1': false });
    }
    setData(updatedData);
  };

  const handleTrajectorySearch = async (
    index: number,
    value: string | undefined,
  ): Promise<SelectOption[] | undefined> => {
    try {
      const results = await fetchTrajectoriesFromDB(
        index === 0 ? TRAJECTORY_TYPE.AREA : TRAJECTORY_TYPE.LINK,
        studyHorizon,
        value,
      );
      return convertToSelectionOptionType(results);
    } catch {
      // silent handler
    }
  };

  const closeModal = (value: DbTrajectory | SelectOption | null, status: RowStatus) => {
    value && handleTrajectoryUpdate(rowIndexSelected, value, status);
    toggleModal();
  };

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
          studyHorizon={studyHorizon}
        />
      )}
    </div>
  );
};

export default AreaLinkTab;
