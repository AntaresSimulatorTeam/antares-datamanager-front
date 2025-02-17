/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { ReactNode, useState } from 'react';
import { Location, useLocation } from 'react-router-dom';
import StudyHeader from './studyHeader';
import StudyDetailsContent from './StudyDetailsContent';
import { RdsDivider } from 'rte-design-system-react';
import StudyNavigationMenu from '@/pages/pegase/studies/studyDetails/StudyNavigationMenu';
import { StudyDTO } from '@/shared/types';

interface StudyState {
  study: StudyDTO;
}

const StudyDetails = () => {
  const [activeContent, setActiveContent] = useState<ReactNode>(null);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const location: Location<StudyState> = useLocation();
  const { study } = location.state || {};

  return !study.id ? (
    <div className="flex h-screen items-center justify-center">
      <p>Loading project details...</p>
    </div>
  ) : (
    <div className="flex flex-col">
      <StudyHeader projectName={study.project} studyName={study.name} />
      <RdsDivider />
      <div className="flex flex-col">
        <StudyDetailsContent study={study} />
      </div>
      <div className="flex gap-4 px-3 py-2">
        <div className="flex h-10 items-end self-stretch">
          <StudyNavigationMenu onRenderActiveComponent={setActiveContent} studyHorizon={study.horizon} />
        </div>
      </div>
      <div className="flex space-x-4 p-4">{activeContent}</div>
    </div>
  );
};

export default StudyDetails;
