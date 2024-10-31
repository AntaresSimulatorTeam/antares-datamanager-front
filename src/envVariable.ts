/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

type ProjectEnvVariablesType = {
  SHADOW_URL: string;
};

// Environment Variable Template to Be Replaced at Runtime
const projectEnvVariables: ProjectEnvVariablesType = {
  SHADOW_URL: 'URL',
};

// Returning the variable value from runtime or obtained as a result of the build
export const getEnvVariables = (): ProjectEnvVariablesType => ({
  SHADOW_URL: projectEnvVariables.SHADOW_URL,
});
