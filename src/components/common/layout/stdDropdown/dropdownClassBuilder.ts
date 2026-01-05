import { clsx } from 'clsx';

export const COMMON_ELEMENT_CLASSES = 'flex gap-1 text-body-s items-center p-1 mx-0.25 rounded bg-gray-w focus:z-50';
export const COMMON_ELEMENT_STATUS_CLASSES =
  'focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-0 focus-visible:outline-gray-900';
export const DISABLED_CLASSES = 'text-gray-500 outline-none';
export const ACTIVE_CLASSES = {
  active: 'bg-primary-50 text-primary-900 hover:bg-primary-100',
  inactive: 'hover:bg-gray-100 hover:text-gray-800 active:bg-gray-200 active:text-gray-900',
};

export const KEYBOARD_ACTIVE_CLASSES = '[&]:bg-gray-200 [&]:text-gray-900';

export const dropdownElementClassBuilder = (
  disabled: boolean,
  active: boolean,
  keyboardActive: boolean,
  additionnalClasses?: string,
) => {
  if (disabled) {
    const pointer = disabled ? 'cursor-not-allowed disabled text-gray-400' : 'cursor-pointer text-gray-700';
    return clsx(COMMON_ELEMENT_CLASSES, DISABLED_CLASSES, pointer);
  } else {
    const activeKey = active ? 'active' : 'inactive';
    const classes = clsx(COMMON_ELEMENT_CLASSES, COMMON_ELEMENT_STATUS_CLASSES, ACTIVE_CLASSES[activeKey], {
      [KEYBOARD_ACTIVE_CLASSES]: keyboardActive,
    });
    return additionnalClasses ? clsx(classes, additionnalClasses) : classes;
  }
};
