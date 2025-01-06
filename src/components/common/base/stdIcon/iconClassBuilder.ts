/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { Delay, Duration, Rotate } from '@/shared/types';
import { classMerger } from '@/shared/utils/common/classes/classMerger';
import { RotationOptionsType } from './Icon';

export const POINTER_CLASS = 'pointer-events-none';

export const TRANSITION_CLASS = 'transition-all';

export const getDelay = (delay: Delay) => `delay-${delay}`;
export const getRotation = (degree: Rotate) => `rotate-${degree}`;
export const getDuration = (duration: Duration) => `duration-${duration}`;

export const iconClassBuilder = (colorClass?: string, rotationOptions?: RotationOptionsType, rotate?: boolean) => {
  const iconClasses = colorClass ? classMerger(POINTER_CLASS, colorClass) : POINTER_CLASS;

  if (!rotationOptions) {
    return iconClasses;
  }

  const { delay, degree, duration } = rotationOptions;

  return classMerger(
    iconClasses,
    TRANSITION_CLASS,
    getDelay(delay),
    getDuration(duration),
    rotate ? getRotation(degree) : '',
  );
};
