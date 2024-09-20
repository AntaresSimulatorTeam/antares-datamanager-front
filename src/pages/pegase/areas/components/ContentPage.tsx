/* /*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import TabDisplayArea from './AreaDisplayTab';
import TabSelection from './TabSelection';

const menuItems = [
  { id: 'area', path: '/area', key: 'area', icon: 'area', label: 'Area', component: TabDisplayArea },
  //{ id: 'load', path: '/load', key: 'load', icon: 'load', label: 'Load', component: TabDisplayLoad },
  //{ id: 'thermal', path: '/thermal', key: 'thermal', icon: 'thermal', label: 'Thermal', component: TabDisplayThermal },
];

const ContentPage = () => {
  return (
    <div className="flex w-full flex-col gap-3 overflow-auto p-9 text-left">
      <span>2069-2070</span>
      <TabSelection menuItems={menuItems} expanded={true} />
    </div>
  );
};

export default ContentPage;
