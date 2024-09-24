/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { clsx } from 'clsx';
import { AvatarSize } from '../stdAvatar/StdAvatar';

export const COMMON_CLASSES = 'flex w-fit';

export const OFFSET_CLASSES = {
  es: '-space-x-2',
  s: '-space-x-3',
  m: '-space-x-4',
};

export const classBuilder = (size: AvatarSize) => clsx(COMMON_CLASSES, OFFSET_CLASSES[size]);
