/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { clsx } from 'clsx';
import { AvatarColor, AvatarSize, AvatarTextColor } from './StdAvatar';

export const AVATAR_CLASSES = 'avatar rounded-full border-2 border-gray-w flex items-center justify-center';

export const AVATAR_SIZE_CLASSES = {
  es: 'w-4 h-4 text-body-xs',
  s: 'w-6 h-6 text-body-s',
  m: 'w-8 h-8 text-body-m',
};

export const COLOR_CLASSES = {
  green: 'bg-primary-300',
  blue: 'bg-info-300',
  pink: 'bg-error-300',
  gray: 'bg-gray-300',
  orange: 'bg-warning-300',
};

export const TEXT_CLASSES = {
  white: 'text-gray-w',
  black: 'text-gray-900',
};

export const avatarClassBuilder = (size: AvatarSize, color: AvatarColor, textColor?: AvatarTextColor) =>
  clsx(
    AVATAR_CLASSES,
    AVATAR_SIZE_CLASSES[size],
    COLOR_CLASSES[color],
    textColor ? TEXT_CLASSES[textColor] : TEXT_CLASSES.black,
  );
