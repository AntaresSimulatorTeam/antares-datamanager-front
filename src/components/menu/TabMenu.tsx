import StdTabs from '@common/layout/stdTabs/StdTabs.tsx';
import StdTabItem from '@common/layout/stdTabs/StdTabItem.tsx';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { useTranslation } from 'react-i18next';
import { useCallback, useEffect, useState } from 'react';
import ExpandableTab from '@/components/tab/ExpandableTab.tsx';
import { ParametersTab } from '@/components/tab/ParametersTab.tsx';
import { MenuProps } from '@/shared/types';
import ResDistributionTab from '@/components/tab/ResDistributionTab.tsx';
import { getItemsMenu } from '@/shared/utils/trajectoryUtils.ts';
import { EXPANDABLE_TYPES_MAP } from '@/shared/const/trajectoryTypes.ts';

export const TabMenu = ({ defaultAreas, areas, studyData, type }: MenuProps) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TRAJECTORY_TYPE>(type);

  useEffect(() => {
    setActiveTab(type);
  }, [type]);

  const renderActiveComponent = useCallback(
    (tab: TRAJECTORY_TYPE) => {
      if (tab === TRAJECTORY_TYPE.THERMAL_PARAMETER)
        return <ParametersTab defaultAreas={defaultAreas} areas={areas} studyData={studyData} />;

      if (tab === TRAJECTORY_TYPE.RES_ZONAL_DISTRIBUTION)
        return (
          <ResDistributionTab
            defaultAreas={defaultAreas}
            areas={areas}
            studyData={studyData}
            types={EXPANDABLE_TYPES_MAP[tab] ?? [tab]}
          />
        );

      return (
        <ExpandableTab
          tabType={tab}
          defaultAreas={defaultAreas}
          areas={areas}
          studyData={studyData}
          types={EXPANDABLE_TYPES_MAP[tab] ?? [tab]}
        />
      );
    },
    [areas, defaultAreas, studyData],
  );

  return (
    <div className="flex h-full min-h-0 w-full flex-col gap-4">
      <StdTabs
        renderPrimary={(item) => (
          <StdTabItem
            key={item.name}
            active={activeTab === item.name}
            onClick={(selected) => setActiveTab(selected as TRAJECTORY_TYPE)}
            name={item.name}
            label={item.label}
          />
        )}
        items={getItemsMenu(type, t, defaultAreas)}
      />
      {renderActiveComponent(activeTab)}
    </div>
  );
};
