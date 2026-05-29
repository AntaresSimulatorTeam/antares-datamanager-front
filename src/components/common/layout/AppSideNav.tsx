import { MenuNavItem } from '@/shared/types';
import { headerConfig } from '@/shared/const/headerConfig.ts';
import { PEGASE_NAVBAR_ID } from '@/shared/constants.ts';
import { SideNav } from '@design-system-rte/react';
import { memo } from 'react';

type AppSideNavProps = { topItems: MenuNavItem[]; bottomItems: MenuNavItem[] };

export const AppSideNav = memo(({ topItems, bottomItems }: AppSideNavProps) => (
  <SideNav id={PEGASE_NAVBAR_ID} collapsible headerConfig={headerConfig} items={topItems} footerItems={bottomItems} />
));
AppSideNav.displayName = 'AppSideNav';
