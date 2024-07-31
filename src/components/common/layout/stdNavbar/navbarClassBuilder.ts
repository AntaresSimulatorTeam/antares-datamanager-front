/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { classMerger } from '@/shared/utils/common/classes/classMerger';

export const NAVBAR_BASE_CLASSES =
  'flex flex-col bg-gray-50 dark:bg-acc2-900 border-r text-left gap-2 border-gray-300 h-screen transition-all ease-out duration-300';

export const NAVBAR_EXPANDED_CLASSES = 'w-28 px-1';
export const NAVBAR_COLLAPSED_CLASSES = 'w-8 items-center';

export const NAVBAR_CONTROLLER_BASE_CLASSES = 'cursor-pointer mb-2';

export const navbarClassBuilder = (expanded: boolean) =>
  classMerger(NAVBAR_BASE_CLASSES, expanded ? NAVBAR_EXPANDED_CLASSES : NAVBAR_COLLAPSED_CLASSES);

const NAVBAR_ITEM_BASE_CLASSES =
  'mx-1 flex items-center gap-1 truncate rounded p-1 text-button-s font-semibold text-gray-700 dark:text-gray-200';
const NAVBAR_ITEM_STATUS_CLASSES = 'hover:bg-gray-200 hover:text-gray-900 active:bg-gray-300 active:text-gray-900';
const DARK_NAVBAR_ITEM_STATUS_CLASSES =
  'dark:hover:bg-acc2-700 dark:hover:text-gray-200 dark:active:bg-acc2-600 dark:active:text-gray-200';
const NAVBAR_ITEM_FOCUS_CLASSES =
  'focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-0 focus-visible:outline-gray-900 ';

export const NAVBAR_ITEM_SELECTED_CLASSES = '[&]:bg-gray-300 [&]:text-gray-900 ';

export const NAVBAR_ITEM_CLASSES = classMerger(
  NAVBAR_ITEM_BASE_CLASSES,
  NAVBAR_ITEM_STATUS_CLASSES,
  DARK_NAVBAR_ITEM_STATUS_CLASSES,
  NAVBAR_ITEM_FOCUS_CLASSES,
);

export const navbarItemClassBuilder = (selected: boolean, expanded: boolean) => {
  const baseClasses = expanded ? NAVBAR_ITEM_CLASSES : classMerger(NAVBAR_ITEM_CLASSES, 'w-fit');
  return selected ? classMerger(baseClasses, NAVBAR_ITEM_SELECTED_CLASSES) : baseClasses;
};

export const navbarControllerClassBuilder = (expanded: boolean) => {
  const baseClasses = expanded ? NAVBAR_ITEM_CLASSES : classMerger(NAVBAR_ITEM_CLASSES, 'w-fit');
  return classMerger(baseClasses, NAVBAR_CONTROLLER_BASE_CLASSES);
};
