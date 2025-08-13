/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import StdHeading from '@common/layout/stdHeading/StdHeading.tsx';

type ProjectDetailsHeaderProps = {
  projectName: string;
};

const ProjectDetailsHeader = ({ projectName }: ProjectDetailsHeaderProps) => (
  <div className="flex items-center justify-between px-3 py-2">
    <StdHeading title={projectName} />
  </div>
);

export default ProjectDetailsHeader;
