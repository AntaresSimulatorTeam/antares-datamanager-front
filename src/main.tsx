/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import './i18n.ts';
import './index.css';
import { RouterProvider } from 'react-router-dom';
import { browserRouter } from './routes.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Suspense>
      <RouterProvider router={browserRouter} />
    </Suspense>
  </React.StrictMode>,
);
