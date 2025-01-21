/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { getEnvVariables } from '@/envVariables.ts';

const BASE_URL = getEnvVariables('VITE_BACK_END_BASE_URL');

// STUDY
export const STUDY_SEARCH_ENDPOINT = `${BASE_URL}/v1/study/search`;

// PROJECT
export const PROJECT_PINNED_ENDPOINT = `${BASE_URL}/v1/project/pinned`;
export const PROJECT_UNPIN_ENDPOINT = `${BASE_URL}/v1/project/unpin`;
