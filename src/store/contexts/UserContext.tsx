/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { THEME_COLOR } from '@/shared/types';
import createFastContext from './createFastContext';

export type UserContextStore = {
  theme: THEME_COLOR;
};

export const UserContext = createFastContext<UserContextStore>();
