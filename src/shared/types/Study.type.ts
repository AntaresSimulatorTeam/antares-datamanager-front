/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { DbTrajectoryWithState, WarningMessage } from '@/shared/types/Trajectory.type.ts';
import { STUDY_ACTION } from '@/shared/enum/study.ts';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { StudyStatus } from '@/shared/types/common/StudyStatus.type.ts';
import { WithNullableFields } from '@/shared/types/Generic.type.ts';

export interface StudyDTO {
  id: number;
  name: string;
  createdBy: string | undefined;
  creationDate: Date;
  keywords: string[];
  project: string;
  status: StudyStatus;
  horizon: string;
  trajectoryIds: number[];
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
}

export type StudyState = {
  [key in keyof typeof TRAJECTORY_TYPE]?: WithNullableFields<
    DbTrajectoryWithState,
    'type' | 'version' | 'userName' | 'creationDate'
  > | null;
} & {
  studyStatus?: StudyStatus | undefined;
  messages?: WarningMessage[];
};

export type StudyActionType =
  | {
      type: STUDY_ACTION.ADD_TRAJECTORY_AREA;
      payload: WithNullableFields<DbTrajectoryWithState, 'type' | 'version' | 'userName' | 'creationDate'> | null;
    }
  | {
      type: STUDY_ACTION.ADD_TRAJECTORY_LINK;
      payload: WithNullableFields<DbTrajectoryWithState, 'type' | 'version' | 'userName' | 'creationDate'> | null;
    }
  | { type: STUDY_ACTION.CLEAR_AREA_TRAJECTORY }
  | { type: STUDY_ACTION.CLEAR_AREA_AND_LINK_TRAJECTORY }
  | { type: STUDY_ACTION.SET_STUDY_STATUS; payload: StudyStatus }
  | { type: STUDY_ACTION.CLEAR_LINK_TRAJECTORY }
  | { type: STUDY_ACTION.ADD_TRAJECTORIES; payload: DbTrajectoryWithState[] }
  | { type: STUDY_ACTION.ADD_WARNING_MESSAGE; payload: WarningMessage };
