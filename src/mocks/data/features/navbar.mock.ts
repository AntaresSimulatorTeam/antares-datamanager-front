import { MenuNavItem } from '@/shared/types';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps.ts';

export const menuTopData: MenuNavItem[] = [
  {
    id: 'home-link',
    key: 'home',
    label: 'Home',
    path: '/',
    as: 'a',
    icon: StdIconId.Home,
    component: () => '',
  },
  {
    id: 'project-link',
    key: 'project',
    label: 'Project',
    path: '/projects',
    as: 'a',
    icon: StdIconId.Folder,
    component: () => '',
  },
  {
    id: 'logs-link',
    key: 'logs',
    label: 'logs',
    path: '/logs',
    as: 'a',
    icon: StdIconId.ReceiptLong,
    component: () => '',
  },
  {
    id: 'parameters-link',
    key: 'parameters',
    label: 'parameters',
    path: '/parameters',
    as: 'a',
    icon: StdIconId.Settings,
    component: () => '',
  },
  {
    id: 'antares-link',
    key: 'antares',
    label: 'page.@antares',
    path: '/antares',
    as: 'a',
    icon: StdIconId.Apps,
    component: () => '',
  },
  {
    id: 'about-link',
    key: 'about',
    label: 'about',
    path: '/about',
    as: 'a',
    icon: StdIconId.Info,
    component: () => '',
  },
];
