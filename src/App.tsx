/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { Suspense, useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Switch } from 'react-router-dom';
import './App.css';
import { AuthService } from './auth/authService';
import ThemeHandler from './components/common/handler/ThemeHandler';
import Navbar from './components/pegase/navbar/Navbar';
import PegaseStar from './components/pegase/star/PegaseStar';
import { UserContext } from './contexts/UserContext';
import { menuBottomData, menuTopData } from './mocks/data/features/menuData.mock';
import { routes } from './routes';
import { PEGASE_NAVBAR_ID } from './shared/constants';
import { THEME_COLOR } from './shared/types';
import { User } from 'oidc-client-ts';

const Callback: React.FC = () => {
  useEffect(() => {
    const handleAuth = async () => {
      await AuthService.handleCallback();
      window.location.replace('/'); // Redirige vers la page d'accueil après la connexion
    };
    handleAuth();
  }, []);

  return <div>Loading...</div>;
};

function App() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const user = await AuthService.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  return (
    <div>
      {user ? (
        <div>
          <h1>Welcome, {user.profile.name}!</h1>
          <button onClick={AuthService.logout}>Logout</button>
        </div>
      ) : (
        <button onClick={AuthService.login}>Login</button>
      )}
    </div>

    /*     <div className="flex h-screen w-screen dark:bg-acc2-950 dark:text-gray-200">
      <UserContext.Provider initialState={{ theme: THEME_COLOR.LIGHT }}>
        <ThemeHandler />
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
      </UserContext.Provider>
    </div> */
  );
}

export default App;
