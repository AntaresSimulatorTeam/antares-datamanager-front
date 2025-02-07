/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { User, UserManager } from 'oidc-client-ts';
import { getEnvVariables } from '@/envVariables.ts';

interface AuthConfig {
  authority: string;
  client_id: string;
  redirect_uri: string;
  scope: string;
  maxExpiresIn: number;
}

const config: AuthConfig = {
  client_id: getEnvVariables('VITE_OAUTH2_CLIENT_ID'),
  redirect_uri: getEnvVariables('VITE_OAUTH2_REDIRECT_URL'),
  authority: `${import.meta.env.VITE_AUTHORITY}`,
  scope: 'openid email profile',
  maxExpiresIn: 600,
};

const userManager = new UserManager(config);

export const AuthService = {
  login: async () => await userManager.signinRedirect(),
  refresh: () => userManager.signinSilent(),
  logout: () => userManager.signoutRedirect(),
  getUser: async (): Promise<User | null> => await userManager.getUser(),
  handleCallback: () => userManager.signinRedirectCallback(),

  getAccessToken: async (): Promise<string | null> => {
    const user = await userManager.getUser();
    return user?.access_token || null;
  },

  authFetch: async (url: string, options: RequestInit = {}): Promise<Response> => {
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
    return await fetch(url, options);
  },
};
