/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

export interface ProjectInfo {
  projectId: string;
  name: string;
  description: string;
  createdBy: string;
  creationDate: Date;
  archived?: boolean;
  pinned?: boolean;
  path: string;
  tags: string[];
}
