/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { PROJECT_ACTION } from '@/shared/enum/project.ts';

export interface ProjectResponse {
  id: number;
  name: string;
  description: string;
  createdBy: string;
  creationDate: Date;
  tags: string[];
  studies: number[];
}

export interface ProjectInfo extends ProjectResponse {
  archived?: boolean;
  pinned?: boolean;
  path: string;
}

export type ProjectActionType =
  | { type: PROJECT_ACTION.ADD_PINNED_PROJECT; payload: ProjectInfo }
  | { type: PROJECT_ACTION.ADD_PROJECT; payload: ProjectInfo }
  | { type: PROJECT_ACTION.UPDATE_PROJECT; payload: ProjectInfo }
  | {
      type: PROJECT_ACTION.REMOVE_PROJECT;
      payload: number;
    }
  | {
      type: PROJECT_ACTION.UNPIN_PINNED_PROJECT;
      payload: number;
    }
  | {
      type: PROJECT_ACTION.INIT_PINNED_PROJECT_LIST;
      payload: ProjectInfo[];
    }
  | {
      type: PROJECT_ACTION.INIT_PROJECT_LIST;
      payload: ProjectInfo[];
    };

export interface ProjectState {
  projects: ProjectInfo[];
  pinnedProjects: ProjectInfo[];
}

export interface LocationProject {
  projectId: string;
}
