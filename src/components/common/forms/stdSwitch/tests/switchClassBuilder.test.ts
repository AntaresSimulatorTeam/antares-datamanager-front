/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import {
  COMMON_BG_CLASSES,
  COMMON_SLIDE_CLASSES,
  COMMON_CHECK_CONTAINER_CLASSES,
  ICON_CONTAINER_CLASSES,
  switchClassBuilder,
  SLIDE_CLASSES,
  BG_CLASSES,
  DISABLED_BG_CLASSES,
  DISABLED_SLIDE_CHECKED_CLASSES,
  DISABLED_SLIDE_UNCHECKED_CLASSES,
  ENABLED_BG_CLASSES,
  ENABLED_SLIDE_CHECKED_CLASSES,
  ENABLED_SLIDE_UNCHECKED_CLASSES,
} from '../SwitchClassBuilder';

describe('switchClassBuilder function', () => {
  it('should have the common classes', () => {
    expect(switchClassBuilder('small', false).backgroundClasses.includes(COMMON_BG_CLASSES)).toBe(true);
    expect(switchClassBuilder('medium', false).backgroundClasses.includes(COMMON_BG_CLASSES)).toBe(true);

    expect(switchClassBuilder('small', false).slideClasses.includes(COMMON_SLIDE_CLASSES)).toBe(true);
    expect(switchClassBuilder('medium', false).slideClasses.includes(COMMON_SLIDE_CLASSES)).toBe(true);

    expect(switchClassBuilder('small', false).iconContainerClasses.includes(COMMON_CHECK_CONTAINER_CLASSES)).toBe(true);
    expect(switchClassBuilder('medium', false).iconContainerClasses.includes(COMMON_CHECK_CONTAINER_CLASSES)).toBe(
      true,
    );
  });

  it('should have the proper size on background', () => {
    expect(switchClassBuilder('small', false).backgroundClasses.includes(BG_CLASSES.small)).toBe(true);
    expect(switchClassBuilder('medium', false).backgroundClasses.includes(BG_CLASSES.medium)).toBe(true);
  });

  it('should have the proper size on slide', () => {
    expect(switchClassBuilder('small', false).slideClasses.includes(SLIDE_CLASSES.small)).toBe(true);
    expect(switchClassBuilder('medium', false).slideClasses.includes(SLIDE_CLASSES.medium)).toBe(true);
  });

  it('should have the proper size on icon container', () => {
    expect(switchClassBuilder('small', false).iconContainerClasses.includes(ICON_CONTAINER_CLASSES.small)).toBe(true);
    expect(switchClassBuilder('medium', false).iconContainerClasses.includes(ICON_CONTAINER_CLASSES.medium)).toBe(true);
  });

  it('should have the proper size on icon', () => {
    expect(switchClassBuilder('small', false).iconSize).toBe(12);
    expect(switchClassBuilder('medium', false).iconSize).toBe(16);
  });

  it('should have the enabled classes', () => {
    const enabledMediumClasses = switchClassBuilder('medium', false);
    expect(enabledMediumClasses.backgroundClasses.includes(ENABLED_BG_CLASSES)).toBe(true);

    expect(enabledMediumClasses.backgroundClasses.includes(ENABLED_BG_CLASSES)).toBe(true);
    expect(enabledMediumClasses.slideClasses.includes(ENABLED_SLIDE_CHECKED_CLASSES)).toBe(true);
    expect(enabledMediumClasses.slideClasses.includes(ENABLED_SLIDE_UNCHECKED_CLASSES)).toBe(true);
  });

  it('should have the disabled classes', () => {
    const disabledMediumClasses = switchClassBuilder('medium', true);
    expect(disabledMediumClasses.backgroundClasses.includes(DISABLED_BG_CLASSES)).toBe(true);

    expect(disabledMediumClasses.backgroundClasses.includes(DISABLED_BG_CLASSES)).toBe(true);
    expect(disabledMediumClasses.slideClasses.includes(DISABLED_SLIDE_CHECKED_CLASSES)).toBe(true);
    expect(disabledMediumClasses.slideClasses.includes(DISABLED_SLIDE_UNCHECKED_CLASSES)).toBe(true);
  });
});
