/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { PegaseCardSecondaryButtonPosition } from './pegaseCard';

export const BUTTON_CONTAINER_CLASSES = {
  default: 'flex justify-end gap-3',
  center: 'grid grid-cols-3 items-center',
};

export const PRIMARY_CENTER_BUTTON_CONTAINER_CLASSES = 'col-start-3 flex justify-end';

export const SECONDARY_CENTER_BUTTON_CONTAINER_CLASSES = 'col-start-2 flex justify-center';

export default function cardClassBuilder(secondaryButtonPosition: PegaseCardSecondaryButtonPosition = 'default') {
  const classes = {
    buttonContainerClasses: BUTTON_CONTAINER_CLASSES[secondaryButtonPosition],
    primaryButtonContainerClasses: '',
    secondaryButtonContainerClasses: '',
  };
  if (secondaryButtonPosition === 'center') {
    classes.primaryButtonContainerClasses = PRIMARY_CENTER_BUTTON_CONTAINER_CLASSES;
    classes.secondaryButtonContainerClasses = SECONDARY_CENTER_BUTTON_CONTAINER_CLASSES;
  }
  return classes;
}
