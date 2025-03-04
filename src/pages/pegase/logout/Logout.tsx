/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useEffect, useState } from 'react';
import { AuthService } from '@/shared/services/authService.ts';
import { getEnvVariables } from '@/envVariables.ts';

export const Logout = () => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  //const navigate = useNavigate();

  useEffect(() => {
    const logout = async () => {
      try {
        setIsLoggingOut(true);
        await AuthService.removeUser();
        await AuthService.logout();
        await AuthService.handleCallback();
        window.location.replace(getEnvVariables('VITE_OAUTH2_REDIRECT_URL'));
        //await navigate('/logout-callback');
        //window.location.replace(getEnvVariables('VITE_OAUTH2_REDIRECT_URL'));
      } finally {
        setIsLoggingOut(false);
      }
    };
    void logout();
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

export default Logout;
