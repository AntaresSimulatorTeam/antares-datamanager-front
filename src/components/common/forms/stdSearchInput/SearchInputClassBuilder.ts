/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { classMerger } from '@/shared/utils/common/classes/classMerger';
import { SearchInputSize, SearchVariant } from './StdSearchInput';

export const INPUT_WRAPPER =
  'rounded-0.5 group inline-flex w-full flex-row items-center gap-1 justify-center rounded border';
export const INPUT_CLASSES =
  'w-full h-2.5 bg-transparent outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none text-gray-900 placeholder:text-gray-500 ';
export const LABEL_CLASSES = 'mb-0.25 h-auto w-auto overflow-ellipsis px-0.5 text-gray-700';
export const VARIANT_CLASSES = {
  filled:
    'hover:placeholder:text-gray-700 border-gray-w border-b-gray-400 bg-gray-100  focus-within:border-b-primary-600 hover:border-b-gray-500 hover:bg-gray-200  focus:bg-gray-100 [&>*]:hover:placeholder:text-gray-700 [&>*]:focus:text-gray-900',
  outlined:
    'hover:placeholder:text-gray-700 rounded border-gray-400 focus-within:border-primary-600 hover:bg-gray-100 focus:border-primary-600',
};
export const DEFAULT_CLEAR_BUTTON_CLASS = 'flex flex-row items-start justify-center';
export const INVISIBLE_CLEAR_BUTTON_CLASSES = 'invisible h-2.5';
export const VARIANT_DISABLED_CLASSES = 'hover:bg-gray-200 cursor-not-allowed bg-gray-200 text-gray-500 ';

export const SIZE_CLASSES = {
  small: 'px-1 py-0.25',
  medium: 'px-1.5 py-0.75',
};

export const searchClassBuilder = (variant: SearchVariant, disabled: boolean, size: SearchInputSize) => {
  const classes = {
    inputClasses: INPUT_CLASSES,
    inputWrapperClass: classMerger(INPUT_WRAPPER, VARIANT_CLASSES[variant], SIZE_CLASSES[size]),
    labelClass: LABEL_CLASSES,
  };
  if (disabled) {
    classes.inputClasses = classMerger(classes.inputClasses, VARIANT_DISABLED_CLASSES);
    classes.inputWrapperClass = classMerger(INPUT_WRAPPER, VARIANT_DISABLED_CLASSES, SIZE_CLASSES[size]);
  }

  return classes;
};

export const clearClassBuilder = (shouldHideClearButton: boolean) =>
  shouldHideClearButton ? INVISIBLE_CLEAR_BUTTON_CLASSES : DEFAULT_CLEAR_BUTTON_CLASS;
