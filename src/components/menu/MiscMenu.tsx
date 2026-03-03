import StdTabs from '@common/layout/stdTabs/StdTabs.tsx';
import StdTabItem from '@common/layout/stdTabs/StdTabItem.tsx';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { useTranslation } from 'react-i18next';
import { ReactNode, useState } from 'react';
import MiscInstalledPowerTab from '@/components/tab/MiscInstalledPowerTab.tsx';
import MiscLoadFactorTab from '@/components/tab/MiscLoadFactor.tsx';
import { MenuProps } from '@/shared/types';

export const MiscMenu = ({ defaultAreas, areas, studyData }: MenuProps) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TRAJECTORY_TYPE>(TRAJECTORY_TYPE.MISC_CAPACITY);
  const [activeComponent, setActiveComponent] = useState<ReactNode>(
    <MiscInstalledPowerTab defaultAreas={defaultAreas} areas={areas} studyData={studyData} />,
  );

  const renderActiveComponent = (tab: TRAJECTORY_TYPE): void => {
    switch (tab) {
      case TRAJECTORY_TYPE.MISC_LOAD:
        return setActiveComponent(
          <MiscLoadFactorTab defaultAreas={defaultAreas} areas={areas} studyData={studyData} />,
        );
      case TRAJECTORY_TYPE.MISC_CAPACITY:
      default:
        return setActiveComponent(
          <MiscInstalledPowerTab defaultAreas={defaultAreas} areas={areas} studyData={studyData} />,
        );
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
        items={[
          { name: TRAJECTORY_TYPE.MISC_CAPACITY, label: t('misc.@installedPower') },
          { name: TRAJECTORY_TYPE.MISC_LOAD, label: t('misc.@loadFactor') },
        ]}
      />
      {activeComponent}
    </div>
  );
};
