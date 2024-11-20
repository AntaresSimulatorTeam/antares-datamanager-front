/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import {
  COMMON_CONTAINER_CLASSES,
  COMMON_TEXT_CLASSES,
  STATUS_CONTAINER_CLASSES,
  STATUS_TEXT_CLASSES,
  toastClassBuilder,
} from '../toastClassBuilder';

describe('toastClassBuilder function', () => {
  it('should have the common classes', () => {
    expect(toastClassBuilder('info', false).containerClasses.includes(COMMON_CONTAINER_CLASSES)).toBe(true);
    expect(toastClassBuilder('info', false).textClasses.includes(COMMON_TEXT_CLASSES)).toBe(true);
  });

  it('should have the proper status classes', () => {
    expect(toastClassBuilder('info', false).containerClasses.includes(STATUS_CONTAINER_CLASSES.info)).toBe(true);
    expect(toastClassBuilder('info', false).textClasses.includes(STATUS_TEXT_CLASSES.info)).toBe(true);
    expect(toastClassBuilder('info', false).iconClasses.includes(STATUS_TEXT_CLASSES.info)).toBe(true);

    expect(toastClassBuilder('warning', false).containerClasses.includes(STATUS_CONTAINER_CLASSES.warning)).toBe(true);
    expect(toastClassBuilder('warning', false).textClasses.includes(STATUS_TEXT_CLASSES.warning)).toBe(true);
    expect(toastClassBuilder('warning', false).iconClasses.includes(STATUS_TEXT_CLASSES.warning)).toBe(true);

    expect(toastClassBuilder('error', false).containerClasses.includes(STATUS_CONTAINER_CLASSES.error)).toBe(true);
    expect(toastClassBuilder('error', false).textClasses.includes(STATUS_TEXT_CLASSES.error)).toBe(true);
    expect(toastClassBuilder('error', false).iconClasses.includes(STATUS_TEXT_CLASSES.error)).toBe(true);
  });
});
