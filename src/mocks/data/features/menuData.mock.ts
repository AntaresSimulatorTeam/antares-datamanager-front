/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { MenuNavItem } from '@/shared/types';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps';

export const menuTopData: MenuNavItem[] = [
  {
    id: 'home-link',
    key: 'home',
    label: 'Accueil',
    path: '/',
    icon: StdIconId.Home,
  },
  {
    id: 'lastProject-link',
    key: 'lastProject',
    label: 'Dernier Projet',
    path: '/lastprojects',
    icon: StdIconId.History,
  },
  {
    id: 'favorites-link',
    key: 'favorites',
    label: "Favoris",
    path: '/',
    icon: StdIconId.PushPin,
  },
  {
    id: 'parameter-link',
    key: 'parameter',
    label: 'Paramètres',
    path: '/',
    icon: StdIconId.Tune,
  },
  {
    id: 'antares-link',
    key: 'antares',
    label: 'Antarès',
    path: '/',
    icon: StdIconId.Apps,
  },
];

export const menuBottomData: MenuNavItem[] = [
  {
    key: 'account',
    label: 'Mon compte',
    path: '/',
    icon: StdIconId.AccountCircle,
  },
  {
    key: 'help',
    label: 'Aide',
    path: '/help',
    icon: StdIconId.Help,
  },
  {
    key: 'admin',
    label: 'Administration',
    path: '/settings',
    icon: StdIconId.Settings,
  },
  {
    key: 'logout',
    label: 'Se déconnecter',
    path: '/',
    icon: StdIconId.Logout,
  },
];
