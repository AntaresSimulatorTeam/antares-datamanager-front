/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { ReactNode, useEffect, useState } from 'react';
import { UserState } from '@/shared/types';
import { AuthService } from '@/shared/services/authService';
import { UserContext } from './UserContext';
import { USER_FAKE } from '@/mocks/data/list/user.ts';

export interface UserProviderProps {
  children: ReactNode;
  initialValue: UserState;
}

const UserProvider = ({ children, initialValue }: UserProviderProps) => {
  const [user, setUser] = useState<UserState>(initialValue);
  const [loading, setLoading] = useState(true);
  const isAuthEnabled = false; //getEnvVariables('APP_AUTH_ENABLED');

  useEffect(() => {
    const controller = new AbortController();

    const getUser = async () => {
      try {
        if (!isAuthEnabled) {
          console.log('Authentication is disabled in local mode. Mocking user...');
          setUser({ user: USER_FAKE });
          setLoading(false);
          return;
        }
        const userInfo = await AuthService.getUser();
        if (!userInfo) {
          await AuthService.login();
        } else {
          setUser({ user: userInfo });
          setLoading(false);
        }
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Failed to fetch user:', error);
        }
      }
    };

    void getUser();

    return () => {
      controller.abort();
    };
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
};

export default UserProvider;
