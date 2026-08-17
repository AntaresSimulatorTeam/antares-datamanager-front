/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { DbTrajectory, RowStatus } from '@/shared/types/Trajectory.type.ts';
import { STUDY_ACTION } from '@/shared/enum/study.ts';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { StudyStatus } from '@/shared/types/common/StudyStatus.type.ts';
import { WarningMessage } from '@/shared/types';

export interface StudyDTO {
  id: number;
  name: string;
  createdBy: string | undefined;
  creationDate: Date;
  generationDate?: Date;
  keywords: string[];
  project: string;
  projectId: string;
  status: StudyStatus;
  horizon: string;
  trajectoryIds: number[];
  hvdc: boolean;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalPages: number;
}

export type TrajectoryState = {
  trajectories: DbTrajectory[];
};

export type TrajectoryStateWithWarningMessages = {
  trajectories: DbTrajectory[];
  warningMessages: WarningMessage[];
};

export type StudyTrajectoriesData = {
  [key in keyof typeof TRAJECTORY_TYPE]?: TrajectoryState;
};
export type StudyState = StudyTrajectoriesData & {
  studyStatus?: StudyStatus;
  discardActionTriggered?: boolean;
  discardWarningMessage?: (id: number) => Promise<void>;
  hvdc?: boolean;
};

export type StudyActionType =
  | { type: STUDY_ACTION.CLEAR_TRAJECTORY_BY_TYPE; payload: TRAJECTORY_TYPE[] }
  | {
      type: STUDY_ACTION.ADD_TRAJECTORIES;
      payload: StudyTrajectoriesData;
    }
  | {
      type: STUDY_ACTION.ADD_WARNING_MESSAGES;
      payload: { trajectoryType: TRAJECTORY_TYPE; messages: WarningMessage[] };
    }
  | { type: STUDY_ACTION.DELETE_TRAJECTORY; payload: { area: string; type: TRAJECTORY_TYPE } }
  | {
      type: STUDY_ACTION.UPDATE_TRAJECTORY;
      payload: { trajectory: DbTrajectory; status: RowStatus };
    }
  | { type: STUDY_ACTION.SET_STUDY_STATUS; payload: StudyStatus }
  | {
      type: STUDY_ACTION.SKIP_MESSAGE;
      payload: { discardActionTriggered: boolean };
    }
  | { type: STUDY_ACTION.RESET_STUDY_STATE }
  | { type: STUDY_ACTION.SET_STUDY_HVDC; payload: boolean };

export interface LocationStudy {
  study: StudyDTO;
}

export type StudyDataCreation = Omit<
  StudyDTO,
  'id' | 'status' | 'creationDate' | 'projectId' | 'generationDate'
> & {
  id: number | undefined;
};
