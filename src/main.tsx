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
document.documentElement.style.setProperty('--colors-primary-50', '#fafce9');
document.documentElement.style.setProperty('--colors-primary-100', '#f3f8cf');
document.documentElement.style.setProperty('--colors-primary-200', '#e6f2a4');
document.documentElement.style.setProperty('--colors-primary-300', '#d3e86e');
document.documentElement.style.setProperty('--colors-primary-400', '#bed942');
document.documentElement.style.setProperty('--colors-primary-500', '#a4c424');
document.documentElement.style.setProperty('--colors-primary-600', '#7c9818');
document.documentElement.style.setProperty('--colors-primary-700', '#5e7417');
document.documentElement.style.setProperty('--colors-primary-800', '#4b5c18');
document.documentElement.style.setProperty('--colors-primary-900', '#404e19');
document.documentElement.style.setProperty('--colors-primary-950', '#212b08');
