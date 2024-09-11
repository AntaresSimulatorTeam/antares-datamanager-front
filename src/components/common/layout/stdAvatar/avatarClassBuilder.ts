/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { clsx } from 'clsx';
import { AvatarColor, AvatarSize } from './StdAvatar';

export const AVATAR_CLASSES = 'avatar rounded-full border-2 border-gray-w flex items-center justify-center';

export const AVATAR_SIZE_CLASSES = {
  es: 'w-4 h-4 text-body-xs',
  s: 'w-6 h-6 text-body-s',
  m: 'w-8 h-8 text-body-m',
};

export const COLOR_CLASSES = {
  green: 'bg-acc1-300',
  purple: 'bg-acc2-300',
  blue: 'bg-acc3-300',
  pink: 'bg-acc4-300',
  gray: 'bg-acc5-300',
  orange: 'bg-acc6-300',
};

export const avatarClassBuilder = (size: AvatarSize, color: AvatarColor) =>
  clsx(AVATAR_CLASSES, AVATAR_SIZE_CLASSES[size], COLOR_CLASSES[color]);
