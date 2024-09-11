/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { randomNumber } from '@/mocks/mockTools';
import { LIST_FIRSTNAME, LIST_NAME } from './names';
import { User } from '@/shared/types/common/User.type';

export const generateFixedUser = (userIdx: number, seed = 1): User => {
  const firstName = LIST_FIRSTNAME[userIdx % LIST_FIRSTNAME.length];
  const name = LIST_NAME[(userIdx + seed) % LIST_FIRSTNAME.length];
  return {
    id: `${userIdx}`,
    fullname: `${firstName} ${name}`,
    email: `${firstName.toLocaleLowerCase()}.${name.toLocaleLowerCase()}@rte-france.com`,
    nni: `R${Math.floor((userIdx + seed) * 12738) % 99999}`,
  };
};

export const randomUser = () => generateFixedUser(randomNumber(100), randomNumber(100));
export const generateFixedUsers = (nbUsers: number, seed = 1) =>
  Array.from({ length: nbUsers ?? 1 }, (_, idx) => generateFixedUser((idx + seed) * seed));
export const randomUsers = (nbUsers: number) => generateFixedUsers(nbUsers, randomNumber(100));
