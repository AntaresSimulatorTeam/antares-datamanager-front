/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { clsx } from 'clsx';
import { HeadingSize, HeadingWeight } from './StdHeading';

export const COMMON_CLASSES = 'mb-0.5 text-left';

export const SIZE_CLASSES = {
  xl: 'text-heading-xl',
  l: 'text-heading-l',
  m: 'text-heading-m',
  s: 'text-heading-s',
  xs: 'text-heading-xs',
};

export const WEIGHT_CLASSES = {
  semibold: 'font-semibold',
};

export const headingClassBuilder = (size: HeadingSize, weight: HeadingWeight) =>
  weight === 'regular'
    ? clsx(COMMON_CLASSES, SIZE_CLASSES[size])
    : clsx(COMMON_CLASSES, SIZE_CLASSES[size], WEIGHT_CLASSES[weight]);
