/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { clsx } from 'clsx';

export const COMMON_CARD_CLASSES =
  'w-full h-full rounded-lg bg-gray-w border-b-4 pt-0.5 px-0.5 shadow-4 border-b-gray-w overflow-visible';

export const HOVER_CARD_CLASSES =
  'group no-desc-clickable-hovered:hover:bg-primary-50 no-desc-clickable-hovered:hover:cursor-pointer no-desc-clickable-hovered:hover:border-b-primary-400';
export const FOCUS_CARD_CLASSES = 'focus-visible:outline-primary-900 focus-visible:outline focus-visible:outline-2';
export const ACTIVE_CARD_CLASSES = 'active:border-b-2 active:pb-0.25';
export const DISABLED_CARD_CLASSES = '[&]:bg-gray-100 [&]:border-b-gray-100 cursor-not-allowed';

export const KEYBOARD_CARD_CLASSES = '[&]:bg-primary-50 [&]:border-b-primary-400 [&]:border-b-2 [&]:pb-0.25';

export default function cardClassBuilder(isClickable?: boolean, isKeyboardActive?: boolean, disabled?: boolean) {
  const classes = {
    cardClasses: COMMON_CARD_CLASSES,
  };

  if (disabled) {
    classes.cardClasses = clsx(classes.cardClasses, DISABLED_CARD_CLASSES);
  } else if (isClickable) {
    const clickableClasses = [FOCUS_CARD_CLASSES];
    clickableClasses.push(HOVER_CARD_CLASSES, ACTIVE_CARD_CLASSES);
    if (isKeyboardActive) clickableClasses.push(KEYBOARD_CARD_CLASSES);
    classes.cardClasses = clsx(classes.cardClasses, ...clickableClasses);
  }

  return classes;
}
