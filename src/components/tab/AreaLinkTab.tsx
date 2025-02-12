/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useState } from 'react';
import StdSimpleTable from '@common/data/stdSimpleTable/StdSimpleTable.tsx';
import { ReadOnlyObject } from '@common/data/stdTable/types/readOnly.type';
import getAreaLinkTableHeaders from '@/pages/pegase/studies/studyDetails/AreaLinkTableHeaders.tsx';
import { RdsButton, RdsIconId, RdsModal } from 'rte-design-system-react';
import { useNewStudyModal } from '@/hooks/useNewStudyModal.ts';
import { useTranslation } from 'react-i18next';
import {
  addTrajectory,
  fetchTrajectoriesFromDB,
  fetchTrajectoriesFromFS,
} from '@/shared/services/trajectoryService.ts';
import { TRAJECTORY_SELECTION_STATUS, TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import SelectAndSearchableInput from '@/components/input/SelectAndSearchableInput.tsx';
import { AreaAndLinkRowData, DbTrajectory, FsTrajectory } from '@/shared/types';
import { useFetchTrajectoriesFromDB } from '@/hooks/useFetchTrajectoriesFromDB.ts';
import { convertToSelectionOptionType } from '@/shared/utils/formFormatter.ts';

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
  const [trajectoriesFS, setTrajectoriesFS] = useState<FsTrajectory[]>();
  const [optionsDB, setOptionsDB] = useState<SelectOption[][]>();
  const [optionsFS, setOptionsFS] = useState<SelectOption[]>();
  const [rowIndexSelected, setRowIndexSelected] = useState<number>(0);
  const [trajectorySelected, setTrajectorySelected] = useState<DbTrajectory | FsTrajectory>();
  const [errorImportMessage, setErrorImportMessage] = useState<string | undefined>();
  const { isModalOpen, toggleModal } = useNewStudyModal();
  const { t } = useTranslation();

  const { trajectories: trajectoriesArea } = useFetchTrajectoriesFromDB(TRAJECTORY_TYPE.AREA, studyHorizon);
  const { trajectories: trajectoriesLink } = useFetchTrajectoriesFromDB(TRAJECTORY_TYPE.LINK, studyHorizon);

  if (trajectoriesArea && trajectoriesLink) {
    setTrajectoriesDB([trajectoriesArea, trajectoriesLink]);
    setOptionsDB([convertToSelectionOptionType(trajectoriesArea), convertToSelectionOptionType(trajectoriesLink)]);
  }

  const handleTrajectoryImport = async (index: number) => {
    try {
      const results = await fetchTrajectoriesFromFS(index === 0 ? TRAJECTORY_TYPE.AREA : TRAJECTORY_TYPE.LINK);
      setTrajectoriesFS(results);
      setOptionsFS(
        results.map((result, indexTrajectory) => ({
          id: `option-fs-${indexTrajectory}`,
          label: result.trajectory_name,
        })),
      );
      toggleModal();
    } catch (error: unknown) {
      setErrorImportMessage(error as string);
    } finally {
      setRowIndexSelected(index);
    }
  };

  const handleFSTrajectorySelection = (value: SelectOption) => {
    const trajectory = (trajectoriesFS || []).find((item) => item.trajectory_name === value.label);
    setTrajectorySelected(trajectory);
  };

  const handleImportToDB = async (): Promise<void> => {
    if (!rowIndexSelected || !trajectorySelected || !studyHorizon) return;

    await addTrajectory(
      rowIndexSelected === 0 ? TRAJECTORY_TYPE.AREA : TRAJECTORY_TYPE.LINK,
      trajectorySelected.trajectory_name,
      studyHorizon,
    ).then((newTrajectory) => setTrajectorySelected(newTrajectory));
  };

  const handleTrajectorySelection = (index: number, trajectory: SelectOption) => {
    const updatedData = [...data];
    updatedData[index].trajectory = trajectory.label;
    updatedData[index].status = TRAJECTORY_SELECTION_STATUS.OK;
    setReadOnly({ '0': false, '1': false });
    setData(updatedData);
  };

  const handlerDeleteSelection = (index: number) => {
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

  const handlerSearch = async (index: number, value: string | undefined): Promise<SelectOption[] | undefined> => {
    try {
      const results = await fetchTrajectoriesFromDB(
        index === 0 ? TRAJECTORY_TYPE.AREA : TRAJECTORY_TYPE.LINK,
        '2023-2024',
        value,
      );
      return results.map((result) => ({
        id: result.id,
        label: result.trajectory_name,
      }));
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

  const columns = getAreaLinkTableHeaders(
    optionsDB,
    t,
    handleTrajectorySelection,
    handlerDeleteSelection,
    handleTrajectoryImport,
    handlerSearch,
  );

  return (
    <div className="flex-1">
      <StdSimpleTable
        id="example-table"
        data={data}
        columns={columns}
        columnSize="meta"
        enableReadOnly={true}
        state={{ readOnly }}
      />
      {isModalOpen && (
        <RdsModal size="small">
          <RdsModal.Title onClose={closeModal}>{t('studyDetails.@import_from_file_system')}</RdsModal.Title>
          <RdsModal.Content>
            <SelectAndSearchableInput
              options={optionsFS}
              defaultPlaceHolder={t('studyDetails.@placeholder')}
              onSelect={handleFSTrajectorySelection}
            />
          </RdsModal.Content>
          <RdsModal.Footer>
            <RdsButton label="Cancel" onClick={closeModal} color="secondary" />
            <RdsButton
              icon={RdsIconId.Add}
              label={t('studyDetails.@import')}
              onClick={() => void handleImportToDB()}
              variant="contained"
              color="primary"
              //disabled={!isFormValid}
            />
          </RdsModal.Footer>
        </RdsModal>
      )}
    </div>
  );
};

export default AreaLinkTab;
