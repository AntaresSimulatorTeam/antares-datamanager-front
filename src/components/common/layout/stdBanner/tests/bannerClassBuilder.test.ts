/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import {
  COMMON_CONTAINER_CLASSES,
  COMMON_TEXT_CLASSES,
  STATUS_COLOR_CLASSES,
  STATUS_CONTAINER_CLASSES,
  bannerClassBuilder,
} from '../bannerClassBuilder';

describe('bannerClassBuilder function', () => {
  it('should have the common classes', () => {
    expect(bannerClassBuilder('info').containerClasses.includes(COMMON_CONTAINER_CLASSES)).toBe(true);
    expect(bannerClassBuilder('info').textClasses.includes(COMMON_TEXT_CLASSES)).toBe(true);
  });

  it('should have the proper status classes', () => {
    expect(bannerClassBuilder('info').containerClasses.includes(STATUS_CONTAINER_CLASSES.info)).toBe(true);
    expect(bannerClassBuilder('info').textClasses.includes(STATUS_COLOR_CLASSES.info)).toBe(true);

    expect(bannerClassBuilder('warning').containerClasses.includes(STATUS_CONTAINER_CLASSES.warning)).toBe(true);
    expect(bannerClassBuilder('warning').textClasses.includes(STATUS_COLOR_CLASSES.warning)).toBe(true);

    expect(bannerClassBuilder('error').containerClasses.includes(STATUS_CONTAINER_CLASSES.error)).toBe(true);
    expect(bannerClassBuilder('error').textClasses.includes(STATUS_COLOR_CLASSES.error)).toBe(true);

    expect(bannerClassBuilder('success').containerClasses.includes(STATUS_CONTAINER_CLASSES.success)).toBe(true);
    expect(bannerClassBuilder('success').textClasses.includes(STATUS_COLOR_CLASSES.success)).toBe(true);
  });

  it('should have the proper status icon classes', () => {
    expect(bannerClassBuilder('info').iconClasses.includes(STATUS_COLOR_CLASSES.info)).toBe(true);
    expect(bannerClassBuilder('warning').iconClasses.includes(STATUS_COLOR_CLASSES.warning)).toBe(true);
    expect(bannerClassBuilder('error').iconClasses.includes(STATUS_COLOR_CLASSES.error)).toBe(true);
    expect(bannerClassBuilder('success').iconClasses.includes(STATUS_COLOR_CLASSES.success)).toBe(true);
  });
});
