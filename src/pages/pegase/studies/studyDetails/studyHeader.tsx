/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { RdsHeading, RdsIcon, RdsIconId } from 'rte-design-system-react';

type StudyDetailsHeaderProps = {
  projectName: string;
  studyName: string;
};

const StudyHeader = ({ projectName, studyName }: StudyDetailsHeaderProps) => (
  <div className="flex items-center justify-between px-3 py-2">
    <div className="font-nunito text-base flex items-center gap-2 py-1 font-semibold leading-none">
      <RdsIcon name={RdsIconId.MoreHoriz} color="secondary" />
      <RdsIcon name={RdsIconId.KeyboardArrowRight} color="secondary" />
      <RdsHeading title={projectName} />
      <RdsIcon name={RdsIconId.KeyboardArrowRight} color="secondary" />
      <RdsHeading title={studyName} />
    </div>
  </div>
);

export default StudyHeader;
