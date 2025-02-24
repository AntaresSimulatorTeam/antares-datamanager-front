/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import './App.css';
import MainContent from '@/pages/pegase/home/components/MainContent';
import { hasAuthParams, useAuth } from 'react-oidc-context';
import { useEffect, useState } from 'react';

function App() {
  const auth = useAuth();
  const [hasTriedSignIn, setHasTriedSignIn] = useState(false);

  // automatically sign-in
  useEffect(() => {
    if (
      !hasAuthParams() &&
      auth &&
      !auth.isAuthenticated &&
      !auth.activeNavigator &&
      !auth.isLoading &&
      !hasTriedSignIn
    ) {
      void auth.signinRedirect().then(() => setHasTriedSignIn(true));
    }
  }, [auth, hasTriedSignIn]);

  if (auth?.isLoading) {
    return <div>Loading...</div>;
  }

  if (auth?.isAuthenticated || !auth) {
    return <MainContent />;
  }

  if (auth?.error) {
    return <div>Oops... {auth.error.message}</div>;
  }
}

export default App;
