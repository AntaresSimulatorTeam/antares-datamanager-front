import { clsx } from 'clsx';
import { HeaderStyleLogoConfig } from './StdNavbar';
import { navbarHeaderClassBuilder } from './navbarClassBuilder.ts';
import { AnchorDefaultAsType } from '@common/base/element.type.ts';
import { ElementType } from 'react';

type StdNavbarHeaderProps<E extends ElementType> = {
  headerConfig: HeaderStyleLogoConfig<E>;
  expanded?: boolean;
};

const WRAPPER_COMMON_CLASSES = 'm-1 mt-2 rounded flex items-center gap-0.5 p-1';
const WRAPPER_FOCUS_CLASSES =
  'focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-0 focus-visible:outline-gray-50';

const StdNavbarLogoHeader = <E extends ElementType = AnchorDefaultAsType>({
  headerConfig,
  expanded = true,
}: StdNavbarHeaderProps<E>) => {
  const {
    logoConfig,
    appName,
    appVersion,
    variant: _1,
    versionTextColor: _2,
    headerId: _3,
    as,
    ...otherProps
  } = headerConfig;
  const { versionClasses } = navbarHeaderClassBuilder(headerConfig);
  const Link = as ?? AnchorDefaultAsType;

  return (
    <Link {...otherProps} className={clsx(WRAPPER_COMMON_CLASSES, WRAPPER_FOCUS_CLASSES)}>
      {expanded ? (
        <>
          <div className="h-4">
            <img src={logoConfig.logoExpandedHref} alt={appName} className="h-4 min-w-max object-contain" />
          </div>
          <div className={versionClasses}>{appVersion}</div>
        </>
      ) : (
        <div className="flex h-4 items-center justify-center py-0.25">
          <img src={logoConfig.logoCollapsedHref} alt={appName} className="h-4 min-w-max object-contain" />
        </div>
      )}
    </Link>
  );
};

export default StdNavbarLogoHeader;
