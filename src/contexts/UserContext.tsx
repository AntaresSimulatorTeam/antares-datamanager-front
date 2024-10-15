/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { THEME_COLOR } from '@/shared/types';
import createFastContext from './createFastContext';
import { User } from 'oidc-client-ts';
import * as React from 'react';

export const UserContext = React.createContext<User | null>(null);
