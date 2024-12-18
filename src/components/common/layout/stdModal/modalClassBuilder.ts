/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { clsx } from 'clsx';
import { ModalSize } from './StdModal';

const COMMON_MODAL_CLASSES = 'ig-scrollbar flex items-stretch overflow-hidden ';

const SIZE_MODAL_CLASSES = {
  extraSmall: 'w-70vw sm:w-45vw md:w-35vw lg:w-30vw xl:w-25vw',
  small: 'w-75vw sm:w-55vw md:w-45vw lg:w-40vw xl:w-35vw',
  medium: 'w-95vw sm:w-75vw md:w-65vw lg:w-60vw xl:w-55vw',
  large: 'w-95vw sm:w-90vw md:w-80vw lg:w-75vw xl:w-70vw',
  extraLarge: 'w-98vw xl:w-95vw',
};

export const modalClassBuilder = (size?: ModalSize) =>
  size ? clsx(COMMON_MODAL_CLASSES, SIZE_MODAL_CLASSES[size]) : COMMON_MODAL_CLASSES;
