import StdTabs from '@common/layout/stdTabs/StdTabs.tsx';
import StdTabItem from '@common/layout/stdTabs/StdTabItem.tsx';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { useTranslation } from 'react-i18next';
import { ReactNode, useState } from 'react';
import ExpandableTab from '@/components/tab/ExpandableTab.tsx';
import { ParametersTab } from '@/components/tab/ParametersTab.tsx';
import { MenuProps } from '@/shared/types';

export const ThermalMenu = ({ defaultAreas, areas, studyData }: MenuProps) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TRAJECTORY_TYPE>(TRAJECTORY_TYPE.THERMAL_CAPACITY);
  const [activeComponent, setActiveComponent] = useState<ReactNode>(
    <ExpandableTab
      defaultAreas={defaultAreas}
      areas={areas}
      studyData={studyData}
      type={TRAJECTORY_TYPE.THERMAL_CAPACITY}
    />,
  );

  const renderActiveComponent = (tab: TRAJECTORY_TYPE): void => {
    switch (tab) {
      case TRAJECTORY_TYPE.THERMAL_PARAMETER:
        return setActiveComponent(<ParametersTab defaultAreas={defaultAreas} areas={areas} studyData={studyData} />);
      case TRAJECTORY_TYPE.THERMAL_CAPACITY:
      default:
        return setActiveComponent(
          <ExpandableTab
            defaultAreas={defaultAreas}
            areas={areas}
            studyData={studyData}
            type={TRAJECTORY_TYPE.THERMAL_CAPACITY}
          />,
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
          { name: TRAJECTORY_TYPE.THERMAL_CAPACITY, label: t('thermal.@installedPower') },
          { name: TRAJECTORY_TYPE.THERMAL_PARAMETER, label: t('thermal.@parameters') },
        ]}
      />
      {activeComponent}
    </div>
  );
};
