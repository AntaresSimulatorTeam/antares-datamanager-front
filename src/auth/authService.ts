/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { UserManager, User } from 'oidc-client-ts';

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
  redirect_uri: 'http://localhost:3000/callback',
  response_type: 'code',
  scope: 'openid profile',
  post_logout_redirect_uri: 'http://localhost:3000/',
};

const userManager = new UserManager(config);

export const AuthService = {
  login: () => userManager.signinRedirect(),
  logout: () => userManager.signoutRedirect(),
  getUser: async (): Promise<User | null> => await userManager.getUser(),
  handleCallback: () => userManager.signinRedirectCallback(),
};
