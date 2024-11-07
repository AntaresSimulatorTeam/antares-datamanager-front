/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

type EnvVariableType = {
  URL_BACKEND: string;
};

// Environment Variable Template to Be Replaced at Runtime
export const envVariables: EnvVariableType = {
  URL_BACKEND: 'url_dev',
};
