/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { Dispatch, ReactNode, SetStateAction, useEffect, useState } from 'react';
import { RdsTabItem } from 'rte-design-system-react';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps';
import LoadTab from '@/components/tab/LoadTab.tsx';
import ThermalTab from '@/components/tab/ThermalTab.tsx';
import EnrTab from '@/components/tab/EnrTab.tsx';
import MiscTab from '@/components/tab/MiscLinkTab.tsx';
import AreaLinkTab from '@/components/tab/AreaLinkTab.tsx';
import StdIcon from '@common/base/stdIcon/StdIcon';
import { TRAJECTORY_SELECTION_STATUS, TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { useTranslation } from 'react-i18next';
import { useStudy } from '@/store/contexts/StudyContext.tsx';
import { HypothesisTab } from '@/shared/types';

const StudyNavigationMenu = ({
  onRenderActiveComponent,
  setActiveTab,
  activeTab,
}: {
  onRenderActiveComponent?: (content: ReactNode | null) => void;
  setActiveTab: Dispatch<SetStateAction<HypothesisTab>>;
  activeTab: HypothesisTab;
}) => {
  const { t } = useTranslation();
  const studyState = useStudy();
  const [tabs, setTabs] = useState<HypothesisTab[]>([
    {
      name: TRAJECTORY_TYPE.AREA,
      label: t('studyDetails.@areas_links'),
      icon: StdIconId.LinkedServices,
      isDisabled: false,
    },
    {
      name: TRAJECTORY_TYPE.LOAD,
      label: t('studyDetails.@load'),
      icon: StdIconId.BatteryChargingFull,
      isDisabled: studyState[`${TRAJECTORY_TYPE.AREA}`]?.state !== TRAJECTORY_SELECTION_STATUS.OK,
    },
    {
      name: TRAJECTORY_TYPE.THERMAL_COST,
      label: t('studyDetails.@thermal'),
      icon: StdIconId.LocalFireDepartment,
      isDisabled: true,
    },
    { name: TRAJECTORY_TYPE.ENR, label: t('studyDetails.@enr'), icon: StdIconId.EnergySavingsLeaf, isDisabled: true },
    { name: TRAJECTORY_TYPE.MISC, label: t('studyDetails.@misc'), icon: StdIconId.Category, isDisabled: true },
  ]);

  const isTabDisabled = (name: TRAJECTORY_TYPE) => {
    if (name === TRAJECTORY_TYPE.LOAD) {
      return studyState[`${TRAJECTORY_TYPE.AREA}`]?.state !== TRAJECTORY_SELECTION_STATUS.OK;
    }
    return name !== TRAJECTORY_TYPE.AREA;
  };

  const renderActiveComponent = (): ReactNode | null => {
    switch (activeTab.name) {
      case TRAJECTORY_TYPE.AREA:
        return <AreaLinkTab />;
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
    setTabs((prev) =>
      prev.map((tab) => ({
        ...tab,
        isDisabled: isTabDisabled(tab.name),
      })),
    );
  }, [studyState]);

  useEffect(() => {
    if (onRenderActiveComponent) {
      if (!activeTab.isDisabled) {
        onRenderActiveComponent(renderActiveComponent());
      }
    }
  }, [activeTab, onRenderActiveComponent]);

  return (
    <div className="flex space-x-4 p-4">
      {tabs.map((tab) => (
          <div className="flex items-center space-x-2" key={tab.name}>
            <StdIcon name={tab.icon} />
            <RdsTabItem
              key={tab.name}
              name={tab.name}
              label={tab.label}
              active={!tab.isDisabled && activeTab.name === tab.name}
              onClick={() => !tab.isDisabled && setActiveTab(tab)}
              disabled={tab.isDisabled}
            />
          </div>
        ))}
    </div>
  );
};

export default StudyNavigationMenu;
