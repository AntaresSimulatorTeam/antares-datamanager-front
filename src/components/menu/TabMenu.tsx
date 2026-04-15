import StdTabs from '@common/layout/stdTabs/StdTabs.tsx';
import StdTabItem from '@common/layout/stdTabs/StdTabItem.tsx';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { useTranslation } from 'react-i18next';
import { ReactNode, useCallback, useEffect, useState } from 'react';
import ExpandableTab from '@/components/tab/ExpandableTab.tsx';
import { ParametersTab } from '@/components/tab/ParametersTab.tsx';
import { MenuProps } from '@/shared/types';
import ResDistributionTab from '@/components/tab/ResDistributionTab.tsx';

export const TabMenu = ({ defaultAreas, areas, studyData, type }: MenuProps) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TRAJECTORY_TYPE>(type);
  const [activeComponent, setActiveComponent] = useState<ReactNode>(
    <ExpandableTab defaultAreas={defaultAreas} areas={areas} studyData={studyData} type={type} />,
  );

  const renderActiveComponent = useCallback(
    (tab: TRAJECTORY_TYPE) => {
      switch (tab) {
        case TRAJECTORY_TYPE.THERMAL_PARAMETER:
          return setActiveComponent(<ParametersTab defaultAreas={defaultAreas} areas={areas} studyData={studyData} />);
        case TRAJECTORY_TYPE.RES_ZONAL_DISTRIBUTION:
          return setActiveComponent(
            <ResDistributionTab defaultAreas={defaultAreas} areas={areas} studyData={studyData} />,
          );
        default:
          return setActiveComponent(
            <ExpandableTab defaultAreas={defaultAreas} areas={areas} studyData={studyData} type={tab} />,
          );
      }
    },
    [areas, defaultAreas, studyData, type],
  );

  useEffect(() => {
    setActiveTab(type);
    renderActiveComponent(type);
  }, [renderActiveComponent, type]);

  const getItemsMenu = (trajectoryType: TRAJECTORY_TYPE) => {
    if (trajectoryType === TRAJECTORY_TYPE.THERMAL_CAPACITY) {
      return [
        { name: TRAJECTORY_TYPE.THERMAL_CAPACITY, label: t('misc.@installedPower') },
        { name: TRAJECTORY_TYPE.THERMAL_PARAMETER, label: t('thermal.@parameters') },
      ];
    } else {
      const itemsTab = [
        { name: trajectoryType, label: t('misc.@installedPower') },
        {
          name: trajectoryType === TRAJECTORY_TYPE.RES_CAPACITY ? TRAJECTORY_TYPE.RES_LOAD : TRAJECTORY_TYPE.MISC_LOAD,
          label: t('misc.@loadFactor'),
        },
      ];
      if (trajectoryType === TRAJECTORY_TYPE.RES_CAPACITY) {
        defaultAreas.length > 0 &&
          itemsTab.push({ name: TRAJECTORY_TYPE.RES_ZONAL_DISTRIBUTION, label: t('res.@distribution') });
      }
      return itemsTab;
    }
  };

  return (
    <div className="flex h-full min-h-0 w-full flex-col gap-4">
      <StdTabs
        renderPrimary={(item) => (
          <StdTabItem
            key={item.name}
            active={activeTab === item.name}
            onClick={(selected) => {
              setActiveTab(selected as TRAJECTORY_TYPE);
              renderActiveComponent(selected as TRAJECTORY_TYPE);
            }}
            name={item.name}
            label={item.label}
          />
        )}
        items={getItemsMenu(type)}
      />
      {activeComponent}
    </div>
  );
};
