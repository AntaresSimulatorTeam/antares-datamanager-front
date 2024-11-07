/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import cardClassBuilder, {
  BUTTON_CONTAINER_CLASSES,
  PRIMARY_CENTER_BUTTON_CONTAINER_CLASSES,
  SECONDARY_CENTER_BUTTON_CONTAINER_CLASSES,
} from '../cardClassBuilder';

describe('cardClassBuilder function', () => {
  it('should have the default secondary button classes', () => {
    const classes = cardClassBuilder('default');
    expect(classes.buttonContainerClasses.includes(BUTTON_CONTAINER_CLASSES.default)).toBe(true);
    expect(classes.primaryButtonContainerClasses.includes(PRIMARY_CENTER_BUTTON_CONTAINER_CLASSES)).toBe(false);
    expect(classes.secondaryButtonContainerClasses.includes(SECONDARY_CENTER_BUTTON_CONTAINER_CLASSES)).toBe(false);
  });

  it('should have the centered secondary button classes', () => {
    const classes = cardClassBuilder('center');
    expect(classes.buttonContainerClasses.includes(BUTTON_CONTAINER_CLASSES.center)).toBe(true);
    expect(classes.primaryButtonContainerClasses.includes(PRIMARY_CENTER_BUTTON_CONTAINER_CLASSES)).toBe(true);
    expect(classes.secondaryButtonContainerClasses.includes(SECONDARY_CENTER_BUTTON_CONTAINER_CLASSES)).toBe(true);
  });
});
