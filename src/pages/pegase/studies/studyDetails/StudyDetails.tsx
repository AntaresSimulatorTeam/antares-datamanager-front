/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { ReactNode, useState } from 'react';
import { Location, useLocation } from 'react-router-dom';
import StudyHeader from './StudyHeader.tsx';
import StudyDetailsContent from './StudyDetailsContent';
import { RdsButton, RdsDivider } from 'rte-design-system-react';
import StudyNavigationMenu from '@/pages/pegase/studies/studyDetails/StudyNavigationMenu';
import { StudyDTO } from '@/shared/types';
import { useTranslation } from 'react-i18next';
import { useStudy } from '@/store/contexts/StudyContext.tsx';
import { createStudy } from '@/shared/services/studyService.ts';

interface StudyState {
  study: StudyDTO;
}

const StudyDetails = () => {
  const [activeContent, setActiveContent] = useState<ReactNode>(null);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const location: Location<StudyState> = useLocation();
  const { t } = useTranslation();
  const { areaTrajectory } = useStudy();
  const { study } = location.state || {};

  const handleGenerateStudy = async () => {
    try {
      await createStudy(study.id);
    } catch (error) {
      //silent handler
    }
  };

  return !study.id ? (
    <div className="flex h-screen items-center justify-center">
      <p>Loading project details...</p>
    </div>
  ) : (
    <div className="flex h-full flex-col">
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
      <div className="flex h-full flex-col justify-between space-x-4 p-4">
        {activeContent}
        <div className="flex flex-col gap-2">
          <RdsDivider />
          <div className="self-end">
            <RdsButton
              label={t('studyDetails.@generate')}
              onClick={() => void handleGenerateStudy()}
              disabled={!areaTrajectory}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyDetails;
