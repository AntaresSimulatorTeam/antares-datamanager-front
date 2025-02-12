/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { User, UserManager } from 'oidc-client-ts';
import { config } from '@/shared/const/authConfig';
import { getEnvVariables } from '@/envVariables';


const userManager = new UserManager(config);


const isAuthEnabled = getEnvVariables('APP_AUTH_ENABLED');

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
    if (isAuthEnabled) {
      const token = await AuthService.getAccessToken();
      if (token) {
        // Add Authorization header for different types of options.headers
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
    }
    // Perform the fetch request
    return await fetch(url, options);
  }
};

  
