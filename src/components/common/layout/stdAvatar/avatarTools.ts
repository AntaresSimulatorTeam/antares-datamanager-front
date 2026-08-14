/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { UserInfo } from '@/shared/types/common/User.type.ts';

export const AVATAR_COLORS = ['green', 'blue', 'pink', 'gray', 'orange'] as const;
const USER_SEPARATOR = ' - ';
const MAX_USER_CHIP = 3;

export const splitUserList = (users: UserInfo[]) => {
  if (users.length <= MAX_USER_CHIP) {
    return users;
  }
  const [firstUser, secondUser, ...otherUsers] = users;
  return [firstUser, secondUser, otherUsers];
};

export const getInitials = (user: UserInfo) => {
  const firstName = user.firstName || '';
  const lastName = user.lastName || '';
  return lastName.charAt(0) + firstName.charAt(0);
};

export const getUserInitials = (users: UserInfo | UserInfo[]) => {
  if (!Array.isArray(users)) {
    return getInitials(users);
  }
  return `+${users.length}`;
};

export const getUserFullname = (users: UserInfo | UserInfo[]) => {
  if (!Array.isArray(users)) {
    return users.fullname;
  }
  return users.map((user) => user.fullname).join(USER_SEPARATOR);
};

//assign a random color from COLORS
export const getColor = (users: UserInfo | UserInfo[]) => {
  if (!Array.isArray(users)) {
    const nameString = `${users.firstName} ${users.lastName}`;
    return AVATAR_COLORS[
      nameString.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % AVATAR_COLORS.length
    ];
  }
  return AVATAR_COLORS[users.length % AVATAR_COLORS.length];
};
