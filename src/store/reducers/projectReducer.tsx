/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { PinnedProjectActionType, PinnedProjectState, ProjectInfo } from '@/shared/types/pegase/Project.type';
import { PINNED_PROJECT_ACTION } from '@/shared/enum/project.ts';

const addItem = (currentState: ProjectInfo[], payload: ProjectInfo) => {
  return { pinnedProjects: [...currentState, payload] };
};
const removeItem = (currentState: ProjectInfo[], payload: string) => {
  return { pinnedProjects: [...currentState.filter((p) => p.id !== payload)] };
};

const pinnedProjectReducer = (prevState: PinnedProjectState, action?: PinnedProjectActionType): PinnedProjectState => {
  const { pinnedProjects } = prevState;
  if (action) {
    switch (action.type) {
      case PINNED_PROJECT_ACTION.ADD_ITEM:
        console.log('==============ADD_ITEM ');
        return addItem(pinnedProjects, action.payload);
      case PINNED_PROJECT_ACTION.REMOVE_ITEM:
        return removeItem(pinnedProjects, action.payload);
      case PINNED_PROJECT_ACTION.INIT_LIST:
        return { pinnedProjects: [...action.payload] };
      default:
        return prevState;
    }
  }

  return prevState;
};

export default pinnedProjectReducer;
