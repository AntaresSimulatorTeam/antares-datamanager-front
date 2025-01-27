/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { createContext, Dispatch, ReactNode, useContext, useReducer } from 'react';
import { PinnedProjectActionType, PinnedProjectState } from '@/shared/types/pegase/Project.type';
import pinnedProjectReducer from '@/store/reducers/projectReducer';

const initialValue: PinnedProjectState = { pinnedProjects: [] };

export const PinnedProjectContext = createContext<PinnedProjectState>(initialValue);
export const PinnedProjectDispatchContext = createContext<Dispatch<PinnedProjectActionType> | null>(null);

export const usePinnedProject = () => useContext(PinnedProjectContext);
export const usePinnedProjectDispatch = () => useContext(PinnedProjectDispatchContext);

export interface PinnedProjectProviderProps {
  children: ReactNode;
  initialValue: PinnedProjectState;
}

export const PinnedProjectProvider = ({ children, initialValue }: PinnedProjectProviderProps) => {
  const initializer = (value = initialValue) => value;

  const [state, dispatch] = useReducer(pinnedProjectReducer, initialValue, initializer);

  return (
    <PinnedProjectContext.Provider value={state}>
      <PinnedProjectDispatchContext.Provider value={dispatch}>{children}</PinnedProjectDispatchContext.Provider>
    </PinnedProjectContext.Provider>
  );
};
