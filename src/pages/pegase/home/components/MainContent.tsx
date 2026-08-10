/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { Suspense } from 'react';
import { NavLink, Route, Routes } from 'react-router-dom';
import PegaseStar from '@/components/pegase/star/PegaseStar';
import ProjectDetails from '@/pages/pegase/projects/projectDetails/ProjectDetails';
import StudyDetails from '@/pages/pegase/studies/studyDetails/StudyDetails';
import { footerRoutes, mainRoutes } from '@/routes';
import { UserSettingsContext } from '@/store/contexts/UserSettingsContext';
import { THEME_COLOR } from '@/shared/types';
import ThemeHandler from '@common/handler/ThemeHandler';
import { PegaseAlertContainer, PegaseToastContainer } from '@/shared/notification/containers';
import { footerMenuItems, mainMenuItems, navBarConfig } from '@/shared/const/navBarConfig';
import { StudyProvider } from '@/store/contexts/StudyProvider';
import { useTranslation } from 'react-i18next';
import { NavigationProvider, SideNav } from '@design-system-rte/react';
import { translateMenuItemLabel } from '@/shared/utils/textUtils.ts';
import { PEGASE_NAVBAR_ID } from '@/shared/constants.ts';

const MainContent = () => {
  const { t } = useTranslation();
  return (
    <div className="flex h-screen w-screen dark:bg-gray-900 dark:text-gray-200">
      <UserSettingsContext.Provider initialState={{ theme: THEME_COLOR.LIGHT }}>
        <ThemeHandler />
        <PegaseToastContainer />
        <PegaseAlertContainer />
        <NavigationProvider
          linkComponent={NavLink}
        >
          <SideNav
            id={PEGASE_NAVBAR_ID}
            headerConfig={navBarConfig}
            items={translateMenuItemLabel(mainMenuItems, t)}
            footerItems={translateMenuItemLabel(footerMenuItems, t)}
            collapsible
            />
        </NavigationProvider>
        <div className="flex h-full w-full min-w-0 flex-col">
          <PegaseStar />
          <Suspense>
            <Routes>
              <Route
                path="/study/:id"
                element={
                  <StudyProvider>
                    <StudyDetails />
                  </StudyProvider>
                }
              />
              <Route path="/project/:id" element={<ProjectDetails />} />
              {Object.entries([...mainRoutes, ...footerRoutes]).map(([key, route]) => (
                <Route key={key} path={route.link} Component={route.component} />
              ))}
            </Routes>
          </Suspense>
        </div>
      </UserSettingsContext.Provider>
    </div>
  );
};
export default MainContent;
