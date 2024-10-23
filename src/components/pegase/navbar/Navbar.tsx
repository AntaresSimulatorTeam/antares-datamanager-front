/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import StdDivider from '@/components/common/layout/stdDivider/StdDivider';
import StdNavbarController from '@/components/common/layout/stdNavbar/StdNavbarController';
import StdNavbarHeader from '@/components/common/layout/stdNavbar/StdNavbarHeader';
import StdNavbarMenu from '@/components/common/layout/stdNavbar/StdNavbarMenu';
import { navbarClassBuilder } from '@/components/common/layout/stdNavbar/navbarClassBuilder';
import { APP_NAME } from '@/shared/constants';
import { MenuNavItem } from '@/shared/types';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

type StdNavbarProps = {
  topItems: MenuNavItem[];
  bottomItems: MenuNavItem[];
  id: string;
};
const Navbar = ({ id, topItems, bottomItems }: StdNavbarProps) => {
  const [expanded, setExpanded] = useState(true);
  const { t } = useTranslation();
  const toggleExpanded = () => {
    setExpanded((oldExpanded) => !oldExpanded);
  };
  const navbarClasses = navbarClassBuilder(expanded);
  const controllerLabel = expanded ? t('components.navbar.@minimize') : t('components.navbar.@expand');
  const controllerId = `${id}-controller`;
  return (
    <nav id={id} className={navbarClasses} aria-label={APP_NAME}>
      <StdNavbarHeader
        appName={APP_NAME}
        id={id}
        target="/"
        version={`v${import.meta.env.VITE_APP_VERSION}`}
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
export default Navbar;
