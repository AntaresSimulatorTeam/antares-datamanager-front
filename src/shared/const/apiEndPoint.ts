/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { getEnvVariables } from '@/envVariables.ts';

const BASE_URL = getEnvVariables('VITE_BACK_END_BASE_URL');

// STUDY
export const STUDY_ENDPOINT = `${BASE_URL}/v1/study`;
export const STUDY_SEARCH_ENDPOINT = `${BASE_URL}/v1/study/search`;
export const STUDY_KEYWORDS_SEARCH_ENDPOINT = `${BASE_URL}/v1/study/keywords/search`;
export const STUDY_GENERATE_ENDPOINT = `${BASE_URL}/v1/study/generate`;

// PINNED PROJECT
export const PROJECT_PINNED_ENDPOINT = `${BASE_URL}/v1/project/pinned`;
export const PROJECT_UNPIN_ENDPOINT = `${BASE_URL}/v1/project/unpin`;
export const PROJECT_PIN_ENDPOINT = `${BASE_URL}/v1/project/pin`;

// PROJECT
export const PROJECT_ENDPOINT = `${BASE_URL}/v1/project`;
export const PROJECT_AUTOCOMPLETE_ENDPOINT = `${BASE_URL}/v1/project/autocomplete`;
export const PROJECT_SEARCH_ENDPOINT = `${BASE_URL}/v1/project/search`;

// TRAJECTORY
export const TRAJECTORY_ENDPOINT = `${BASE_URL}/v1/trajectory`;
export const TRAJECTORY_FILE_SYSTEM_ENDPOINT = `${BASE_URL}/v1/trajectory/fs`;
export const TRAJECTORY_DATA_BASE_ENDPOINT = `${BASE_URL}/v1/trajectory/db`;
export const TRAJECTORY_LINK_TO_STUDY_ENDPOINT = `${BASE_URL}/v1/trajectory/attach`;
export const TRAJECTORY_UNLINK_TO_STUDY_ENDPOINT = `${BASE_URL}/v1/trajectory/detach`;
export const TRAJECTORY_UNLINK_MULTIPLE_TO_STUDY_ENDPOINT = `${BASE_URL}/v1/trajectory/detach/batch`;
export const TRAJECTORY_DATA_FILE_ENDPOINT = `${BASE_URL}/v1/trajectory/trajectoryData`;
export const TRAJECTORY_COUNT_WARNING_ENDPOINT = `${BASE_URL}/v1/trajectory/count/warning`;
export const TRAJECTORY_UNLINK_ALL_TO_STUDY_ENDPOINT = `${BASE_URL}/v1/trajectory/detach/all`;
export const TRAJECTORY_THERMAL_INSTALLED_POWER_IMPORT = `${BASE_URL}/v1/trajectory/thermal-capacity`;
export const TRAJECTORY_THERMAL_COMMON_PARAMETER_IMPORT = `${BASE_URL}/v1/trajectory/thermal-common-parameter`;
export const TRAJECTORY_THERMAL_SPECIFIC_PARAMETER_IMPORT = `${BASE_URL}/v1/trajectory/thermal-specific-parameter`;
export const TRAJECTORY_THERMAL_MODULATION_PARAMETER_IMPORT = `${BASE_URL}/v1/trajectory/thermal-modulation-parameter`;
export const TRAJECTORY_THERMAL_COSTS_PARAMETER_IMPORT = `${BASE_URL}/v1/trajectory/thermal-economic-costs`;
export const TRAJECTORY_THERMAL_ECONOMIC_PARAMETER_IMPORT = `${BASE_URL}/v1/trajectory/thermal-economic-parameter`;
export const TRAJECTORY_THERMAL_PARAM_MODULATION = `${BASE_URL}/v1/trajectory/param-modulation/check`;

//ABOUT
export const ACTUATOR_ENDPOINT = `${BASE_URL}/actuator/info`;

// DEFAULT CONFIG
export const DEFAULT_CONFIG_AREAS = `${BASE_URL}/v1/default_config/load`;
export const DEFAULT_CONFIG_INSTALLED_POWER_TECHNOLOGY = `${BASE_URL}/v1/default_config/thermal-technology-display`;

// WARNING
export const WARNING_MESSAGES = `${BASE_URL}/v1/warnings`;
