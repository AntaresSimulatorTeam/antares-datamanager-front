/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import {
  buttonClassBuilder,
  COMMON_CLASSES,
  VARIANT_CLASSES,
  SIZE_CLASSES,
  FOCUS_CLASSES,
  VARIANT_CLASSES_DISABLED,
  labelClassBuilder,
  SINGLE_ICON_CLASSES,
  LABEL_CLASSES_PADDING_SIZE,
} from '../buttonClassBuilder';

describe('buttonClassBuilder function', () => {
  it('should have the common classes', () => {
    expect(buttonClassBuilder('contained', 'primary', 'medium', false, true).includes(COMMON_CLASSES)).toBe(true);
  });
  it('should have the proper variant and color classes', () => {
    expect(
      buttonClassBuilder('contained', 'primary', 'medium', false, true).includes(VARIANT_CLASSES.primary.contained),
    ).toBe(true);
    expect(
      buttonClassBuilder('dashed', 'primary', 'medium', false, true).includes(VARIANT_CLASSES.primary.dashed),
    ).toBe(true);
    expect(
      buttonClassBuilder('outlined', 'primary', 'medium', false, true).includes(VARIANT_CLASSES.primary.outlined),
    ).toBe(true);
    expect(buttonClassBuilder('text', 'primary', 'medium', false, true).includes(VARIANT_CLASSES.primary.text)).toBe(
      true,
    );
    expect(
      buttonClassBuilder('transparent', 'primary', 'medium', false, true).includes(VARIANT_CLASSES.primary.transparent),
    ).toBe(true);
    expect(
      buttonClassBuilder('contained', 'secondary', 'medium', false, true).includes(VARIANT_CLASSES.secondary.contained),
    ).toBe(true);
    expect(
      buttonClassBuilder('dashed', 'secondary', 'medium', false, true).includes(VARIANT_CLASSES.secondary.dashed),
    ).toBe(true);
    expect(
      buttonClassBuilder('outlined', 'secondary', 'medium', false, true).includes(VARIANT_CLASSES.secondary.outlined),
    ).toBe(true);
    expect(
      buttonClassBuilder('text', 'secondary', 'medium', false, true).includes(VARIANT_CLASSES.secondary.text),
    ).toBe(true);
    expect(
      buttonClassBuilder('transparent', 'secondary', 'medium', false, true).includes(
        VARIANT_CLASSES.secondary.transparent,
      ),
    ).toBe(true);
  });
  it('should have the proper size classes', () => {
    expect(buttonClassBuilder('contained', 'primary', 'medium', false, true).includes(SIZE_CLASSES.medium)).toBe(true);
    expect(buttonClassBuilder('contained', 'primary', 'small', false, true).includes(SIZE_CLASSES.small)).toBe(true);
  });
  it('should have the proper focus and color classes if disabled is false', () => {
    expect(buttonClassBuilder('contained', 'primary', 'medium', false, true).includes(FOCUS_CLASSES.primary)).toBe(
      true,
    );
    expect(buttonClassBuilder('contained', 'secondary', 'medium', false, true).includes(FOCUS_CLASSES.secondary)).toBe(
      true,
    );
  });
  it('should not have any focus class if disabled is true', () => {
    expect(buttonClassBuilder('contained', 'primary', 'medium', true, true).includes(FOCUS_CLASSES.primary)).toBe(
      false,
    );
    expect(buttonClassBuilder('contained', 'secondary', 'medium', true, true).includes(FOCUS_CLASSES.secondary)).toBe(
      false,
    );
  });
  it('should have the proper disabled classes', () => {
    expect(
      buttonClassBuilder('contained', 'primary', 'medium', true, true).includes(VARIANT_CLASSES_DISABLED.contained),
    ).toBe(true);
    expect(
      buttonClassBuilder('dashed', 'primary', 'medium', true, true).includes(VARIANT_CLASSES_DISABLED.dashed),
    ).toBe(true);
    expect(
      buttonClassBuilder('outlined', 'primary', 'medium', true, true).includes(VARIANT_CLASSES_DISABLED.outlined),
    ).toBe(true);
    expect(buttonClassBuilder('text', 'primary', 'medium', true, true).includes(VARIANT_CLASSES_DISABLED.text)).toBe(
      true,
    );
    expect(
      buttonClassBuilder('transparent', 'primary', 'medium', true, true).includes(VARIANT_CLASSES_DISABLED.transparent),
    ).toBe(true);
  });
  it('should have the proper classes if there is no label and only one icon', () => {
    expect(buttonClassBuilder('contained', 'primary', 'medium', true, false).includes(SINGLE_ICON_CLASSES.medium)).toBe(
      true,
    );
    expect(buttonClassBuilder('contained', 'primary', 'small', true, false).includes(SINGLE_ICON_CLASSES.small)).toBe(
      true,
    );
  });
});

describe('button labelClassBuilder function', () => {
  it('should return uniform margin if the component has no icon', () => {
    expect(labelClassBuilder('extraSmall').includes(LABEL_CLASSES_PADDING_SIZE.extraSmall)).toBe(true);
    expect(labelClassBuilder('small').includes(LABEL_CLASSES_PADDING_SIZE.small)).toBe(true);
    expect(labelClassBuilder('medium').includes(LABEL_CLASSES_PADDING_SIZE.medium)).toBe(true);
  });
});
