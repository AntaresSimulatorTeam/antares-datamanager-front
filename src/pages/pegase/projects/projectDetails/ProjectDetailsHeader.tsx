/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { RdsHeading } from 'rte-design-system-react';

type ProjectDetailsHeaderProps = {
  projectName: string;
};

const ProjectDetailsHeader = ({ projectName }: ProjectDetailsHeaderProps) => (
  <div className="flex items-center justify-between px-3 py-2">
    <RdsHeading title={projectName} />
    <div className="ml-auto flex items-center gap-4"></div>
  </div>
);

export default ProjectDetailsHeader;
