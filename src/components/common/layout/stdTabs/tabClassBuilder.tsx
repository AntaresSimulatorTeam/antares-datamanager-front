/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { StdIconId } from '@/shared/utils/common/mappings/iconMaps';
import { clsx } from 'clsx';
import { TabItemType } from './StdTabItem';

export const COMMON_CONTENT_CONTAINER_CLASSES = 'h-5 peer inline-flex select-none items-center gap-1 text-button-s';

export const CONTENT_CONTAINER_CLASSES = {
  primary: 'rounded-t',
  secondary: 'rounded',
};

export const COMMON_BORDER_CLASSES = 'h-0.25';

export const BORDER_CLASSES = {
  active: 'bg-primary-600',
  inactive: 'bg-gray-300 peer-hover:bg-primary-600 peer-active:bg-primary-900',
  disabled: 'bg-gray-300',
};

export const KEYBOARD_BORDER_ACTIVE_CLASSES = 'bg-primary-900';

export const ENABLED_CLASSES =
  'outline-0 focus-visible:ring-inset focus-visible:ring-gray-900 focus-visible:ring-1 focus:z-10';

export const ACTIVE_CLASSES = {
  active: 'text-primary-600 border-b-primary-600',
  inactive:
    'hover:bg-primary-50 hover:text-primary-600 active:bg-primary-100 active:text-primary-900 hover:cursor-pointer',
};

export const KEYBOARD_ACTIVE_CLASSES = 'bg-primary-100 text-primary-900';

export const DISABLED_CLASSES = '[&]:cursor-not-allowed [&]:text-gray-400';

export const PADDING_X = {
  paddingWithIcon: 'px-3',
  paddingWithText: 'px-2',
};

export const PADDING_Y = {
  primary: 'py-1.5',
  secondary: 'py-1',
};

const paddingTab = (tabType: TabItemType, icon?: StdIconId) => {
  const paddingX = icon ? PADDING_X.paddingWithIcon : PADDING_X.paddingWithText;
  const paddingY = PADDING_Y[tabType];

  return clsx(paddingX, paddingY);
};

export const tabItemClassBuilder = (
  tabType: TabItemType,
  keyboardActive: boolean,
  icon?: StdIconId,
  active?: boolean,
  disabled?: boolean,
) => {
  const classes = {
    contentContainerClasses: clsx(
      COMMON_CONTENT_CONTAINER_CLASSES,
      CONTENT_CONTAINER_CLASSES[tabType],
      paddingTab(tabType, icon),
    ),
    borderClasses: COMMON_BORDER_CLASSES,
  };

  if (disabled) {
    classes.contentContainerClasses = clsx(classes.contentContainerClasses, DISABLED_CLASSES);
    classes.borderClasses = clsx(classes.borderClasses, BORDER_CLASSES.disabled);
    return classes;
  }

  classes.contentContainerClasses = clsx(
    classes.contentContainerClasses,
    disabled ? '' : ENABLED_CLASSES,
    active ? ACTIVE_CLASSES.active : ACTIVE_CLASSES.inactive,
    keyboardActive ? KEYBOARD_ACTIVE_CLASSES : '',
  );

  classes.borderClasses = clsx(
    classes.borderClasses,
    active ? BORDER_CLASSES.active : BORDER_CLASSES.inactive,
    keyboardActive && !active ? KEYBOARD_BORDER_ACTIVE_CLASSES : '',
  );

  return classes;
};

export const COMMON_LIST_BUTTON_CLASSES = 'flex items-center px-2 absolute h-full bg-gray-w z-10';

const showButtonTabs = (scrollValue: number, clientWidth?: number, scrollWidth?: number) => {
  if (!(clientWidth && scrollWidth)) {
    return { left: false, right: false };
  }

  return {
    left: scrollWidth > clientWidth && scrollValue > 0,
    right: scrollWidth > clientWidth && scrollValue + clientWidth < scrollWidth,
  };
};

export const PRIMARY_BORDER_BUTTON_CLASSES = 'border-gray-300 border-b-2';

export const tabListClassBuilder = (
  tabType: TabItemType,
  scrollValue: number,
  clientWidth?: number,
  scrollWidth?: number,
) => {
  const commonClasses = clsx(COMMON_LIST_BUTTON_CLASSES, tabType === 'primary' ? PRIMARY_BORDER_BUTTON_CLASSES : '');
  const classes = {
    buttonClasses: {
      left: commonClasses,
      right: commonClasses,
    },
  };
  classes.buttonClasses = {
    left: clsx(
      classes.buttonClasses.left,
      'left-0',
      showButtonTabs(scrollValue, clientWidth, scrollWidth).left ? '' : 'hidden',
    ),
    right: clsx(
      classes.buttonClasses.right,
      'right-0',
      showButtonTabs(scrollValue, clientWidth, scrollWidth).right ? '' : 'hidden',
    ),
  };
  return classes;
};
