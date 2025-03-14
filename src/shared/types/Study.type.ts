/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { DbTrajectory } from '@/shared/types/Trajectory.type.ts';
import { STUDY_ACTION } from '@/shared/enum/study.ts';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';

export interface StudyDTO {
  id: number;
  name: string;
  createdBy: string;
  creationDate: Date;
  keywords: string[];
  project: string;
  status: string;
  horizon: string;
  trajectoryIds: number[];
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
}

export type StudyState = {
  [key in keyof typeof TRAJECTORY_TYPE]: DbTrajectory | null;
} & {
  isStudyGenerated: boolean;
};

export type StudyActionType =
  | { type: STUDY_ACTION.ADD_TRAJECTORY_AREA; payload: DbTrajectory }
  | { type: STUDY_ACTION.ADD_TRAJECTORY_LINK; payload: DbTrajectory }
  | { type: STUDY_ACTION.CLEAR_AREA_TRAJECTORY }
  | { type: STUDY_ACTION.SET_IS_STUDY_GENERATED }
  | { type: STUDY_ACTION.CLEAR_LINK_TRAJECTORY }
  | { type: STUDY_ACTION.ADD_TRAJECTORIES; payload: DbTrajectory[] };
