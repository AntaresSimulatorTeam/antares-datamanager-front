/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { UserManager, User } from 'oidc-client-ts';
import { useMemo } from 'react';

interface AuthConfig {
  authority: string;
  client_id: string;
  redirect_uri: string;
  response_type: string;
  scope: string;
  post_logout_redirect_uri: string;
}

const config: AuthConfig = {
  authority: 'http://localhost:8090/auth/realms/PEGASE', // Remplacez par l'URL de votre serveur OIDC
  client_id: 'pegase-front',
  redirect_uri: 'http://localhost:8080',
  response_type: 'code',
  scope: 'openid profile roles',
  post_logout_redirect_uri: 'http://localhost:8080',
};

const userManager = new UserManager(config);

export const AuthService = {
  login: () => userManager.signinRedirect(),
  refresh: () => userManager.signinSilent(),
  logout: () => userManager.signoutRedirect(),
  getUser: async (): Promise<User | null> => await userManager.getUser(),
  handleCallback: () => userManager.signinRedirectCallback(),

  getAccessToken: async (): Promise<string | null> => {
    const user = await userManager.getUser();
    return user?.access_token || null;
  },

  authFetch: async (url: string, options: RequestInit = {}) => {
    const token = await AuthService.getAccessToken();
    if (token) {
      if (options.headers instanceof Headers) {
        options.headers.append('Authorization', `Bearer ${token}`);
      } else if (Array.isArray(options.headers)) {
        options.headers.push(['Authorization', `Bearer ${token}`]);
      } else {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${token}`,
        };
      }
    }
    return fetch(url, options);
  },

  hasPegaseUserRole: (role: string, user: any) =>
    useMemo(() => {
      return user?.profile.realm_access.roles?.includes(role);
    }, [user]),
};
