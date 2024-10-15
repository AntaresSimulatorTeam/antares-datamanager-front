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
  redirect_uri: 'http://localhost:8080/home',
  response_type: 'code',
  scope: 'openid profile',
  post_logout_redirect_uri: 'http://localhost:8080/',
};
function getLoginUrl(): string {
  const params = new URLSearchParams({
    client_id: config.client_id,
    redirect_uri: config.redirect_uri,
    response_type: config.response_type,
    scope: config.scope,
  });

  return `${config.authority}/protocol/openid-connect/auth?${params.toString()}`;
}

const userManager = new UserManager(config);

export const AuthService = {
  login: () => userManager.signinRedirect(),
  logout: () => userManager.signoutRedirect(),
  // logout: () => userManager.signoutRedirect({ post_logout_redirect_uri: getLoginUrl() }),
  getUser: async (): Promise<User | null> => await userManager.getUser(),
  handleCallback: () => userManager.signinRedirectCallback(),
};
