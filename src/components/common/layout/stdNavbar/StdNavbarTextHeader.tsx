import { clsx } from 'clsx';
import { HeaderStyleTextConfig } from './StdNavbar';
import { navbarHeaderClassBuilder } from './navbarClassBuilder';
import { AnchorDefaultAsType } from '@common/base/element.type.ts';
import { ElementType } from 'react';

type StdNavbarTextHeaderProps<E extends ElementType = AnchorDefaultAsType> = {
  expanded?: boolean;
  headerConfig: HeaderStyleTextConfig<E>;
};

const WRAPPER_COMMON_CLASSES = 'm-1 mt-2 rounded flex items-center gap-1 p-1';
const WRAPPER_FOCUS_CLASSES =
  'focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-0 focus-visible:outline-gray-900';

const StdNavbarTextHeader = <E extends ElementType = AnchorDefaultAsType>({
  expanded = true,
  headerConfig,
}: StdNavbarTextHeaderProps<E>) => {
  const { appName, appTwoLetters, appVersion, as, to, ...otherProps } = headerConfig;
  const { twoLettersClasses, versionClasses } = navbarHeaderClassBuilder(headerConfig);
  const Link = as ?? AnchorDefaultAsType;

  return (
    <Link {...otherProps} to={to} className={clsx(WRAPPER_COMMON_CLASSES, WRAPPER_FOCUS_CLASSES)}>
      <div className={twoLettersClasses}>{appTwoLetters}</div>
      {expanded && (
        <>
          <div className="text-heading-xs font-semibold">{appName}</div>
          <div className={versionClasses}>{appVersion}</div>
        </>
      )}
    </Link>
  );
};

export default StdNavbarTextHeader;
