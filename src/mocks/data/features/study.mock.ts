/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { generateKeywords } from '../list/keywords';
import STUDY_NAME from '../list/studyName';
import USER_NAMES from '../list/user';

export const generateStudy = (count: number, seed = 1): StudyDTO[] =>
  Array.from({ length: count }, (_, idx) => ({
    id: idx * seed,
    study_name: STUDY_NAME[(idx * seed) % STUDY_NAME.length],
    user_name: USER_NAMES[(idx * seed) % USER_NAMES.length],
    creation_date: new Date(),
    keywords: generateKeywords(Math.floor(Math.random() * idx) % 5, seed),
    project: `Project ${idx}`,
  }));

export const generateStudyRandomData = (count: number): StudyDTO[] => generateStudy(count, Math.random() * 100);
