/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { User } from 'oidc-client-ts';

export interface UserInfo {
  id: string;
  nni: string;
  firstName: string;
  lastName: string;
  fullname: string;
  email: string;
  isAdmin?: boolean;
}

export interface UserState {
  user: User | null;
}
