/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import StdSimpleTable from '@common/data/stdSimpleTable/StdSimpleTable.tsx';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ReadOnlyObject } from '@common/data/stdTable/types/readOnly.type';
import { AreaAndLinkRowData, LocationState, SelectOption } from '@/shared/types';
import { TRAJECTORY_SELECTION_STATUS, TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import getAreaLinkTableHeaders from '@/components/header/AreaLinkTableHeaders.tsx';
import { useTranslation } from 'react-i18next';
import { useStudy } from '@/store/contexts/StudyContext.tsx';
import { ErrorMessageType } from '@/components/tab/AreaLinkTab.tsx';
import { useLocation } from 'react-router-dom';
import { fetchTrajectoriesFromDB, getDefaultLoadHypothesis } from '@/shared/services/trajectoryService.ts';
import { convertToSelectionOptionType } from '@/shared/utils/formFormatter.ts';

const LoadTab = () => {
  const { t } = useTranslation();
  const studyState = useStudy();
  const location = useLocation();
  const study = (location.state as LocationState)?.study;
  const [readOnly, _] = useState<ReadOnlyObject>({ '0': false, '1': false });
  const [data, setData] = useState<AreaAndLinkRowData[]>([]);
  const [errorInfo, setErrorInfo] = useState<ErrorMessageType>({ index: 0, message: '' });

  useEffect(() => {
    const fetchHypothesis = async () => {
      try {
        const hypothesis = await getDefaultLoadHypothesis();
        //const trajectories: DbTrajectory[] = await getStudyTrajectories(study.id, TRAJECTORY_TYPE.LOAD);
        setData(
          hypothesis.map((item) => ({
            hypothesis: item.name,
            trajectory: null,
            status: TRAJECTORY_SELECTION_STATUS.MISSING,
          })),
        );
      } catch {
        //silent handler
      }
    };

    void fetchHypothesis();
  }, []);

  const handleTrajectoryUpdate = async () => Promise.resolve();
  const handleFetchTrajectoriesFS = async () => Promise.resolve();
  const handleViewTrajectory = async () => Promise.resolve();

  const handleTrajectorySearch = useCallback(
    async (value?: string): Promise<SelectOption[] | undefined> => {
      try {
        const results = await fetchTrajectoriesFromDB(TRAJECTORY_TYPE.LOAD, study.horizon, value);
        return convertToSelectionOptionType(results);
      } catch {
        // silent handler
      }
    },
    [study.horizon],
  );

  const removeRow = (indexRow: number) =>
    setData((prev) => prev.filter((_row: AreaAndLinkRowData, index: number) => index !== indexRow));

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
        TRAJECTORY_TYPE.LOAD,
        removeRow,
      ),
    [data, studyState?.studyStatus, errorInfo],
  );

  return (
    <div className="flex h-fit w-full">
      <StdSimpleTable
        id="load-table"
        data={data}
        columns={columns}
        enableColumnResizing={false}
        enableReadOnly={true}
        state={{ readOnly }}
      />
    </div>
  );
};

export default LoadTab;
