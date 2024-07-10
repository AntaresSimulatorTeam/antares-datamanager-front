/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import './App.css'
import Navbar from './components/pegase/navbar/Navbar'
import { menuBottomData, menuTopData } from './mocks/data/features/menuData.mock'

function App() {

  return (
      <div className="flex h-screen">
        <Navbar id='navBar' bottomItems={menuBottomData} topItems={menuTopData} />
      </div>
  )
}

export default App
