/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { STATUS_TEXT_CLASSES } from '../../stdToast/toastClassBuilder';
import {
  COMMON_CONTAINER_CLASSES,
  COMMON_TEXT_CLASSES,
  STATUS_COLOR_CLASSES,
  STATUS_CONTAINER_CLASSES,
  alertClassBuilder,
} from '../alertClassBuilder';

describe('alertClassBuilder function', () => {
  it('should have the common classes', () => {
    expect(alertClassBuilder('info').containerClasses.includes(COMMON_CONTAINER_CLASSES)).toBe(true);
    expect(alertClassBuilder('info').textClasses.includes(COMMON_TEXT_CLASSES)).toBe(true);
  });

  it('should have the proper status classes', () => {
    expect(alertClassBuilder('info').containerClasses.includes(STATUS_CONTAINER_CLASSES.info)).toBe(true);
    expect(alertClassBuilder('info').textClasses.includes(STATUS_TEXT_CLASSES.info)).toBe(true);

    expect(alertClassBuilder('warning').containerClasses.includes(STATUS_CONTAINER_CLASSES.warning)).toBe(true);
    expect(alertClassBuilder('warning').textClasses.includes(STATUS_TEXT_CLASSES.warning)).toBe(true);

    expect(alertClassBuilder('error').containerClasses.includes(STATUS_CONTAINER_CLASSES.error)).toBe(true);
    expect(alertClassBuilder('error').textClasses.includes(STATUS_TEXT_CLASSES.error)).toBe(true);

    expect(alertClassBuilder('success').containerClasses.includes(STATUS_CONTAINER_CLASSES.success)).toBe(true);
    expect(alertClassBuilder('success').textClasses.includes(STATUS_TEXT_CLASSES.success)).toBe(true);
  });

  it('should have the proper status icon classes', () => {
    expect(alertClassBuilder('info').iconClasses.includes(STATUS_COLOR_CLASSES.info)).toBe(true);
    expect(alertClassBuilder('warning').iconClasses.includes(STATUS_COLOR_CLASSES.warning)).toBe(true);
    expect(alertClassBuilder('error').iconClasses.includes(STATUS_COLOR_CLASSES.error)).toBe(true);
    expect(alertClassBuilder('success').iconClasses.includes(STATUS_COLOR_CLASSES.success)).toBe(true);
  });
});
