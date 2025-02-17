/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useEffect } from 'react';
import './App.css';
import UserProvider from '@/store/contexts/UserProvider.tsx';
import { AuthService } from '@/shared/services/authService.ts';
import MainContent from '@/pages/pegase/home/components/MainContent';
import { isAuthenticationActive } from '@/shared/utils/authUtils.ts';

function App() {
  useEffect(() => {
    const handleAuth = async () => {
      try {
        if (window.location.href.includes('code=')) {
          await AuthService.handleCallback();
          window.location.replace('/'); // Redirect to home page after login
        }
      } catch (error) {
        console.error('Error during authentication callback:', error);
      }
    };
    void handleAuth();
  }, []);

  return !isAuthenticationActive() ? (
    <MainContent />
  ) : (
    <UserProvider initialValue={{ user: null }}>
      <MainContent />
    </UserProvider>
  );
}

export default App;
