/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { Suspense, useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import './App.css';
import { User } from 'oidc-client-ts';
import { User } from 'oidc-client-ts';
import Navbar from './components/pegase/navbar/Navbar';
import ThemeHandler from './components/common/handler/ThemeHandler';
import PegaseStar from './components/pegase/star/PegaseStar';
import { PEGASE_NAVBAR_ID } from './shared/constants';
import { UserContext } from '@/store/contexts/UserContext';
import { THEME_COLOR } from '@/shared/types';
import { menuBottomData, menuTopData } from './routes';
import ProjectDetails from './pages/pegase/projects/projectDetails/ProjectDetails';
import StudyDetails from '@/pages/pegase/studies/studyDetails/studyDetails';
import { AuthService } from '@/shared/services/auth/authService';
import { GenericUserContext } from '@/store/contexts/GenericUserContext';
import { RdsNavbar } from 'rte-design-system-react';
import { navBarConfig } from '@/shared/const/navBarConfig';
import { useTranslation } from 'react-i18next';
import { translateMenuItemLabel } from '@/shared/utils/textUtils.ts';
import { PEGASE_NAVBAR_ID } from '@/shared/constants.ts';
import { PegaseToastContainer } from '@/shared/notification/containers.tsx';
import { AuthService } from '@/auth/authService';
import { AuthService } from '@/shared/services/auth/authService';
import { GenericUserContext } from '@/store/contexts/GenericUserContext';
import { PegaseToastContainer } from '@/shared/notification/containers.tsx';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    const handleAuth = async () => {
      if (window.location.href.includes('code=')) {
        await AuthService.handleCallback();
        window.location.replace('/'); // Redirige vers la page d'accueil après la connexion
      }
    };
    void handleAuth();
  }, []);

  useEffect(() => {
    const getUser = async () => {
      const userInfo = await AuthService.getUser();
      if (!userInfo) {
        // Redirection automatique vers Keycloak pour l'authentification
        await AuthService.login();
      } else {
        setLoading(false); // Arrêter le chargement seulement si authentifié
      }
      setUser(userInfo);
    };
    void getUser();
  }, []);
  if (loading) {
    return <div>Loading...</div>; // Affiche un message de chargement pendant la vérification
  }
  return (
    <GenericUserContext.Provider value={user}>
      <div>
        {user ? (
          <div className="flex h-screen w-screen dark:bg-gray-900 dark:text-gray-200">
            <UserContext.Provider initialState={{ theme: THEME_COLOR.LIGHT }}>
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
            </UserContext.Provider>
          </div>
        ) : null}
      </div>
    </GenericUserContext.Provider>
  );
};

export default App;
