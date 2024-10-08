/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { generateKeywords } from '../list/keywords';
import PROJECT_NAME from '../list/projectName';
import STUDY_NAME from '../list/studyName';
import USER_NAMES from '../list/user';

export const generateStudy = (count: number, seed = 1): StudyDTO[] =>
  Array.from({ length: count }, (_, idx) => ({
    id: idx * seed,
    study_name: STUDY_NAME[Math.floor(idx * seed) % STUDY_NAME.length],
    user_name: USER_NAMES[Math.floor(idx * seed) % USER_NAMES.length],
    creation_date: new Date(),
    keywords: generateKeywords(Math.floor(Math.random() * idx) % 5, idx * seed),
    project: PROJECT_NAME[Math.floor(idx * seed) % PROJECT_NAME.length],
    status: 'In progress',
    horizon: 'Short-term',
  }));

export const generateStudyRandomData = (count: number): StudyDTO[] => generateStudy(count, Math.random() * 100);
