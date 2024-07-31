/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import {
  NAVBAR_BASE_CLASSES,
  NAVBAR_COLLAPSED_CLASSES,
  NAVBAR_EXPANDED_CLASSES,
  NAVBAR_ITEM_CLASSES,
  NAVBAR_ITEM_SELECTED_CLASSES,
  navbarClassBuilder,
  navbarItemClassBuilder,
} from '../navbarClassBuilder';

describe('navbarClassBuilder', () => {
  it('should have the common classes', () => {
    expect(navbarClassBuilder(true)).toContain(NAVBAR_BASE_CLASSES);
    expect(navbarClassBuilder(false)).toContain(NAVBAR_BASE_CLASSES);
  });
  it('should have the proper expanded classes', () => {
    expect(navbarClassBuilder(true)).toContain(NAVBAR_EXPANDED_CLASSES);
  });
  it('should have the proper collapsed classes', () => {
    expect(navbarClassBuilder(false)).toContain(NAVBAR_COLLAPSED_CLASSES);
  });
});

describe('navbarItemClassBuilder', () => {
  it('should have the common classes', () => {
    expect(navbarItemClassBuilder(true, true)).toContain(NAVBAR_ITEM_CLASSES);
    expect(navbarItemClassBuilder(false, true)).toContain(NAVBAR_ITEM_CLASSES);
  });
  it('should have the extra background class if selected', () => {
    expect(navbarItemClassBuilder(true, true)).toContain(NAVBAR_ITEM_SELECTED_CLASSES);
    expect(navbarItemClassBuilder(false, true)).not.toContain(NAVBAR_ITEM_SELECTED_CLASSES);
  });
});
