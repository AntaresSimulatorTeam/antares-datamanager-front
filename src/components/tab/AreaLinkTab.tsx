/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useEffect, useState } from 'react';
import StdSimpleTable from '@common/data/stdSimpleTable/StdSimpleTable.tsx';
import { ReadOnlyObject } from '@common/data/stdTable/types/readOnly.type';
import getAreaLinkTableHeaders from '@/pages/pegase/studies/studyDetails/AreaLinkTableHeaders.tsx';
import { RdsButton, RdsIconId, RdsModal } from 'rte-design-system-react';
import { useNewStudyModal } from '@/hooks/useNewStudyModal.ts';
import { useTranslation } from 'react-i18next';
import {
  createTrajectory,
  fetchTrajectoriesFromDB,
  fetchTrajectoriesFromFS,
} from '@/shared/services/trajectoryService.ts';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import SelectAndSearchableInput from '@/components/input/SelectAndSearchableInput.tsx';
import { DbTrajectory, FsTrajectory } from '@/shared/types/Trajectory.type.ts';

type RowStatus = 'Missing' | 'OK' | 'Error';

type RowData = {
  hypothesis: string;
  trajectory: string | null;
  status: RowStatus;
};

interface AreaLinkTabProps {
  studyHorizon: string;
}

const AreaLinkTab = ({ studyHorizon }: AreaLinkTabProps) => {
  const [data, setData] = useState<RowData[]>([
    { hypothesis: 'Areas', trajectory: null, status: 'Missing' },
    { hypothesis: 'Links', trajectory: null, status: 'Missing' },
  ]);
  const [readOnly, setReadOnly] = useState<ReadOnlyObject>({ '0': false, '1': !data[0].trajectory });
  const [trajectoriesDB, setTrajectoriesDB] = useState<DbTrajectory[][]>();
  const [trajectoriesFS, setTrajectoriesFS] = useState<FsTrajectory[]>();
  const [optionsDB, setOptionsDB] = useState<SelectOption[][]>();
  const [optionsFS, setOptionsFS] = useState<SelectOption[]>();
  const [rowIndexSelected, setRowIndexSelected] = useState<number>(0);
  const [trajectorySelected, setTrajectorySelected] = useState<DbTrajectory | FsTrajectory>();
  const [errorImportMessage, setErrorImportMessage] = useState<string | undefined>();
  const { isModalOpen, toggleModal } = useNewStudyModal();
  const { t } = useTranslation();

  useEffect(() => {
    const getTrajectoriesFromDb = async (studyHorizon) => {
      try {
        // replace by studyHorizon
        const resultsArea = await fetchTrajectoriesFromDB(TRAJECTORY_TYPE.AREA, '2023-2024');
        const areasOptions: SelectOption[] = resultsArea.map((trajectory) => {
          return {
            id: trajectory.id,
            label: trajectory.trajectory_name,
          };
        });
        const resultsLink = await fetchTrajectoriesFromDB(TRAJECTORY_TYPE.LINK, '2030-2031');
        const linksOptions: SelectOption[] = resultsLink.map((trajectory) => {
          return {
            id: trajectory.id,
            label: trajectory.trajectory_name,
          };
        });
        setTrajectoriesDB([resultsArea, resultsLink]);
        setOptionsDB([areasOptions, linksOptions]);
      } catch (error) {
        // Handle errors
      }
    };

    if (studyHorizon) {
      void getTrajectoriesFromDb(studyHorizon);
    }
  }, []);

  const handleTrajectoryImport = async (index: number) => {
    try {
      const results = await fetchTrajectoriesFromFS(index === 0 ? TRAJECTORY_TYPE.AREA : TRAJECTORY_TYPE.LINK);
      setTrajectoriesFS(results);
      setOptionsFS(
        results.map((result, index) => {
          return {
            id: `option-fs-${index}`,
            label: result.trajectory_name,
          };
        }),
      );
      toggleModal();
    } catch (error) {
      setErrorImportMessage(error);
    } finally {
      setRowIndexSelected(index);
    }
  };

  const handleFSTrajectorySelection = (value: SelectOption) => {
    const trajectory = (trajectoriesFS || []).find((item) => item.trajectory_name === value.label);
    setTrajectorySelected(trajectory);
  };

  const handleImportToDB = async () => {
    if (!rowIndexSelected || !trajectorySelected || !studyHorizon) return;

    try {
      await createTrajectory(
        rowIndexSelected === 0 ? TRAJECTORY_TYPE.AREA : TRAJECTORY_TYPE.LINK,
        trajectorySelected.trajectory_name,
        studyHorizon,
      );
    } catch {
      // silent handler
    }
  };

  const handleTrajectorySelection = (index: number, trajectory: SelectOption) => {
    const updatedData = [...data];
    updatedData[index].trajectory = trajectory.label;
    updatedData[index].status = 'OK';
    setReadOnly({ '0': false, '1': false });
    setData(updatedData);
  };

  const handlerDeleteSelection = (index: number) => {
    const updatedData = [...data];
    updatedData[index].trajectory = null;
    updatedData[index].status = 'Missing';
    if (index === 0) {
      updatedData[1].trajectory = null;
      updatedData[1].status = 'Missing';
      setReadOnly({ '0': false, '1': true });
    }
    setData(updatedData);
  };

  const handlerSearch = async (index, value) => {
    try {
      const results = await fetchTrajectoriesFromDB(
        index === 0 ? TRAJECTORY_TYPE.AREA : TRAJECTORY_TYPE.LINK,
        '2023-2024',
        value,
      );
      return results.map((result) => {
        return {
          id: result.id,
          label: result.trajectory_name,
        };
      });
    } catch {
      // silent handler
    }
  };

  const closeModal = () => {
    if (!errorImportMessage && trajectorySelected && rowIndexSelected) {
      const updatedData = [...data];
      updatedData[rowIndexSelected].trajectory = trajectorySelected.trajectory_name;
      updatedData[rowIndexSelected].status = 'OK';
      setData(updatedData);
    } else if (errorImportMessage) {
      const updatedData = [...data];
      updatedData[rowIndexSelected].trajectory = null;
      updatedData[rowIndexSelected].status = 'Error';
      setData(updatedData);
    }
    toggleModal();
  };

  const columns = getAreaLinkTableHeaders(
    optionsDB,
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
          <RdsModal.Title onClose={closeModal}>{t('studyDetails.@import_trajectory')}</RdsModal.Title>
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
              label={t('studyDetails.@import_to_db')}
              onClick={handleImportToDB}
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
