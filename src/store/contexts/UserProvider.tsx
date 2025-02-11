import { ReactNode, useEffect, useState } from 'react';
import { UserState } from '@/shared/types';
import { AuthService } from '@/shared/services/authService';
import { UserContext } from './UserContext';

export interface UserProviderProps {
  children: ReactNode;
  initialValue: UserState;
}

const UserProvider = ({ children, initialValue }: UserProviderProps) => {
  const [user, setUser] = useState<UserState>(initialValue);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const getUser = async () => {
      try {
        const userInfo = await AuthService.getUser({ signal });
        if (!userInfo) {
          await AuthService.login();
        } else {
          setUser({ user: userInfo });
          setLoading(false);
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
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