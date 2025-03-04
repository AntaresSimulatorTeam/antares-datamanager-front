import { AuthService } from '@/shared/services/authService.ts';
import { useEffect, useState } from 'react';

export const LogoutCallback = () => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const signOutRedirect = async () => {
      try {
        setIsLoggingOut(true);
        await AuthService.handleCallback();
      } finally {
        setIsLoggingOut(false);
      }
    };
    void signOutRedirect();
  }, []);
  return (
    isLoggingOut && (
      <div className={'max-h-3 min-w-12'}>
        <div
          className={'inline-block h-3 w-3 animate-spin rounded-full border-2 border-gray-600 border-b-transparent p-0'}
        ></div>
      </div>
    )
  );
};
