import StdTabs from '@common/layout/stdTabs/StdTabs.tsx';
import StdTabItem from '@common/layout/stdTabs/StdTabItem.tsx';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { useTranslation } from 'react-i18next';
import { ReactNode, useState } from 'react';
import { MenuProps } from '@/shared/types';
import ResDistributionTab from '@/components/tab/ResDistributionTab.tsx';
import ExpandableTab from '@/components/tab/ExpandableTab.tsx';

export const ResMenu = ({ defaultAreas, areas, studyData }: MenuProps) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TRAJECTORY_TYPE>(TRAJECTORY_TYPE.RES_CAPACITY);
  const [activeComponent, setActiveComponent] = useState<ReactNode>(
    <ExpandableTab
      defaultAreas={defaultAreas}
      areas={areas}
      studyData={studyData}
      type={TRAJECTORY_TYPE.RES_CAPACITY}
    />,
  );

  const renderActiveComponent = (trajectoryType: TRAJECTORY_TYPE): void => {
    switch (trajectoryType) {
      case TRAJECTORY_TYPE.RES_ZONAL_DISTRIBUTION:
        return setActiveComponent(
          <ResDistributionTab defaultAreas={defaultAreas} areas={areas} studyData={studyData} />,
        );
      case TRAJECTORY_TYPE.RES_LOAD:
        return setActiveComponent(
          <ExpandableTab
            defaultAreas={defaultAreas}
            areas={areas}
            studyData={studyData}
            type={TRAJECTORY_TYPE.RES_LOAD}
          />,
        );
      case TRAJECTORY_TYPE.RES_CAPACITY:
      default:
        return setActiveComponent(
          <ExpandableTab
            defaultAreas={defaultAreas}
            areas={areas}
            studyData={studyData}
            type={TRAJECTORY_TYPE.RES_CAPACITY}
          />,
        );
    }
  };
  const itemsTab = [
    { name: TRAJECTORY_TYPE.RES_CAPACITY, label: t('misc.@installedPower') },
    { name: TRAJECTORY_TYPE.RES_LOAD, label: t('misc.@loadFactor') },
  ];
  defaultAreas.length > 0 &&
    itemsTab.push({ name: TRAJECTORY_TYPE.RES_ZONAL_DISTRIBUTION, label: t('res.@distribution') });

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
        items={itemsTab}
      />
      {activeComponent}
    </div>
  );
};
