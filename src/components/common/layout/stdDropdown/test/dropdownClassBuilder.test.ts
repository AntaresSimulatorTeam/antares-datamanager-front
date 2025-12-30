import {
  ACTIVE_CLASSES,
  COMMON_ELEMENT_CLASSES,
  DISABLED_CLASSES,
  dropdownElementClassBuilder,
  KEYBOARD_ACTIVE_CLASSES,
} from '../dropdownClassBuilder';

const ADDITIONNAL_CLASS = '[&]:text-red-600';

describe('dropdownClassBuilder', () => {
  it('should always have the common classes', () => {
    expect(dropdownElementClassBuilder(false, false, false, ADDITIONNAL_CLASS).includes(COMMON_ELEMENT_CLASSES)).toBe(
      true,
    );
    expect(dropdownElementClassBuilder(false, true, false).includes(COMMON_ELEMENT_CLASSES)).toBe(true);
    expect(dropdownElementClassBuilder(true, false, false).includes(COMMON_ELEMENT_CLASSES)).toBe(true);
    expect(dropdownElementClassBuilder(true, true, false).includes(COMMON_ELEMENT_CLASSES)).toBe(true);
  });
  it('should have the extra classes when provided and disabled is false', () => {
    expect(dropdownElementClassBuilder(false, false, false, ADDITIONNAL_CLASS).includes(ADDITIONNAL_CLASS)).toBe(true);
    expect(dropdownElementClassBuilder(false, true, false, ADDITIONNAL_CLASS).includes(ADDITIONNAL_CLASS)).toBe(true);
    expect(dropdownElementClassBuilder(true, false, false, ADDITIONNAL_CLASS).includes(ADDITIONNAL_CLASS)).toBe(false);
    expect(dropdownElementClassBuilder(true, true, false, ADDITIONNAL_CLASS).includes(ADDITIONNAL_CLASS)).toBe(false);
    expect(dropdownElementClassBuilder(false, false, false).includes(ADDITIONNAL_CLASS)).toBe(false);
  });
  it('should have the proper active classes', () => {
    expect(dropdownElementClassBuilder(false, false, false).includes(ACTIVE_CLASSES['inactive'])).toBe(true);
    expect(dropdownElementClassBuilder(false, true, false).includes(ACTIVE_CLASSES['active'])).toBe(true);
  });
  it('should have the disabled classes when disabled is true', () => {
    expect(dropdownElementClassBuilder(true, false, false).includes(DISABLED_CLASSES)).toBe(true);
    expect(dropdownElementClassBuilder(false, false, false).includes(DISABLED_CLASSES)).toBe(false);
  });

  it('should have the active keyboard classes when the key is pressed', () => {
    expect(dropdownElementClassBuilder(false, false, true, ADDITIONNAL_CLASS).includes(KEYBOARD_ACTIVE_CLASSES)).toBe(
      true,
    );
    expect(dropdownElementClassBuilder(false, true, true).includes(KEYBOARD_ACTIVE_CLASSES)).toBe(true);
    expect(dropdownElementClassBuilder(false, false, true).includes(KEYBOARD_ACTIVE_CLASSES)).toBe(true);
  });
});
