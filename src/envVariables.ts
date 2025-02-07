/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

type EnvVariableType = {
  VITE_BACK_END_BASE_URL: string;
  VITE_OAUTH2_CLIENT_ID: string;
  VITE_OAUTH2_REDIRECT_URL: string;
};

// Environment Variable Template to Be Replaced at Runtime
export const envVariables: EnvVariableType = {
  VITE_BACK_END_BASE_URL: '${URL_BACKEND}',
  VITE_OAUTH2_CLIENT_ID: '${PEGASE_OAUTH2_CLIENT_ID}',
  VITE_OAUTH2_REDIRECT_URL: '${PEGASE_OAUTH2_REDIRECT_URL}',
};
export const getEnvVariables = (key: keyof EnvVariableType) =>
  envVariables[key].startsWith('$') ? (import.meta.env[key] as string) : envVariables[key];
