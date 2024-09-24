/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { User } from '@/shared/types/common/User.type';

export const AVATAR_COLORS = ['green', 'purple', 'blue', 'pink', 'gray', 'orange'] as const;
const USER_SEPARATOR = ' - ';
const MAX_USER_CHIP = 3;

export const splitUserList = (users: User[]) => {
  if (users.length <= MAX_USER_CHIP) {
    return users;
  }
  const [firstUser, secondUser, ...otherUsers] = users;
  return [firstUser, secondUser, otherUsers];
};

export const getInitials = (user: User) => {
  const [firstName, lastName = ''] = user.fullname.split(' ');
  return lastName.charAt(0) + firstName.charAt(0);
};

export const getUserInitials = (users: User | User[]) => {
  if (!Array.isArray(users)) {
    return getInitials(users);
  }
  return `+${users.length}`;
};

export const getUserFullname = (users: User | User[]) => {
  if (!Array.isArray(users)) {
    return users.fullname;
  }
  return users.map((user) => user.fullname).join(USER_SEPARATOR);
};

//assign a random color from COLORS
export const getColor = (users: User | User[]) => {
  if (!Array.isArray(users)) {
    return AVATAR_COLORS[
      users.fullname.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % AVATAR_COLORS.length
    ];
  }
  return AVATAR_COLORS[users.length % AVATAR_COLORS.length];
};
