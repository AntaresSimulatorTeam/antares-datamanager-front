/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

type EnvVariableType = {
  VITE_BACK_END_BASE_URL: string;
};

// Environment Variable Template to Be Replaced at Runtime
export const envVariables: EnvVariableType = {
  VITE_BACK_END_BASE_URL: '${URL_BACKEND}',
};
export const getEnvVariables = (key: keyof EnvVariableType) =>
  envVariables[key].startsWith('$') ? (import.meta.env[key] as string) : envVariables[key];
