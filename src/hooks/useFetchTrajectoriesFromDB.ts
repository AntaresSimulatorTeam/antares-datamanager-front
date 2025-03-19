/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useEffect, useState } from 'react';
import { fetchTrajectoriesFromDB } from '@/shared/services/trajectoryService.ts';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { DbTrajectory } from '@/shared/types';
import { StudyStatus } from '@/shared/types/common/StudyStatus.type';

export const useFetchTrajectoriesFromDB = (trajectoryType: TRAJECTORY_TYPE, studyHorizon: string, studyStatus: StudyStatus) => {
  const [trajectories, setTrajectories] = useState<DbTrajectory[] | null>(null);

  useEffect(() => {
    const getTrajectoriesFromDb = async (type: TRAJECTORY_TYPE, horizon: string) => {
      try {
        const results = await fetchTrajectoriesFromDB(type, horizon);
        setTrajectories(results);
      } catch (error) {
        // Handle errors
      }
    };

    if (trajectoryType && studyHorizon && studyStatus != StudyStatus.GENERATED) {
      void getTrajectoriesFromDb(trajectoryType, studyHorizon);
    }
  }, [trajectoryType, studyHorizon]);

  return { trajectories };
};
