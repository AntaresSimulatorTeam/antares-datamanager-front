/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import StdTabItem from '@/components/common/layout/stdTabs/StdTabItem';
import StdTabList from '@/components/common/layout/stdTabs/StdTabList';
import { MenuNavItem } from '@/shared/types/index';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps';
import { useLocation, Routes, Route } from 'react-router-dom';

import TabDisplayArea from './AreaDisplayTab'; // Tab content components

const TabSelection = () => {
  const location = useLocation();

  const tabItems: MenuNavItem[] = [
    { key: 'area', label: 'Area', path: '/areas', icon: StdIconId.Palette },
    { key: 'load', label: 'Load', path: '/load', icon: StdIconId.Tune },
    { key: 'thermal', label: 'Thermal', path: '/thermal', icon: StdIconId.Tune },
  ];

  const handleTabClick = (selectedItemName: string) => {
    const selectedTab = tabItems.find((item) => item.key === selectedItemName);
    if (selectedTab) {
      window.history.pushState({}, '', selectedTab.path);
    }
  };

  const renderTabItem = (item: MenuNavItem) => (
    <StdTabItem
      key={item.key}
      name={item.key}
      label={item.label}
      icon={item.icon}
      active={location.pathname === item.path}
      onClick={handleTabClick}
    />
  );

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex justify-center gap-6 p-4">
        <StdTabList tabType="primary" items={tabItems} renderItem={renderTabItem} />
      </div>

      <div className="flex-grow p-4">
        <Routes>
          <Route path="/areas" element={<TabDisplayArea />} />
          {/*  <Route path="/load" element={<TabDisplayLoad />} />
          <Route path="/thermal" element={<TabDisplayThermal />} /> */}
        </Routes>
      </div>
    </div>
  );
};

export default TabSelection;
