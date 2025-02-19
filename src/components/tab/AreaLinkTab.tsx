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
import { AreaAndLinkRowData, DbTrajectory, FsTrajectory } from '@/shared/types';
import { useFetchTrajectoriesFromDB } from '@/hooks/useFetchTrajectoriesFromDB.ts';
import { convertToSelectionOptionType } from '@/shared/utils/formFormatter.ts';
import { ImportTrajectoryModal } from '@common/modal/ImportTrajectoryModal.tsx';
import { FileInputStatus } from 'rte-design-system-react';

interface AreaLinkTabProps {
  studyHorizon: string;
}

const AreaLinkTab = ({ studyHorizon }: AreaLinkTabProps) => {
  const [data, setData] = useState<AreaAndLinkRowData[]>([
    { hypothesis: 'Areas', trajectory: null, status: TRAJECTORY_SELECTION_STATUS.MISSING },
    { hypothesis: 'Links', trajectory: null, status: TRAJECTORY_SELECTION_STATUS.MISSING },
  ]);
  const [readOnly, setReadOnly] = useState<ReadOnlyObject>({ '0': false, '1': !data[0].trajectory });
  const [_, setTrajectoriesDB] = useState<DbTrajectory[][]>();
  //const [trajectoriesFS, setTrajectoriesFS] = useState<FsTrajectory[]>();
  const [optionsDB, setOptionsDB] = useState<SelectOption[][]>();
  const [optionsFS, setOptionsFS] = useState<SelectOption[]>();
  const [rowIndexSelected, setRowIndexSelected] = useState<number>(0);
  const [trajectorySelected, setTrajectorySelected] = useState<DbTrajectory | FsTrajectory | null>(null);
  const [errorImportMessage, setErrorImportMessage] = useState<string | undefined>();
  const { isModalOpen, toggleModal } = useNewStudyModal();
  const { t } = useTranslation();
  const { trajectories: trajectoriesArea } = useFetchTrajectoriesFromDB(TRAJECTORY_TYPE.AREA, studyHorizon);
  const { trajectories: trajectoriesLink } = useFetchTrajectoriesFromDB(TRAJECTORY_TYPE.LINK, studyHorizon);

  useEffect(() => {
    if (trajectoriesArea && trajectoriesLink) {
      setTrajectoriesDB([trajectoriesArea, trajectoriesLink]);
      setOptionsDB([convertToSelectionOptionType(trajectoriesArea), convertToSelectionOptionType(trajectoriesLink)]);
    }
  }, [trajectoriesArea, trajectoriesLink]);

  const handleFetchTrajectoriesFS = async (index: number) => {
    try {
      const results = await fetchTrajectoriesFromFS(index === 0 ? TRAJECTORY_TYPE.AREA : TRAJECTORY_TYPE.LINK);
      setRowIndexSelected(index);
      //setTrajectoriesFS(results);
      setOptionsFS(
        results.map((result, indexTrajectory) => ({
          id: `option-fs-${indexTrajectory}`,
          label: result.trajectory_name
            ? result.trajectory_name.substring(0, result.trajectory_name.lastIndexOf('.'))
            : '',
        })),
      );
      toggleModal();
      setTrajectorySelected(null);
    } catch (error: unknown) {
      setErrorImportMessage(error as string);
      setRowIndexSelected(index);
    }
  };

  const getStatus = (status: FileInputStatus) => {
    switch (status) {
      case 'error':
        return TRAJECTORY_SELECTION_STATUS.ERROR;
      case 'empty':
        return TRAJECTORY_SELECTION_STATUS.MISSING;
      case 'success':
      default:
        return TRAJECTORY_SELECTION_STATUS.OK;
    }
  };

  const handleTrajectorySelection = (
    index: number,
    trajectory: SelectOption | DbTrajectory | undefined,
    status?: FileInputStatus,
  ) => {
    const updatedData = [...data];
    updatedData[index].trajectory = (trajectory as SelectOption).label ?? (trajectory as DbTrajectory).trajectory_name;
    updatedData[index].status = status ? getStatus(status) : TRAJECTORY_SELECTION_STATUS.OK;
    setReadOnly({ '0': false, '1': false });
    setData(updatedData);
  };

  const handleTrajectoryImportToDB = (value: DbTrajectory | undefined, status?: FileInputStatus) => {
    if (rowIndexSelected == null || !studyHorizon) return;
    if (value) setTrajectorySelected(value);
    handleTrajectorySelection(rowIndexSelected, value, status);
  };

  const handlerTrajectoryDeletion = (index: number) => {
    const updatedData = [...data];
    updatedData[index].trajectory = null;
    updatedData[index].status = TRAJECTORY_SELECTION_STATUS.MISSING;
    if (index === 0) {
      updatedData[1].trajectory = null;
      updatedData[1].status = TRAJECTORY_SELECTION_STATUS.MISSING;
      setReadOnly({ '0': false, '1': true });
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

  const closeModal = () => {
    if (!errorImportMessage && trajectorySelected && rowIndexSelected) {
      const updatedData = [...data];
      updatedData[rowIndexSelected].trajectory = trajectorySelected.trajectory_name;
      updatedData[rowIndexSelected].status = TRAJECTORY_SELECTION_STATUS.OK;
      setData(updatedData);
    } else if (errorImportMessage) {
      const updatedData = [...data];
      updatedData[rowIndexSelected].trajectory = null;
      updatedData[rowIndexSelected].status = TRAJECTORY_SELECTION_STATUS.ERROR;
      setData(updatedData);
    }
    toggleModal();
  };

  const columns = useMemo(
    () =>
      getAreaLinkTableHeaders(
        optionsDB,
        t,
        handleTrajectorySelection,
        handlerTrajectoryDeletion,
        handleFetchTrajectoriesFS,
        handleTrajectorySearch,
      ),
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
          handleTrajectoryImport={handleTrajectoryImportToDB}
          trajectoryType={rowIndexSelected === 0 ? TRAJECTORY_TYPE.AREA : TRAJECTORY_TYPE.LINK}
          studyHorizon={studyHorizon}
        />
      )}
    </div>
  );
};

export default AreaLinkTab;
