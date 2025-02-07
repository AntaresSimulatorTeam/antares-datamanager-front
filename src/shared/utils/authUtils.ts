/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { User } from 'oidc-client-ts';

type ProfileWithRole = User & {
  profile: {
    realm_access: {
      roles: string[];
    };
  };
};

export const hasUserRole = (role: string, user: ProfileWithRole): boolean =>
  user?.profile.realm_access.roles?.includes(role);
