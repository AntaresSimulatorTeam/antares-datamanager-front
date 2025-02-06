/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { UserState } from '@/shared/types';
import { AuthService } from '@/shared/services/authService.ts';

const initialState: UserState = {
  user: null,
};

export const UserContext = createContext(initialState);
export const useUser = () => useContext(UserContext);

export interface UserProviderProps {
  children: ReactNode;
  initialValue: UserState;
}

const UserProvider = ({ children, initialValue }: UserProviderProps) => {
  const [user, setUser] = useState<UserState>(initialValue);
  const [loading, setLoading] = useState(true);

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
      setUser({ user: userInfo });
    };
    void getUser();
  }, []);

  if (loading) {
    return <div>Loading...</div>; // Affiche un message de chargement pendant la vérification
  }
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
};

export default UserProvider;
