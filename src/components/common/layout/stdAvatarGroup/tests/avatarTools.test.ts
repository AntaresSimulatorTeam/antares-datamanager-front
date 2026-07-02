/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { describe, expect, it } from 'vitest';
import { generateFixedUsers } from '@/mocks/data/list/user.mocks';
import { splitUserList, getUserInitials, getInitials, getColor, AVATAR_COLORS, getUserFullname } from '../avatarTools';

const TEST_ONE_USER_LIST = generateFixedUsers(1, 1);
const TEST_USER = TEST_ONE_USER_LIST[0];
const TEST_MULTIPLE_USERS = generateFixedUsers(5, 1);

describe('splitUserList function', () => {
  it('should give the list of all displayable user', () => {
    expect(splitUserList(TEST_ONE_USER_LIST).length).toBe(1);
    expect(splitUserList(TEST_MULTIPLE_USERS).length).toBe(3);
  });
});

describe('getUserInitials', () => {
  it('should get the Initials of the user or +n with n being the number of user in the list', () => {
    expect(getUserInitials(TEST_USER)).toBe(getInitials(TEST_USER));
    expect(getUserInitials(TEST_MULTIPLE_USERS)).toBe('+5');
  });
});

describe('getInitials', () => {
  it('should return last initial + first initial from firstName and lastName properties', () => {
    const initials = getInitials(TEST_USER);
    expect(initials).toHaveLength(2);
    expect(initials).toBe(TEST_USER.lastName.charAt(0) + TEST_USER.firstName.charAt(0));
  });

  it('should handle empty firstName gracefully', () => {
    const userWithoutFirstName = { ...TEST_USER, firstName: '' };
    const initials = getInitials(userWithoutFirstName);
    expect(initials).toBe(TEST_USER.lastName.charAt(0));
  });

  it('should handle empty lastName gracefully', () => {
    const userWithoutLastName = { ...TEST_USER, lastName: '' };
    const initials = getInitials(userWithoutLastName);
    expect(initials).toBe(TEST_USER.firstName.charAt(0));
  });
});

describe('getUserFullname', () => {
  it('should return fullname for single user', () => {
    const fullname = getUserFullname(TEST_USER);
    expect(fullname).toBe(TEST_USER.fullname);
  });

  it('should return joined fullnames for user array with separator', () => {
    const fullname = getUserFullname(TEST_MULTIPLE_USERS);
    expect(fullname).toContain(' - ');
    TEST_MULTIPLE_USERS.forEach((user) => {
      expect(fullname).toContain(user.fullname);
    });
  });
});

describe('getColor', () => {
  it('should return a valid color for single user', () => {
    const color = getColor(TEST_USER);
    expect(AVATAR_COLORS).toContain(color);
  });

  it('should generate same color for same user', () => {
    const color1 = getColor(TEST_USER);
    const color2 = getColor(TEST_USER);
    expect(color1).toBe(color2);
  });

  it('should use firstName and lastName for color calculation', () => {
    const color = getColor(TEST_USER);
    // The color should be based on firstName + lastName string
    const nameString = `${TEST_USER.firstName} ${TEST_USER.lastName}`;
    const expectedColor =
      AVATAR_COLORS[nameString.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % AVATAR_COLORS.length];
    expect(color).toBe(expectedColor);
  });

  it('should use array length for color when multiple users', () => {
    const color = getColor(TEST_MULTIPLE_USERS);
    expect(AVATAR_COLORS).toContain(color);
  });
});
