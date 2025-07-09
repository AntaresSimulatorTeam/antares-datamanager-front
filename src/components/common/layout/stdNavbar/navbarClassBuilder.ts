import { clsx } from 'clsx';
import { HeaderStyleConfig, ItemBackgroundStyleConfig, ItemStyleConfig } from './StdNavbar';
import { AnchorDefaultAsType } from '@common/base/element.type.ts';
import { TailwindUtilityColorClass } from '@/shared/types';

export const NAVBAR_BASE_CLASSES =
  'flex-none flex flex-col border-r text-left gap-2 h-screen transition-all ease-out duration-300';

export const NAVBAR_COLOR_CLASSES = {
  classic: 'bg-gray-50 border-gray-300',
  imagrid: 'bg-primary-950 border-gray-200 text-gray-50',
};

export const NAVBAR_EXPANDED_CLASSES = 'flex-row w-28 px-1';
export const NAVBAR_COLLAPSED_CLASSES = 'items-center flex-col w-fit';

export const DEFAULT_BACKGROUND_CONFIG: Required<ItemBackgroundStyleConfig> = {
  mainBg: 'bg-gray-100',
  hoverBg: 'hover:bg-gray-200',
  activeBg: 'active:bg-gray-300',
  selectedBg: '[&]:bg-gray-300',
  activeBgExplicit: '[&.active]:bg-gray-300',
} as const;

export const DEFAULT_CONTENT_CONFIG: Required<ItemStyleConfig> = {
  mainText: 'text-gray-700',
  hoverText: 'hover:text-gray-900',
  activeText: 'active:text-gray-900',
  selectedText: '[&]:text-gray-900',
  focusVisibleText: 'focus-visible:outline-gray-900',
  activeTextExplicit: '[&.active]:text-gray-900',
} as const;

export const DEFAULT_SEPARATOR_COLOR = 'border-gray-200';

export const DEFAULT_TEXT_COLOR = 'text-gray-900';

export const navbarClassBuilder = (
  expanded: boolean,
  backgroundColor?: TailwindUtilityColorClass<'bg'>,
  separatorColor?: TailwindUtilityColorClass<'border'>,
  textColor?: TailwindUtilityColorClass<'text'>,
) =>
  clsx(
    NAVBAR_BASE_CLASSES,
    textColor || DEFAULT_TEXT_COLOR,
    backgroundColor || DEFAULT_BACKGROUND_CONFIG.mainBg,
    separatorColor || DEFAULT_SEPARATOR_COLOR,
    expanded ? NAVBAR_EXPANDED_CLASSES : NAVBAR_COLLAPSED_CLASSES,
  );

export const NAVBAR_ITEM_BASE_CLASSES = 'mx-1 flex items-center gap-1 truncate rounded p-1 text-button-s font-semibold';
export const NAVBAR_ITEM_FOCUS_CLASSES = 'focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-0';

export const NAVBAR_ITEM_COMMON_CLASSES = clsx(NAVBAR_ITEM_BASE_CLASSES, NAVBAR_ITEM_FOCUS_CLASSES);
export const NAVBAR_ITEM_COLLAPSED_CLASSES = 'w-fit';

export const navbarItemClassBuilder = (
  selected: boolean,
  expanded: boolean,
  itemBackgroundConfig?: ItemBackgroundStyleConfig,
  itemContentConfig?: ItemStyleConfig,
) => {
  const navbarItemStatusClasses = clsx(
    itemBackgroundConfig?.mainBg || DEFAULT_BACKGROUND_CONFIG.mainBg,
    itemBackgroundConfig?.hoverBg || DEFAULT_BACKGROUND_CONFIG.hoverBg,
    itemContentConfig?.hoverText || DEFAULT_CONTENT_CONFIG.hoverText,
    itemBackgroundConfig?.activeBg || DEFAULT_BACKGROUND_CONFIG.activeBg,
    itemContentConfig?.activeText || DEFAULT_CONTENT_CONFIG.activeText,
    itemBackgroundConfig?.activeBgExplicit || DEFAULT_BACKGROUND_CONFIG.activeBgExplicit,
    itemContentConfig?.activeTextExplicit || DEFAULT_CONTENT_CONFIG.activeTextExplicit,
  );

  const navbarItemFocusExtraClasses = itemContentConfig?.focusVisibleText || DEFAULT_CONTENT_CONFIG.focusVisibleText;
  const navbarItemBaseClasses = clsx(NAVBAR_ITEM_COMMON_CLASSES, navbarItemStatusClasses, navbarItemFocusExtraClasses);
  const expandedClasses = !expanded ? NAVBAR_ITEM_COLLAPSED_CLASSES : '';

  if (selected) {
    return clsx(
      navbarItemBaseClasses,
      expandedClasses,
      itemBackgroundConfig?.selectedBg || DEFAULT_BACKGROUND_CONFIG.selectedBg,
      itemContentConfig?.selectedText || DEFAULT_CONTENT_CONFIG.selectedText,
    );
  }

  return clsx(navbarItemBaseClasses, expandedClasses);
};

export const NAVBAR_CONTROLLER_BASE_CLASSES = 'w-(--fill-available) mb-2 cursor-pointer';

export const navbarControllerClassBuilder = (
  expanded: boolean,
  itemBackgroundConfig?: ItemBackgroundStyleConfig,
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

export const DEFAULT_TWO_LETTERS_BACKGROUND = 'bg-primary-600';
export const DEFAULT_TWO_LETTERS_TEXT = 'text-gray-w';

export const navbarHeaderClassBuilder = <E extends React.ElementType = AnchorDefaultAsType>(
  headerConfig: HeaderStyleConfig<E>,
) => {
  if (headerConfig.variant === 'text') {
    return {
      twoLettersClasses: clsx(
        TWO_LETTERS_CLASSES,
        headerConfig.twoLettersBackground || DEFAULT_TWO_LETTERS_BACKGROUND,
        headerConfig.twoLettersColor || DEFAULT_TWO_LETTERS_TEXT,
      ),
      versionClasses: clsx(VERSIONS_CLASSES[headerConfig.variant], headerConfig.versionTextColor),
    };
  }
  return {
    versionClasses: clsx(VERSIONS_CLASSES[headerConfig.variant], headerConfig.versionTextColor),
  };
};
