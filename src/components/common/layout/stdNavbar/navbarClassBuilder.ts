import { TailwindColorClass } from '@/shared/types/TailwindColorClass.type';
import { buildColorClass } from '@/shared/utils/tailwindClass';
import { clsx } from 'clsx';
import { HeaderStyleConfig, ItemStyleConfig } from './StdNavbar';
import { AnchorDefaultAsType } from '@common/base/element.type.ts';
import { ElementType } from 'react';

export const NAVBAR_BASE_CLASSES =
  'flex-none flex flex-col border-r text-left gap-2 h-screen transition-all ease-out duration-300';

export const NAVBAR_COLOR_CLASSES = {
  classic: 'bg-gray-50 border-gray-300',
  imagrid: 'bg-primary-950 border-gray-200 text-gray-50',
};

export const NAVBAR_EXPANDED_CLASSES = 'w-28 px-1';
export const NAVBAR_COLLAPSED_CLASSES = 'w-8 items-center';

export const DEFAULT_BACKGROUND_CONFIG: Required<ItemStyleConfig> = {
  main: 'gray-w',
  hover: 'gray-w',
  active: 'gray-w',
  selected: 'gray-w',
} as const;

export const DEFAULT_CONTENT_CONFIG: Required<ItemStyleConfig> = {
  main: 'gray-700',
  hover: 'gray-900',
  active: 'gray-900',
  selected: 'gray-900',
} as const;

export const DEFAULT_SEPARATOR_COLOR: TailwindColorClass = 'gray-300';

export const DEFAULT_TEXT_COLOR = 'gray-900';

export const navbarClassBuilder = (
  expanded: boolean,
  backgroundColor?: TailwindColorClass,
  separatorColor?: TailwindColorClass,
  textColor?: TailwindColorClass,
) =>
  clsx(
    NAVBAR_BASE_CLASSES,
    buildColorClass('text', textColor || DEFAULT_TEXT_COLOR),
    buildColorClass('bg', backgroundColor || DEFAULT_CONTENT_CONFIG.main),
    buildColorClass('border', separatorColor || DEFAULT_SEPARATOR_COLOR),
    expanded ? NAVBAR_EXPANDED_CLASSES : NAVBAR_COLLAPSED_CLASSES,
  );

export const NAVBAR_ITEM_BASE_CLASSES =
  'border-l-2 border-transparent m-1 flex items-center gap-1 truncate rounded p-1 text-button-s font-semibold';
export const NAVBAR_ITEM_FOCUS_CLASSES = 'focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-0';

export const NAVBAR_ITEM_COMMON_CLASSES = clsx(NAVBAR_ITEM_BASE_CLASSES, NAVBAR_ITEM_FOCUS_CLASSES);
export const NAVBAR_ITEM_COLLAPSED_CLASSES = 'w-fit';

export const navbarItemClassBuilder = (
  selected: boolean,
  expanded: boolean,
  itemBackgroundConfig?: ItemStyleConfig,
  itemContentConfig?: ItemStyleConfig,
) => {
  const navbarItemStatusClasses = clsx(
    buildColorClass('bg', itemBackgroundConfig?.main || DEFAULT_BACKGROUND_CONFIG.main),
    buildColorClass('border-b', itemBackgroundConfig?.hover || DEFAULT_BACKGROUND_CONFIG.hover, 'hover:'),
    buildColorClass('text', itemContentConfig?.hover || DEFAULT_CONTENT_CONFIG.hover, 'hover:'),
    buildColorClass('border-b', itemBackgroundConfig?.active || DEFAULT_BACKGROUND_CONFIG.active, 'active:'),
    buildColorClass('text', itemContentConfig?.active || DEFAULT_CONTENT_CONFIG.active, 'active:'),
    buildColorClass('bg', itemBackgroundConfig?.active || DEFAULT_BACKGROUND_CONFIG.active, '[&.active]:'),
    buildColorClass('text', itemContentConfig?.active || DEFAULT_CONTENT_CONFIG.active, '[&.active]:'),
  );

  const navbarItemFocusExtraClasses = buildColorClass(
    'outline',
    itemContentConfig?.hover || DEFAULT_CONTENT_CONFIG.hover,
    'focus-visible:',
  );

  const navbarItemBaseClasses = clsx(NAVBAR_ITEM_COMMON_CLASSES, navbarItemStatusClasses, navbarItemFocusExtraClasses);
  const expandedClasses = !expanded ? NAVBAR_ITEM_COLLAPSED_CLASSES : '';

  if (selected) {
    return clsx(
      navbarItemBaseClasses,
      expandedClasses,
      buildColorClass('bg', itemBackgroundConfig?.selected || DEFAULT_BACKGROUND_CONFIG.selected, '[&]:'),
      buildColorClass('text', itemContentConfig?.selected || DEFAULT_CONTENT_CONFIG.selected, '[&]:'),
    );
  }

  return clsx(navbarItemBaseClasses, expandedClasses);
};

export const NAVBAR_CONTROLLER_BASE_CLASSES = 'w-fill mb-2';

export const navbarControllerClassBuilder = (
  expanded: boolean,
  itemBackgroundConfig?: ItemStyleConfig,
  itemContentConfig?: ItemStyleConfig,
) =>
  clsx(
    navbarItemClassBuilder(false, expanded, itemBackgroundConfig, itemContentConfig),
    NAVBAR_CONTROLLER_BASE_CLASSES,
  );

export const TWO_LETTERS_CLASSES = 'rounded px-0.75 py-0.5 text-body-xs font-semibold';
export const VERSIONS_CLASSES = {
  text: 'text-heading-xs',
  logo: 'self-end text-heading-xs',
};

export const DEFAULT_TWO_LETTERS_BACKGROUND = 'primary-600';
export const DEFAULT_TWO_LETTERS_TEXT = 'gray-w';

export const navbarHeaderClassBuilder = <E extends ElementType = AnchorDefaultAsType>(
  headerConfig: HeaderStyleConfig<E>,
) => {
  if (headerConfig.variant === 'text') {
    return {
      twoLettersClasses: clsx(
        TWO_LETTERS_CLASSES,
        buildColorClass('bg', headerConfig.twoLettersBackground || DEFAULT_TWO_LETTERS_BACKGROUND),
        buildColorClass('text', headerConfig.twoLettersColor || DEFAULT_TWO_LETTERS_TEXT),
      ),
      versionClasses: clsx(
        VERSIONS_CLASSES[headerConfig.variant],
        buildColorClass('text', headerConfig.versionTextColor),
      ),
    };
  }
  return {
    versionClasses: clsx(
      VERSIONS_CLASSES[headerConfig.variant],
      buildColorClass('text', headerConfig.versionTextColor),
    ),
  };
};
