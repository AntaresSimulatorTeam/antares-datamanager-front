/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { Suspense, useMemo } from 'react';
import { Route, Routes } from 'react-router-dom';
import PegaseStar from '@/components/pegase/star/PegaseStar';
import ProjectDetails from '@/pages/pegase/projects/projectDetails/ProjectDetails';
import StudyDetails from '@/pages/pegase/studies/studyDetails/StudyDetails';
import { menuBottomData, menuTopData } from '@/routes';
import { UserSettingsContext } from '@/store/contexts/UserSettingsContext';
import { THEME_COLOR } from '@/shared/types';
import ThemeHandler from '@common/handler/ThemeHandler';
import { PegaseAlertContainer, PegaseToastContainer } from '@/shared/notification/containers';
import { StudyProvider } from '@/store/contexts/StudyProvider';
import { translateMenuItemLabel } from '@/shared/utils/textUtils.ts';
import { useTranslation } from 'react-i18next';
import { AppSideNav } from '@common/layout/AppSideNav.tsx';

const INITIAL_USER_SETTINGS = { theme: THEME_COLOR.LIGHT };

const MainContent = () => {
  const { t } = useTranslation();
  const topItems = useMemo(() => translateMenuItemLabel(menuTopData, t), [t]);
  const bottomItems = useMemo(() => translateMenuItemLabel(menuBottomData, t), [t]);

  return (
    <div className="flex h-screen w-screen dark:bg-gray-900 dark:text-gray-200">
      <UserSettingsContext.Provider initialState={INITIAL_USER_SETTINGS}>
        <ThemeHandler />
        <PegaseToastContainer />
        <PegaseAlertContainer />
        <AppSideNav topItems={topItems} bottomItems={bottomItems} />
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
              {Object.entries([...bottomItems, ...topItems]).map(([key, route]) => (
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
