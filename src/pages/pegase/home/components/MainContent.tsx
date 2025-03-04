/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import PegaseStar from '@/components/pegase/star/PegaseStar';
import ProjectDetails from '@/pages/pegase/projects/projectDetails/ProjectDetails';
import StudyDetails from '@/pages/pegase/studies/studyDetails/StudyDetails';
import { menuBottomData, menuTopData } from '@/routes';
import { UserSettingsContext } from '@/store/contexts/UserSettingsContext';
import { THEME_COLOR } from '@/shared/types';
import ThemeHandler from '@common/handler/ThemeHandler';
import { PegaseToastContainer } from '@/shared/notification/containers';
import { RdsNavbar } from 'rte-design-system-react';
import { PEGASE_NAVBAR_ID } from '@/shared/constants';
import { translateMenuItemLabel } from '@/shared/utils/textUtils';
import { navBarConfig } from '@/shared/const/navBarConfig';
import { useTranslation } from 'react-i18next';
import { StudyProvider } from '@/store/contexts/StudyProvider.tsx';
import { getEnvVariables } from '@/envVariables.ts';

const MainContent = () => {
  const { t } = useTranslation();

  return (
    <div className="flex h-screen w-screen dark:bg-gray-900 dark:text-gray-200">
      <UserSettingsContext.Provider initialState={{ theme: THEME_COLOR.LIGHT }}>
        <ThemeHandler />
        <PegaseToastContainer />
        <RdsNavbar
          id={PEGASE_NAVBAR_ID}
          topItems={translateMenuItemLabel(menuTopData, t)}
          bottomItems={translateMenuItemLabel(menuBottomData, t)}
          headerLink={'/'}
          config={navBarConfig}
        />
        <div className="flex h-full w-full flex-col">
          <PegaseStar />
          <Suspense>
            <StudyProvider initialValue={{ isStudyGenerated: false, areaTrajectory: null, linkTrajectory: null }}>
              <Routes>
                <Route path="/study/:studyName" element={<StudyDetails />} />
                <Route path="/project/:projectName" element={<ProjectDetails />} />
                <Route
                  path="/logout-callback"
                  element={<Navigate to={`${getEnvVariables('VITE_OAUTH2_REDIRECT_URL')}`} />}
                />
                {Object.entries([...menuBottomData, ...menuTopData]).map(([key, route]) => (
                  <Route key={key} path={route.path} Component={route.component} />
                ))}
              </Routes>
            </StudyProvider>
          </Suspense>
        </div>
      </UserSettingsContext.Provider>
    </div>
  );
};

export default MainContent;
