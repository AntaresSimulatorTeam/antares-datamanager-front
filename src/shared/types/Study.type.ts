/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { DbTrajectory } from '@/shared/types/Trajectory.type.ts';
import { STUDY_ACTION } from '@/shared/enum/study.ts';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { StudyStatus } from '@/shared/types/common/StudyStatus.type.ts';
import { FileInputStatus } from '@/shared/types';

export interface StudyDTO {
  id: number;
  name: string;
  createdBy: string | undefined;
  creationDate: Date;
  keywords: string[];
  project: string;
  projectId: string;
  status: StudyStatus;
  horizon: string;
  trajectoryIds: number[];
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
}

export type StudyState = {
  [key in keyof typeof TRAJECTORY_TYPE]?: DbTrajectory[] | null;
} & {
  studyStatus?: StudyStatus;
};

export type StudyActionType =
  | { type: STUDY_ACTION.CLEAR_TRAJECTORY_BY_TYPE; payload: TRAJECTORY_TYPE[] }
  | { type: STUDY_ACTION.ADD_TRAJECTORIES; payload: DbTrajectory[] }
  | { type: STUDY_ACTION.DELETE_TRAJECTORY; payload: { area: string; type: TRAJECTORY_TYPE } }
  | { type: STUDY_ACTION.UPDATE_TRAJECTORY; payload: { trajectory: DbTrajectory; status: FileInputStatus } }
  | { type: STUDY_ACTION.SET_STUDY_STATUS; payload: StudyStatus }
  | { type: STUDY_ACTION.SKIP_MESSAGE; payload: { id: number; trajectoryType: TRAJECTORY_TYPE; trajectoryId: number } };

export interface LocationStudy {
  study: StudyDTO;
}
