/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { COMMON_TAG_LIST_CLASSES, tagListClassBuilder } from '../tagListClassBuilder';

describe('tagListClassBuilder function', () => {
  it('should have the common classes', () => {
    expect(tagListClassBuilder(false).tagListClasses.includes(COMMON_TAG_LIST_CLASSES)).toBe(true);
    expect(tagListClassBuilder(true).tagListClasses.includes(COMMON_TAG_LIST_CLASSES)).toBe(true);
  });
  it('should have the invisible class before final render', () => {
    expect(tagListClassBuilder(false).tagListClasses.includes('invisible')).toBe(true);
  });

  it('should not have the invisible class after final render', () => {
    expect(tagListClassBuilder(true).tagListClasses.includes('invisible')).toBe(false);
  });
});
