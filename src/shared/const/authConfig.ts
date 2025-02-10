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
}

export const config: AuthConfig = {
  client_id: getEnvVariables('VITE_OAUTH2_CLIENT_ID'),
  redirect_uri: getEnvVariables('VITE_OAUTH2_REDIRECT_URL'),
  authority: getEnvVariables('VITE_OAUTH2_AUTHORITY'),
  scope: 'openid email profile',
  maxExpiresIn: 600,
};
