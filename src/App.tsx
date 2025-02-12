/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { Suspense, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import './App.css';
import ThemeHandler from './components/common/handler/ThemeHandler';
import PegaseStar from './components/pegase/star/PegaseStar';
import { UserSettingsContext } from '@/store/contexts/UserSettingsContext.tsx';
import { THEME_COLOR } from '@/shared/types';
import { menuBottomData, menuTopData } from './routes';
import { PegaseToastContainer } from './shared/notification/containers';
import ProjectDetails from './pages/pegase/projects/projectDetails/ProjectDetails';
import StudyDetails from '@/pages/pegase/studies/studyDetails/StudyDetails';
import { RdsNavbar } from 'rte-design-system-react';
import { navBarConfig } from '@/shared/const/navBarConfig';
import { useTranslation } from 'react-i18next';
import { translateMenuItemLabel } from '@/shared/utils/textUtils.ts';
import { PEGASE_NAVBAR_ID } from '@/shared/constants.ts';
import UserProvider from '@/store/contexts/UserProvider.tsx';
import { AuthService } from '@/shared/services/authService.ts';

function App() {
  const { t } = useTranslation();

  useEffect(() => {
    const handleAuth = async () => {
      if (window.location.href.includes('code=')) {
        await AuthService.handleCallback();
        window.location.replace('/'); // Redirect to home page after login
      }
    };
    void handleAuth();
  }, []);

  return (
    <UserProvider initialValue={{ user: null }}>
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
              <Routes>
                <Route path="/study/:studyName" element={<StudyDetails />} />
                <Route path="/project/:projectName" element={<ProjectDetails />} />
                {Object.entries([...menuBottomData, ...menuTopData]).map(([key, route]) => (
                  <Route key={key} path={route.path} Component={route.component} />
                ))}
              </Routes>
            </Suspense>
          </div>
        </UserSettingsContext.Provider>
      </div>
    </UserProvider>
  );
}

export default App;
