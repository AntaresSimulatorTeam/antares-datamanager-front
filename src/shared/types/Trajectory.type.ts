/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

export interface FsTrajectory {
  trajectory_name: string;
  type: string;
  last_modified_date: Date;
}

export interface DbTrajectory {
  id: number;
  trajectory_name: string;
  type: string;
  version: number;
  user_name: string;
  creation_date: Date;
}
