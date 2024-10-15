/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useEffect, useState } from 'react';
import './App.css';
import { AuthService } from './auth/authService';
import { User } from 'oidc-client-ts';
import { Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import './App.css';
import Navbar from './components/pegase/navbar/Navbar';
import PegaseStar from './components/pegase/star/PegaseStar';
import { UserContext } from './contexts/UserContext';
import { menuBottomData, menuTopData } from './mocks/data/features/menuData.mock';
import { routes } from './routes';
import { PEGASE_NAVBAR_ID } from './shared/constants';
import StdButton from '@common/base/stdButton/StdButton';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps';
import * as React from 'react';
function App() {
  useEffect(() => {
    const handleAuth = async () => {
      if (window.location.href.includes('code=')) {
        await AuthService.handleCallback();
        window.location.replace('/'); // Redirige vers la page d'accueil après la connexion
      }
    };
    handleAuth();
  }, []);

  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const user = await AuthService.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  return (
    <UserContext.Provider value={user}>
      <div>
        {user ? (
          <div>
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
          </div>
        ) : (
          <div className="flex h-screen w-screen items-center justify-center">
            <h2>Vous n'êtes plus connecté à Pegase. Veuillez vous connecter.</h2>
            <br />
            <StdButton label="Se Connecter" icon={StdIconId.Login} onClick={AuthService.login} />
          </div>
        )}
      </div>
    </UserContext.Provider>
  );
}

export default App;
