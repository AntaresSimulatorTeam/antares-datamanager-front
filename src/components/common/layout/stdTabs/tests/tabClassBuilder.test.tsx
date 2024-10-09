/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { StdIconId } from '@/shared/utils/common/mappings/iconMaps';
import {
  ACTIVE_CLASSES,
  BORDER_CLASSES,
  COMMON_BORDER_CLASSES,
  COMMON_CONTENT_CONTAINER_CLASSES,
  COMMON_LIST_BUTTON_CLASSES,
  CONTENT_CONTAINER_CLASSES,
  DISABLED_CLASSES,
  ENABLED_CLASSES,
  KEYBOARD_ACTIVE_CLASSES,
  KEYBOARD_BORDER_ACTIVE_CLASSES,
  PADDING_X,
  PADDING_Y,
  PRIMARY_BORDER_BUTTON_CLASSES,
  tabItemClassBuilder,
  tabListClassBuilder,
} from '../tabClassBuilder';

describe('tabListClassBuilder function', () => {
  it('should have the common classes', () => {
    expect(tabListClassBuilder('primary', 0).buttonClasses.left.includes(COMMON_LIST_BUTTON_CLASSES)).toBe(true);
    expect(tabListClassBuilder('primary', 0).buttonClasses.right.includes(COMMON_LIST_BUTTON_CLASSES)).toBe(true);

    expect(tabListClassBuilder('secondary', 0).buttonClasses.left.includes(COMMON_LIST_BUTTON_CLASSES)).toBe(true);
    expect(tabListClassBuilder('secondary', 0).buttonClasses.right.includes(COMMON_LIST_BUTTON_CLASSES)).toBe(true);
  });

  it('should have the primary border button classes', () => {
    expect(tabListClassBuilder('primary', 0).buttonClasses.left.includes(PRIMARY_BORDER_BUTTON_CLASSES)).toBe(true);
    expect(tabListClassBuilder('primary', 0).buttonClasses.right.includes(PRIMARY_BORDER_BUTTON_CLASSES)).toBe(true);
  });

  it('should have the left button visibility classes', () => {
    expect(tabListClassBuilder('primary', 0, 200, 300).buttonClasses.left.includes('hidden')).toBe(true);
    expect(tabListClassBuilder('secondary', 0, 200, 300).buttonClasses.left.includes('hidden')).toBe(true);

    expect(tabListClassBuilder('primary', 100, 200, 300).buttonClasses.left.includes('hidden')).toBe(false);
    expect(tabListClassBuilder('secondary', 100, 200, 300).buttonClasses.left.includes('hidden')).toBe(false);
  });
  it('should have the right button visibility classes', () => {
    expect(tabListClassBuilder('primary', 200, 200, 300).buttonClasses.right.includes('hidden')).toBe(true);
    expect(tabListClassBuilder('secondary', 200, 200, 300).buttonClasses.right.includes('hidden')).toBe(true);

    expect(tabListClassBuilder('primary', 0, 200, 300).buttonClasses.right.includes('hidden')).toBe(false);
    expect(tabListClassBuilder('secondary', 0, 200, 300).buttonClasses.right.includes('hidden')).toBe(false);
  });
});

describe('tabItemClassBuilder function', () => {
  it('should have the common classes', () => {
    expect(
      tabItemClassBuilder('primary', false).contentContainerClasses.includes(COMMON_CONTENT_CONTAINER_CLASSES),
    ).toBe(true);
    expect(
      tabItemClassBuilder('secondary', false).contentContainerClasses.includes(COMMON_CONTENT_CONTAINER_CLASSES),
    ).toBe(true);
  });

  it('should have the proper border and rounded classes', () => {
    expect(
      tabItemClassBuilder('primary', false).contentContainerClasses.includes(CONTENT_CONTAINER_CLASSES.primary),
    ).toBe(true);
    expect(
      tabItemClassBuilder('secondary', false).contentContainerClasses.includes(CONTENT_CONTAINER_CLASSES.secondary),
    ).toBe(true);

    expect(tabItemClassBuilder('primary', false).borderClasses.includes(COMMON_BORDER_CLASSES)).toBe(true);
  });

  it('should have the proper primary padding classes', () => {
    expect(tabItemClassBuilder('primary', false).contentContainerClasses.includes(PADDING_X.paddingWithText)).toBe(
      true,
    );
    expect(
      tabItemClassBuilder('primary', false, StdIconId.Add).contentContainerClasses.includes(PADDING_X.paddingWithIcon),
    ).toBe(true);
    expect(tabItemClassBuilder('primary', false).contentContainerClasses.includes(PADDING_Y.primary)).toBe(true);
  });

  it('should have the proper secondary padding classes', () => {
    expect(tabItemClassBuilder('secondary', false).contentContainerClasses.includes(PADDING_X.paddingWithText)).toBe(
      true,
    );
    expect(
      tabItemClassBuilder('secondary', false, StdIconId.Add).contentContainerClasses.includes(
        PADDING_X.paddingWithIcon,
      ),
    ).toBe(true);
    expect(tabItemClassBuilder('secondary', false).contentContainerClasses.includes(PADDING_Y.secondary)).toBe(true);
  });

  it('should have the proper active classes', () => {
    expect(
      tabItemClassBuilder('primary', false, undefined, true).contentContainerClasses.includes(ACTIVE_CLASSES.active),
    ).toBe(true);
    expect(tabItemClassBuilder('primary', false, undefined, true).borderClasses.includes(BORDER_CLASSES.active)).toBe(
      true,
    );

    expect(
      tabItemClassBuilder('primary', false, undefined, false).contentContainerClasses.includes(ACTIVE_CLASSES.inactive),
    ).toBe(true);
    expect(
      tabItemClassBuilder('primary', false, undefined, false).borderClasses.includes(BORDER_CLASSES.inactive),
    ).toBe(true);

    expect(
      tabItemClassBuilder('secondary', false, undefined, true).contentContainerClasses.includes(ACTIVE_CLASSES.active),
    ).toBe(true);
    expect(
      tabItemClassBuilder('secondary', false, undefined, false).contentContainerClasses.includes(
        ACTIVE_CLASSES.inactive,
      ),
    ).toBe(true);
  });
  it('should have the proper keyboad active classes', () => {
    expect(tabItemClassBuilder('primary', true).contentContainerClasses.includes(KEYBOARD_ACTIVE_CLASSES)).toBe(true);
    expect(tabItemClassBuilder('secondary', true).contentContainerClasses.includes(KEYBOARD_ACTIVE_CLASSES)).toBe(true);
    expect(tabItemClassBuilder('primary', true).borderClasses.includes(KEYBOARD_BORDER_ACTIVE_CLASSES)).toBe(true);

    expect(tabItemClassBuilder('primary', false).contentContainerClasses.includes(KEYBOARD_ACTIVE_CLASSES)).toBe(false);
    expect(tabItemClassBuilder('secondary', false).contentContainerClasses.includes(KEYBOARD_ACTIVE_CLASSES)).toBe(
      false,
    );
    expect(tabItemClassBuilder('primary', false).borderClasses.includes(` ${KEYBOARD_BORDER_ACTIVE_CLASSES}`)).toBe(
      false,
    );
  });

  it('should have the proper disabled classes', () => {
    expect(
      tabItemClassBuilder('primary', true, undefined, undefined, true).contentContainerClasses.includes(
        DISABLED_CLASSES,
      ),
    ).toBe(true);
    expect(
      tabItemClassBuilder('secondary', true, undefined, undefined, true).contentContainerClasses.includes(
        DISABLED_CLASSES,
      ),
    ).toBe(true);
    expect(
      tabItemClassBuilder('primary', true, undefined, undefined, true).borderClasses.includes(
        ` ${BORDER_CLASSES.disabled}`,
      ),
    ).toBe(true);

    expect(
      tabItemClassBuilder('primary', true, undefined, undefined, true).contentContainerClasses.includes(
        ENABLED_CLASSES,
      ),
    ).toBe(false);
    expect(
      tabItemClassBuilder('secondary', true, undefined, undefined, true).contentContainerClasses.includes(
        ENABLED_CLASSES,
      ),
    ).toBe(false);
    expect(
      tabItemClassBuilder('primary', true, undefined, undefined, true).borderClasses.includes(
        ` ${BORDER_CLASSES.inactive}`,
      ),
    ).toBe(false);
  });
});
