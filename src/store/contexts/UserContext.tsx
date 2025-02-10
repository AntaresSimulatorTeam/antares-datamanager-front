/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { createContext, useContext } from 'react';
import { UserState } from '@/shared/types';

const initialState: UserState = {
  user: null,
};
export const UserContext = createContext(initialState);
export const useUser = () => useContext(UserContext);
