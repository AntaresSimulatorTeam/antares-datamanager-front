/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { getEnvVariables } from '@/envVariables.ts';

interface AuthConfig {
  authority: string;
  client_id: string;
  redirect_uri: string;
  scope: string;
  maxExpiresIn: number;
  post_logout_redirect_uri: string;
}

export const config: AuthConfig = {
  // eslint-disable-next-line camelcase
  client_id: getEnvVariables('VITE_OAUTH2_CLIENT_ID'),
  // eslint-disable-next-line camelcase
  redirect_uri: getEnvVariables('VITE_OAUTH2_REDIRECT_URL'),
  authority: getEnvVariables('VITE_OAUTH2_AUTHORITY'),
  // eslint-disable-next-line camelcase
  post_logout_redirect_uri: getEnvVariables('VITE_OAUTH2_LOGOFF_REDIRECT_URL'),
  scope: 'openid email profile',
  maxExpiresIn: 600,
};

export const DEFAULT_USER = 'CF93131T';
