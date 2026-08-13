/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { getEnvVariables } from '@/envVariables.ts';

const GENERATOR_BASE_URL = getEnvVariables('VITE_PEGASE_FQDN');
const BACK_END_BASE_URL = getEnvVariables('VITE_BACK_END_BASE_URL');

// STUDY
export const STUDY_ENDPOINT = `${BACK_END_BASE_URL}/v1/study`;
export const STUDY_SEARCH_ENDPOINT = `${BACK_END_BASE_URL}/v1/study/search`;
export const STUDY_KEYWORDS_SEARCH_ENDPOINT = `${BACK_END_BASE_URL}/v1/study/keywords/search`;
export const STUDY_GENERATE_ENDPOINT = `${BACK_END_BASE_URL}/v1/study/generate`;

// PINNED PROJECT
export const PROJECT_PINNED_ENDPOINT = `${BACK_END_BASE_URL}/v1/project/pinned`;
export const PROJECT_UNPIN_ENDPOINT = `${BACK_END_BASE_URL}/v1/project/unpin`;
export const PROJECT_PIN_ENDPOINT = `${BACK_END_BASE_URL}/v1/project/pin`;

// PROJECT
export const PROJECT_ENDPOINT = `${BACK_END_BASE_URL}/v1/project`;
export const PROJECT_AUTOCOMPLETE_ENDPOINT = `${BACK_END_BASE_URL}/v1/project/autocomplete`;
export const PROJECT_SEARCH_ENDPOINT = `${BACK_END_BASE_URL}/v1/project/search`;

// TRAJECTORY
export const TRAJECTORY_ENDPOINT = `${BACK_END_BASE_URL}/v1/trajectory`;
export const TRAJECTORY_FILE_SYSTEM_ENDPOINT = `${BACK_END_BASE_URL}/v1/trajectory/fs`;
export const TRAJECTORY_DATA_BASE_ENDPOINT = `${BACK_END_BASE_URL}/v1/trajectory/db`;
export const TRAJECTORY_RES_TYPES = `${BACK_END_BASE_URL}/v1/trajectory/res-types`;
export const TRAJECTORY_LINK_TO_STUDY_ENDPOINT = `${BACK_END_BASE_URL}/v1/trajectory/attach`;
export const TRAJECTORY_UNLINK_TO_STUDY_ENDPOINT = `${BACK_END_BASE_URL}/v1/trajectory/detach`;
export const TRAJECTORY_UNLINK_MULTIPLE_TO_STUDY_ENDPOINT = `${BACK_END_BASE_URL}/v1/trajectory/detach/batch`;
export const TRAJECTORY_DATA_FILE_ENDPOINT = `${BACK_END_BASE_URL}/v1/trajectory/trajectoryData`;
export const TRAJECTORY_COUNT_WARNING_ENDPOINT = `${BACK_END_BASE_URL}/v1/trajectory/count/warning`;
export const TRAJECTORY_UNLINK_ALL_TO_STUDY_ENDPOINT = `${BACK_END_BASE_URL}/v1/trajectory/detach/all`;
export const TRAJECTORY_THERMAL_INSTALLED_POWER_IMPORT = `${BACK_END_BASE_URL}/v1/trajectory/thermal-capacity`;
export const TRAJECTORY_THERMAL_COMMON_PARAMETER_IMPORT = `${BACK_END_BASE_URL}/v1/trajectory/thermal-common-parameter`;
export const TRAJECTORY_THERMAL_SPECIFIC_PARAMETER_IMPORT = `${BACK_END_BASE_URL}/v1/trajectory/thermal-specific-parameter`;
export const TRAJECTORY_THERMAL_MODULATION_PARAMETER_IMPORT = `${BACK_END_BASE_URL}/v1/trajectory/thermal-modulation-parameter`;
export const TRAJECTORY_THERMAL_COSTS_PARAMETER_IMPORT = `${BACK_END_BASE_URL}/v1/trajectory/thermal-economic-costs`;
export const TRAJECTORY_THERMAL_ECONOMIC_PARAMETER_IMPORT = `${BACK_END_BASE_URL}/v1/trajectory/thermal-economic-parameter`;
export const TRAJECTORY_STS = `${BACK_END_BASE_URL}/v1/trajectory/st-storage`;
export const TRAJECTORY_DSR_CLUSTER = `${BACK_END_BASE_URL}/v1/trajectory/dsr-cluster`;
export const TRAJECTORY_DSR_CAPACITY_MODULATION = `${BACK_END_BASE_URL}/v1/trajectory/dsr-capacity-modulation`;
export const TRAJECTORY_THERMAL_PARAM_MODULATION = `${BACK_END_BASE_URL}/v1/trajectory/param-modulation/check`;
export const TRAJECTORY_MISC_INSTALLED_POWER = `${BACK_END_BASE_URL}/v1/trajectory/installed-misc`;
export const TRAJECTORY_MISC_LOAD_FACTOR = `${BACK_END_BASE_URL}/v1/trajectory/load-factor-misc`;
export const TRAJECTORY_RES_INSTALLED_POWER = `${BACK_END_BASE_URL}/v1/trajectory/installed-power-res`;
export const TRAJECTORY_RES_LOAD_FACTOR = `${BACK_END_BASE_URL}/v1/trajectory/load-factor-res`;
export const TRAJECTORY_RES_TECHNOLOGY_DISTRIBUTION = `${BACK_END_BASE_URL}/v1/trajectory/technology-distribution-res`;
export const TRAJECTORY_RES_ZONAL_DISTRIBUTION = `${BACK_END_BASE_URL}/v1/trajectory/zonal-distribution-res`;
export const TRAJECTORY_HYDRO_SERIES = `${BACK_END_BASE_URL}/v1/trajectory/hydro-series`;
export const TRAJECTORY_HYDRO_TECHNICAL_PARAMETERS = `${BACK_END_BASE_URL}/v1/trajectory/hydro-technical-parameters`;
export const TRAJECTORY_NUCLEAR_FR_MODULATION = `${BACK_END_BASE_URL}/v1/trajectory/nuclear-modulation`;
export const TRAJECTORY_NUCLEAR_FR_TALON = `${BACK_END_BASE_URL}/v1/trajectory/nuclear-talon`;
export const TRAJECTORY_NUCLEAR_TS_EPR = `${BACK_END_BASE_URL}/v1/trajectory/nuclear-ts-erp`;
export const TRAJECTORY_NUCLEAR_TS_LT = `${BACK_END_BASE_URL}/v1/trajectory/nuclear-lt`;
export const TRAJECTORY_NUCLEAR_TS_SMR = `${BACK_END_BASE_URL}/v1/trajectory/nuclear-ts-smr`;
export const TRAJECTORY_ADEQUACY_PATCH = `${BACK_END_BASE_URL}/v1/trajectory/adequacy-patch`;
export const TRAJECTORY_SETTINGS = `${BACK_END_BASE_URL}/v1/trajectory/settings`;

//ABOUT
export const BACK_END_ACTUATOR_ENDPOINT = `${BACK_END_BASE_URL}/actuator/info`;
export const GENERATOR_ACTUATOR_ENDPOINT = `${GENERATOR_BASE_URL}:8094/app-info`;

// DEFAULT CONFIG
export const DEFAULT_CONFIG_AREAS = `${BACK_END_BASE_URL}/v1/default_config/load`;
export const DEFAULT_CONFIG_INSTALLED_POWER_TECHNOLOGY = `${BACK_END_BASE_URL}/v1/default_config/thermal-technology-display`;

// WARNING
export const WARNING_MESSAGES = `${BACK_END_BASE_URL}/v1/warnings`;

// USER
export const USER_LIST_ENDPOINT = `${BACK_END_BASE_URL}/v1/user/list`;
