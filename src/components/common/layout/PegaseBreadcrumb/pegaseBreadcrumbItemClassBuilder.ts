import { clsx } from 'clsx';

export const BUTTON_COMMON_CLASSES =
  'rds-rounded rds-font-semibold rds-text-center rds-flex rds-items-center rds-text-gray-700 border border-gray-w';
export const BUTTON_FOCUS_CLASSES =
  'focus-visible:rds-outline focus-visible:rds-outline-1 focus-visible:rds-outline-offset-2 focus-visible:rds-outline-gray-900 focus-visible:rds-text-gray-900';
export const BUTTON_HOVER_CLASSES =
  'hover:rds-bg-gray-200 hover:border-gray-300 active:border-gray-300 active:rds-bg-gray-300 hover:rds-text-gray-900 active:rds-text-gray-900';
export const BUTTON_SIZE_CLASSES = 'rds-p-0.5';
export const BUTTON_KEYBOARD_ACTIVE_CLASSES = '[&]:rds-bg-gray-300 [&]:rds-text-gray-900';

const pegaseBreadcrumbItemClassBuilder = (isActiveKeyboard: boolean) => {
  let classes = clsx(BUTTON_COMMON_CLASSES, BUTTON_FOCUS_CLASSES, BUTTON_HOVER_CLASSES, BUTTON_SIZE_CLASSES);
  if (isActiveKeyboard) {
    classes = clsx(classes, BUTTON_KEYBOARD_ACTIVE_CLASSES);
  }
  return classes;
};

export { pegaseBreadcrumbItemClassBuilder };
