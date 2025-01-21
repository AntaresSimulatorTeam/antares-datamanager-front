/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { PinnedProjectActionType, PinnedProjectState } from '@/shared/types/pegase/Project.type';
import { PINNED_PROJECT_ACTION } from '@/shared/enum/project.ts';

const addItem = (currentState, payload) => {
  return { pinnedProjects: [...currentState, payload] };
};
const removeItem = (currentState, payload) => {
  return { pinnedProjects: [...currentState.filter((p) => p.id !== payload)] };
};

const pinnedProjectReducer = (prevState: PinnedProjectState, action?: PinnedProjectActionType): PinnedProjectState => {
  const { pinnedProjects } = prevState;
  console.log('================ pinnedProjects', pinnedProjects);
  let newState;
  switch (action?.type) {
    case PINNED_PROJECT_ACTION.ADD_ITEM:
      newState = addItem(pinnedProjects, action?.payload);
      break;
    case PINNED_PROJECT_ACTION.REMOVE_ITEM:
      newState = removeItem(pinnedProjects, action?.payload);
      break;
    case PINNED_PROJECT_ACTION.INIT_LIST:
      newState = { pinnedProjects: [...action?.payload] };
      break;
    default:
      newState = prevState;
  }
  return newState;
};

export default pinnedProjectReducer;
