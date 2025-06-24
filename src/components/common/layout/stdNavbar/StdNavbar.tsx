import { TailwindColorClass } from '@/shared/types/TailwindColorClass.type';
import { ElementType, PropsWithChildren, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AnchorDefaultAsType } from '@common/base/element.type';
import StdDivider from '../stdDivider/StdDivider';
import StdNavbarController from './StdNavbarController';
import StdNavbarLogoHeader from './StdNavbarLogoHeader';
import StdNavbarMenu from './StdNavbarMenu';
import StdNavbarTextHeader from './StdNavbarTextHeader';
import { navbarClassBuilder } from './navbarClassBuilder.ts';
import { NavbarContextProvider } from '@/store/contexts/navbarContext.tsx';
import { MenuNavItem, TailwindUtilityColorClass, ZIndex } from '@/shared/types';

export type NavbarConfig<E extends ElementType = AnchorDefaultAsType> = {
  header: HeaderStyleConfig<E>;
  itemContent?: ItemStyleConfig;
  itemBackground?: ItemBackgroundStyleConfig;
  separatorColor?: TailwindUtilityColorClass<'border'>;
  textColor?: TailwindUtilityColorClass<'text'>;
  zIndex?: ZIndex;
};

export type LogoConfig = {
  logoExpandedHref: string;
  logoCollapsedHref: string;
};

type HeaderCommonOwnConfig<E extends ElementType> = {
  versionTextColor: TailwindColorClass;
  appName: string;
  appVersion: string;
  to: string;
  as?: E;
};

export type HeaderCommonConfig<E extends ElementType> = HeaderCommonOwnConfig<E> &
  Omit<React.ComponentProps<E>, keyof HeaderCommonOwnConfig<E>>;

export type HeaderStyleLogoConfig<E extends ElementType = AnchorDefaultAsType> = {
  variant: 'logo';
  logoConfig: LogoConfig;
} & HeaderCommonConfig<E>;

export type HeaderStyleTextConfig<E extends ElementType = AnchorDefaultAsType> = {
  variant: 'text';
  appTwoLetters: string;
  twoLettersBackground?: TailwindColorClass;
  twoLettersColor?: TailwindColorClass;
} & HeaderCommonConfig<E>;

export type HeaderStyleConfig<E extends ElementType = AnchorDefaultAsType> =
  | HeaderStyleLogoConfig<E>
  | HeaderStyleTextConfig<E>;

export type ItemStyleConfig = {
  mainText: TailwindUtilityColorClass<'text'>;
  hoverText?: TailwindUtilityColorClass<'text', 'hover:'>;
  activeText?: TailwindUtilityColorClass<'text', 'active:'>;
  activeTextExplicit?: TailwindUtilityColorClass<'text', '[&.active]:'>;
  selectedText?: TailwindUtilityColorClass<'text', '[&]:'>;
  focusVisibleText?: TailwindUtilityColorClass<'outline', 'focus-visible:'>;
};

export type ItemBackgroundStyleConfig = {
  mainBg: TailwindUtilityColorClass<'bg'>;
  hoverBg?: TailwindUtilityColorClass<'bg', 'hover:'>;
  activeBg?: TailwindUtilityColorClass<'bg', 'active:'>;
  activeBgExplicit?: TailwindUtilityColorClass<'bg', '[&.active]:'>;
  selectedBg?: TailwindUtilityColorClass<'bg', '[&]:'>;
};

export type StdNavbarProps<E extends ElementType = AnchorDefaultAsType> = PropsWithChildren<{
  topItems: MenuNavItem[];
  bottomItems: MenuNavItem[];
  config: NavbarConfig<E>;
}>;

const StdNavbar = <E extends ElementType = AnchorDefaultAsType>({
  topItems,
  bottomItems,
  config,
  children,
}: StdNavbarProps<E>) => {
  const [expanded, setExpanded] = useState(true);
  const { t } = useTranslation();

  const toggleExpanded = () => {
    setExpanded((oldExpanded) => !oldExpanded);
  };

  const backgroundColor = config.itemBackground?.mainBg;
  const { separatorColor, textColor, itemContent, itemBackground, zIndex } = config;

  const navbarClasses = navbarClassBuilder(expanded, backgroundColor, separatorColor, textColor);
  const controllerLabel = expanded ? t('components.navbar.@minimize') : t('components.navbar.@expand');

  return (
    <nav className={`${navbarClasses} ${zIndex}`} aria-label={config.header.appName}>
      {config.header.variant === 'text' ? (
        <StdNavbarTextHeader expanded={expanded} headerConfig={config.header} />
      ) : (
        <StdNavbarLogoHeader expanded={expanded} headerConfig={config.header} />
      )}
      <StdNavbarMenu menuItems={topItems} expanded={expanded} itemsStyleConfig={{ itemBackground, itemContent }} />

      <NavbarContextProvider expanded={expanded} setExpanded={setExpanded} config={config}>
        {children}
      </NavbarContextProvider>

      <StdDivider extraClasses="mt-auto" />
      <StdNavbarMenu menuItems={bottomItems} expanded={expanded} itemsStyleConfig={{ itemBackground, itemContent }} />
      <StdDivider />
      <StdNavbarController
        action={toggleExpanded}
        label={controllerLabel}
        expanded={expanded}
        itemsStyleConfig={{ itemBackground, itemContent }}
      />
    </nav>
  );
};

export default StdNavbar;
