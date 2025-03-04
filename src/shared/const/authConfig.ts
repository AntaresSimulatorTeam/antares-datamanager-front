/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { getEnvVariables } from '@/envVariables.ts';
import { UserManagerSettings } from 'oidc-client-ts';

export const config: UserManagerSettings = {
  // eslint-disable-next-line camelcase
  client_id: getEnvVariables('VITE_OAUTH2_CLIENT_ID'),
  // eslint-disable-next-line camelcase
  redirect_uri: getEnvVariables('VITE_OAUTH2_REDIRECT_URL'),
  authority: getEnvVariables('VITE_OAUTH2_AUTHORITY'),
  // eslint-disable-next-line camelcase
  post_logout_redirect_uri: getEnvVariables('VITE_OAUTH2_REDIRECT_URL'),
  scope: 'openid email profile',
  redirectMethod: 'replace',
  // eslint-disable-next-line camelcase
  response_mode: 'query',
};
