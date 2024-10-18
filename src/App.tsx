/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import * as React from 'react';
import { Suspense, useEffect, useState } from 'react';
import './App.css';
import { AuthService } from './auth/authService';
import { User } from 'oidc-client-ts';
import { Route, Routes } from 'react-router-dom';
import Navbar from './components/pegase/navbar/Navbar';
import PegaseStar from './components/pegase/star/PegaseStar';
import { UserContext } from './contexts/UserContext';
import { menuBottomData, menuTopData } from './mocks/data/features/menuData.mock';
import { routes } from './routes';
import { PEGASE_NAVBAR_ID } from './shared/constants';

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
    <UserContext.Provider value={user}>
      <div>
        {user ? (
          <div className="flex h-screen w-screen dark:bg-acc2-950 dark:text-gray-200">
            <Navbar id={PEGASE_NAVBAR_ID} bottomItems={menuBottomData} topItems={menuTopData} />
            <div className="flex h-full w-full flex-col">
              <PegaseStar />
              <Suspense>
                <Routes>
                  {Object.entries(routes).map(([key, route]) => (
                    <Route key={key} path={route.path} Component={route.component} />
                  ))}
                </Routes>
              </Suspense>
            </div>
          </div>
        ) : null}
      </div>
    </UserContext.Provider>
  );
};

export default App;
