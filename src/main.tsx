/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './i18n.ts';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
document.documentElement.style.setProperty('--colors-primary-50', '#f9f7fc');
document.documentElement.style.setProperty('--colors-primary-100', '#f3eff8');
document.documentElement.style.setProperty('--colors-primary-200', '#e6def0');
document.documentElement.style.setProperty('--colors-primary-300', '#d2c3e4');
document.documentElement.style.setProperty('--colors-primary-400', '#b89fd3');
document.documentElement.style.setProperty('--colors-primary-500', '#9979bc');
document.documentElement.style.setProperty('--colors-primary-600', '#7d5a9f');
document.documentElement.style.setProperty('--colors-primary-700', '#674883');
document.documentElement.style.setProperty('--colors-primary-800', '#563c6c');
document.documentElement.style.setProperty('--colors-primary-900', '#4a355a');
document.documentElement.style.setProperty('--colors-primary-950', '#2b1a38');
