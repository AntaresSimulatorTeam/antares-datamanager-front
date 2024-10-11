/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { clsx } from 'clsx';

export const RADIO_CIRCLE_CLASSES = 'h-1.25 w-1.25 rounded-full outline outline-1 outline-offset-2 outline-gray-600';

export const COMMON_CONTAINER_CLASSES = 'peer rounded p-0.125 mt-0.25 cursor-pointer';

export const FOCUS_CONTAINER_CLASSES =
  'outline-offset-1 peer-focus-visible:outline peer-focus-visible:outline-1 peer-focus-visible:outline-gray-900 peer-checked:peer-focus-visible:outline-primary-900';

export const ENABLED_BORDER_CLASSES =
  '[&_>div>div]:outline-gray-600 [&_>div>div]:outline-gray-600 peer-checked:[&_>div>div]:outline-primary-600 peer-checked:[&_>div:hover>div]:outline-primary-800 peer-checked:[&_>div:hover:active>div]:outline-primary-900 peer-[:not(:checked)]:[&_>div:hover]:bg-gray-300 peer-[:not(:checked)]:[&_>div:hover>div]:outline-gray-900 peer-[:not(:checked)]:[&_>div:hover:active]:bg-gray-500';

export const DISABLED_BORDER_CLASSES = '[&_>div]:bg-gray-100 [&_>div>div]:outline-gray-500';

export const ENABLED_CHECK_CLASSES =
  'peer-checked:[&_>div>div]:bg-primary-600 peer-checked:[&>div:hover>div]:bg-primary-800 peer-checked:[&_>div:hover:active>div]:bg-primary-900';
export const DISABLED_CHECK_CLASSES = 'peer-checked:[&_>div>div]:bg-gray-500';

export const COMMON_LABEL_CONTAINER_CLASSES = 'flex items-start gap-1';

export const DISABLED_LABEL_CONTAINER_CLASSES = '[&_*]:cursor-not-allowed';

export const COMMON_TEXT_CLASSES = 'break-all text-body-s';

export const DISABLED_TEXT_CLASSES = 'text-gray-500';

const radioButtonClassBuilder = (disabled?: boolean) => {
  const classes = {
    labelContainerClasses: COMMON_LABEL_CONTAINER_CLASSES,
    containerClasses: COMMON_CONTAINER_CLASSES,
    radioCircleClasses: RADIO_CIRCLE_CLASSES,
    textClasses: COMMON_TEXT_CLASSES,
  };

  if (disabled) {
    classes.labelContainerClasses = clsx(classes.labelContainerClasses, DISABLED_LABEL_CONTAINER_CLASSES);
    classes.containerClasses = clsx(classes.containerClasses, DISABLED_BORDER_CLASSES, DISABLED_CHECK_CLASSES);
    classes.textClasses = clsx(classes.textClasses, DISABLED_TEXT_CLASSES);
    return classes;
  }
  classes.containerClasses = clsx(
    classes.containerClasses,
    FOCUS_CONTAINER_CLASSES,
    ENABLED_BORDER_CLASSES,
    ENABLED_CHECK_CLASSES,
  );
  return classes;
};

export default radioButtonClassBuilder;
