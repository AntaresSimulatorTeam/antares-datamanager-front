/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { Suspense, useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import './App.css';
import { User } from 'oidc-client-ts';
import Navbar from './components/pegase/navbar/Navbar';
import PegaseStar from './components/pegase/star/PegaseStar';
import { PEGASE_NAVBAR_ID } from './shared/constants';
import { menuBottomData, menuTopData } from './routes';
import ProjectDetails from './pages/pegase/projects/projectDetails/ProjectDetails';
import StudyDetails from '@/pages/pegase/studies/studyDetails/studyDetails';
import { AuthService } from '@/auth/authService';
import { GenericUserContext } from '@/store/contexts/GenericUserContext';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleAuth = async () => {
      if (window.location.href.includes('code=')) {
        await AuthService.handleCallback();
        window.location.replace('/'); // Redirige vers la page d'accueil après la connexion
      }
    };
    handleAuth();
  }, []);

  useEffect(() => {
    const getUser = async () => {
      const user = await AuthService.getUser();
      if (!user) {
        // Redirection automatique vers Keycloak pour l'authentification
        AuthService.login();
      } else {
        setLoading(false); // Arrêter le chargement seulement si authentifié
      }
      setUser(user);
    };
    getUser();
  }, []);
  if (loading) {
    return <div>Loading...</div>; // Affiche un message de chargement pendant la vérification
  }
  return (
    <GenericUserContext.Provider value={user}>
      <div>
        {user ? (
          <div className="flex h-screen w-screen dark:bg-acc2-950 dark:text-gray-200">
            <Navbar id={PEGASE_NAVBAR_ID} bottomItems={menuBottomData} topItems={menuTopData} />
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
          </div>
        ) : null}
      </div>
    </GenericUserContext.Provider>
  );
};

export default App;
