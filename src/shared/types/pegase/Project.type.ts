/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { PINNED_PROJECT_ACTION } from '@/shared/enum/project.ts';

export interface ProjectResponse {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  creationDate: Date;
  tags: string[];
  studies: number[];
}

export interface ProjectInfo extends ProjectResponse {
  description: string;
  archived?: boolean;
  pinned?: boolean;
  path: string;
}

export type PinnedProjectActionType =
  | { type: PINNED_PROJECT_ACTION.ADD_ITEM; payload: ProjectInfo }
  | {
      type: PINNED_PROJECT_ACTION.REMOVE_ITEM;
      payload: string;
    }
  | {
      type: PINNED_PROJECT_ACTION.INIT_LIST;
      payload: ProjectInfo[];
    };

export interface PinnedProjectState {
  pinnedProjects: ProjectInfo[];
}
