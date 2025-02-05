/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { ReactNode, useEffect, useState } from 'react';
import { RdsTabItem } from 'rte-design-system-react';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps';
import LoadTab from '@/components/tab/LoadTab.tsx';
import ThermalTab from '@/components/tab/ThermalTab.tsx';
import EnrTab from '@/components/tab/EnrTab.tsx';
import MiscTab from '@/components/tab/MiscLinkTab.tsx';
import AreaLinkTab from '@/components/tab/AreaLinkTab.tsx';
import StdIcon from '@common/base/stdIcon/StdIcon';
import { DbTrajectory } from '@/shared/types/Trajectory.type.ts';

const StudyNavigationMenu = ({
  onRenderActiveComponent,
  studyHorizon,
}: {
  onRenderActiveComponent?: (content: ReactNode | null) => void;
  studyHorizon: string;
}) => {
  const [activeTab, setActiveTab] = useState<string>('areasAndLinks');
  const [trajectories, setTrajectories] = useState<DbTrajectory[]>([]);

  const renderActiveComponent = (data: DbTrajectory[]): ReactNode | null => {
    switch (activeTab) {
      case 'areasAndLinks':
        return <AreaLinkTab studyHorizon={studyHorizon} />;
      case 'load':
        return <LoadTab />;
      case 'thermal':
        return <ThermalTab />;
      case 'enr':
        return <EnrTab />;
      case 'misc':
        return <MiscTab />;
      default:
        return null;
    }
  };

  useEffect(() => {
    if (onRenderActiveComponent) {
      onRenderActiveComponent(renderActiveComponent(trajectories));
    }
  }, [activeTab, onRenderActiveComponent]);

  const handleTabClick = (selectedItemName: string) => {
    setActiveTab(selectedItemName);
    console.log(`Tab clicked: ${selectedItemName}`);
  };

  const tabs = [
    { name: 'areasAndLinks', label: 'Areas & Links', icon: StdIconId.LinkedServices },
    { name: 'load', label: 'Load', icon: StdIconId.BatteryChargingFull },
    { name: 'thermal', label: 'Thermal', icon: StdIconId.LocalFireDepartment },
    { name: 'enr', label: 'ENR', icon: StdIconId.EnergySavingsLeaf },
    { name: 'misc', label: 'Misc', icon: StdIconId.Category },
  ];

  return (
    <div className="flex space-x-4 p-4">
      {tabs.map((tab) => (
        <div className="flex items-center space-x-2" key={tab.name}>
          <StdIcon name={tab.icon} />
          <RdsTabItem
            key={tab.name}
            name={tab.name}
            label={tab.label}
            active={activeTab === tab.name}
            onClick={() => handleTabClick(tab.name)}
          />
        </div>
      ))}
    </div>
  );
};

export default StudyNavigationMenu;
