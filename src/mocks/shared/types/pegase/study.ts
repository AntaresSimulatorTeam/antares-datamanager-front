/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

type StudyDTO = {
  id: number;
  study_name: string;
  user_name: string;
  creation_date: Date;
  keywords: string[];
  project: string;
};

type AreaDTO = {
  id: number;
  area_hypothesis: string;
  trajectory: string;
};
