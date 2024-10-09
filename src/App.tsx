/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { Outlet } from 'react-router-dom';
import './App.css';
import ThemeHandler from './components/common/handler/ThemeHandler';
import Navbar from './components/pegase/navbar/Navbar';
import PegaseStar from './components/pegase/star/PegaseStar';
import { UserContext } from './contexts/UserContext';
import { menuBottomData, menuTopData } from './mocks/data/features/menuData.mock';
import { PEGASE_NAVBAR_ID } from './shared/constants';
import { THEME_COLOR } from './shared/types';

function App() {
  return (
    <div className="flex h-screen w-screen dark:bg-acc2-950 dark:text-gray-200">
      <UserContext.Provider initialState={{ theme: THEME_COLOR.LIGHT }}>
        <ThemeHandler />
        <Navbar id={PEGASE_NAVBAR_ID} bottomItems={menuBottomData} topItems={menuTopData} />
        <div className="flex h-full w-full flex-col">
          <PegaseStar />
          <Outlet />
        </div>
      </UserContext.Provider>
    </div>
  );
}

export default App;
