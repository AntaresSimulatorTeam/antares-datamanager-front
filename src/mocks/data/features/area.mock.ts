/* eslint-disable camelcase */
/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import AREA_NAMES from '../list/areas';
import TRAJECTORY_NAMES from '../list/trajectory';

export const generateAreas = (count: number): AreaDTO[] =>
  Array.from({ length: count }, (_, idx) => ({
    id: idx,
    areaHypothesis: AREA_NAMES[idx % AREA_NAMES.length],
    trajectory: TRAJECTORY_NAMES[idx % TRAJECTORY_NAMES.length],
  }));

export const generateAreaRandomData = (count: number): AreaDTO[] => generateAreas(count);
