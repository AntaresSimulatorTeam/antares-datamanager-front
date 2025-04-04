/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { User, UserManager } from 'oidc-client-ts';
import { config } from '@/shared/const/authConfig';
import { isAuthenticationActive } from '@/shared/utils/authUtils.ts';
import { getEnvVariables } from '@/envVariables.ts';

const userManager = new UserManager(config);

export const AuthService = {
  login: async () => await userManager.signinRedirect(),
  refresh: () => userManager.signinSilent(),
  getUser: async (): Promise<User | null> => await userManager.getUser(),
  handleCallback: async () => await userManager.signinRedirectCallback(),
  revokeTokens: async () => await userManager.revokeTokens(),
  removeUser: async () => await userManager.removeUser(),

  getAccessToken: async (): Promise<string | null> => {
    const user = await userManager.getUser();
    return user?.access_token || null;
  },

  logout: async () => {
    try {
      const accessToken = (await userManager.getUser())?.access_token;
      //await AuthService.revokeTokens();
      await AuthService.removeUser();
      await userManager.signoutRedirect({
        // eslint-disable-next-line camelcase
        id_token_hint: accessToken ?? undefined,
      });
      window.location.href = getEnvVariables('VITE_OAUTH2_REDIRECT_URL');
    } catch {
      // silent handler
    }
  },

  addAccessTokenExpired: () =>
    userManager.events.addAccessTokenExpired(async () => {
      console.log('Access token expired');
      try {
        const accessToken = (await userManager.getUser())?.access_token;
        await AuthService.removeUser();
        await userManager.signoutRedirect({
          // eslint-disable-next-line camelcase
          id_token_hint: accessToken ?? undefined,
        });
        window.location.href = getEnvVariables('VITE_OAUTH2_REDIRECT_URL');
      } catch {
        // silent handler
      }
    }),

  //removeAccessTokenExpired: () => userManager.events.removeAccessTokenExpired(),

  authFetch: async (url: string, options: RequestInit = {}): Promise<Response> => {
    if (isAuthenticationActive()) {
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
  },
};
