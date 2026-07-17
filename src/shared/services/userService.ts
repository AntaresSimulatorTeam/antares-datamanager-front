/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { USER_LIST_ENDPOINT } from '@/shared/const/apiEndPoint';
import { AuthService } from '@/shared/services/authService';
import { BackendError, UserInfo } from '@/shared/types';

interface UserApiResponse {
  nni: string;
  first_name: string;
  last_name: string;
  email: string;
}

/**
 * Fetch user information by a list of NNIs
 *
 * @param {string[]} nniList - List of NNI (user identifiers)
 * @return {Promise<UserInfo[]>} - List of user information
 */
export const fetchUsersByNni = async (nniList: string[]): Promise<UserInfo[]> => {
  try {
    const response = await AuthService.authFetch(USER_LIST_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(nniList),
    });

    const users = (await (response as Response).json()) as UserApiResponse[];

    return users.map((user, idx) => ({
      id: `${idx}`,
      nni: user.nni,
      firstName: user.first_name,
      lastName: user.last_name,
      fullname: `${user.first_name} ${user.last_name}`,
      email: user.email,
    }));
  } catch (error) {
    throw new Error(`Failed to fetch users: ${(error as BackendError)?.antaresErrorMessage}`);
  }
};
