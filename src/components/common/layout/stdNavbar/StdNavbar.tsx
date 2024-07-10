/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useStdId } from '@/hooks/common/useStdId';
import { MenuNavItem } from '@/shared/types';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import StdDivider from '../stdDivider/StdDivider';
import StdNavbarController from './StdNavbarController';
import StdNavbarHeader from './StdNavbarHeader';
import StdNavbarMenu from './StdNavbarMenu';
import { navbarClassBuilder } from './navbarClassBuilder';

export type StdNavbarProps = {
  topItems: MenuNavItem[];
  bottomItems: MenuNavItem[];
  appName: string;
  appTwoLetters: string;
  appVersion: string;
  headerLink: string;
  id?: string;
};

const StdNavbar = ({
  topItems,
  bottomItems,
  appName,
  appTwoLetters,
  appVersion,
  headerLink,
  id: propsId,
}: StdNavbarProps) => {
  const [expanded, setExpanded] = useState(true);
  const { t } = useTranslation();

  const toggleExpanded = () => {
    setExpanded((oldExpanded) => !oldExpanded);
  };

  const navbarClasses = navbarClassBuilder(expanded);
  const id = useStdId('navbar', propsId);
  const controllerId = `${id}-controller`;
  const headerId = `${id}-header`;
  const controllerLabel = expanded ? t('components.navbar.@minimize') : t('components.navbar.@expand');

  return (
    <nav className={navbarClasses} id={id} aria-label={appName}>
      <StdNavbarHeader
        id={headerId}
        appName={appName}
        appTwoLetters={appTwoLetters}
        version={appVersion}
        target={headerLink}
        expanded={expanded}
      />
      <StdNavbarMenu menuItems={topItems} expanded={expanded} />
      <StdDivider extraClasses="mt-auto" />
      <StdNavbarMenu menuItems={bottomItems} expanded={expanded} />
      <StdDivider />
      <StdNavbarController action={toggleExpanded} id={controllerId} label={controllerLabel} expanded={expanded} />
    </nav>
  );
};

export default StdNavbar;
