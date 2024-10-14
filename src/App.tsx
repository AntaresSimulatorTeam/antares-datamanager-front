/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useEffect, useState } from 'react';
import './App.css';
import { AuthService } from './auth/authService';

import { User } from 'oidc-client-ts';

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
    <div>
      {user ? (
        <div>
          <h1>Welcome, {user.profile.preferred_username}!</h1>
          <br />
          <button onClick={AuthService.logout}>Logout</button>
        </div>
      ) : (
        <button onClick={AuthService.login}>Login</button>
      )}
    </div>
  );
}

export default App;
