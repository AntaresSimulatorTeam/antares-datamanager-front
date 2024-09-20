/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import HeaderPage from '@/components/pegase/header/HeaderPage';
import ContentPage from './components/ContentPage';
import TabDisplayArea from './components/AreaDisplayTab';
import TabSelection from './components/TabSelection';
import AreaDisplayTab from './components/AreaDisplayTab';

const AreasPage = () => (
  <>
    <HeaderPage />
    <ContentPage />
    <AreaDisplayTab />
  </>
);

export default AreasPage;
