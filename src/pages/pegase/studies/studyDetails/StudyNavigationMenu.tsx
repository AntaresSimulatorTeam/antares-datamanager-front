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
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { useTranslation } from 'react-i18next';

const StudyNavigationMenu = ({
  onRenderActiveComponent,
  studyHorizon,
}: {
  onRenderActiveComponent?: (content: ReactNode | null) => void;
  studyHorizon: string;
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TRAJECTORY_TYPE>(TRAJECTORY_TYPE.AREA);

  const renderActiveComponent = (horizon: string): ReactNode | null => {
    switch (activeTab) {
      case TRAJECTORY_TYPE.AREA:
        return <AreaLinkTab studyHorizon={horizon} />;
      case TRAJECTORY_TYPE.LOAD:
        return <LoadTab />;
      case TRAJECTORY_TYPE.THERMAL_COST:
        return <ThermalTab />;
      case TRAJECTORY_TYPE.ENR:
        return <EnrTab />;
      case TRAJECTORY_TYPE.MISC:
        return <MiscTab />;
      default:
        return null;
    }
  };

  useEffect(() => {
    if (onRenderActiveComponent) {
      onRenderActiveComponent(renderActiveComponent(studyHorizon));
    }
  }, [activeTab, onRenderActiveComponent]);

  const handleTabClick = (selectedItemName: TRAJECTORY_TYPE) => {
    setActiveTab(selectedItemName);
  };

  const tabs = [
    { name: TRAJECTORY_TYPE.AREA, label: t('studyDetails.@areas_links'), icon: StdIconId.LinkedServices },
    { name: TRAJECTORY_TYPE.LOAD, label: t('studyDetails.@load'), icon: StdIconId.BatteryChargingFull },
    { name: TRAJECTORY_TYPE.THERMAL_COST, label: t('studyDetails.@thermal'), icon: StdIconId.LocalFireDepartment },
    { name: TRAJECTORY_TYPE.ENR, label: t('studyDetails.@enr'), icon: StdIconId.EnergySavingsLeaf },
    { name: TRAJECTORY_TYPE.MISC, label: t('studyDetails.@misc'), icon: StdIconId.Category },
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
