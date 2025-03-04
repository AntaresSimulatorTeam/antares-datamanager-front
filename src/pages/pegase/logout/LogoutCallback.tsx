import { AuthService } from '@/shared/services/authService.ts';
import { useEffect, useState } from 'react';
import { getEnvVariables } from '@/envVariables.ts';

export const LogoutCallback = () => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const signOutRedirect = async () => {
      try {
        setIsLoggingOut(true);
        await AuthService.handleCallback();
        window.location.replace(getEnvVariables('VITE_OAUTH2_REDIRECT_URL'));
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
