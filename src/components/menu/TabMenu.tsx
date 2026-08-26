import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { useTranslation } from 'react-i18next';
import { useCallback, useMemo, useState } from 'react';
import ExpandableTab from '@/components/tab/ExpandableTab.tsx';
import { ParametersTab } from '@/components/tab/ParametersTab.tsx';
import { MenuProps } from '@/shared/types';
import ResDistributionTab from '@/components/tab/ResDistributionTab.tsx';
import { EXPANDABLE_TYPES_MAP } from '@/shared/const/trajectoryTypes.ts';
import { Tab } from '@design-system-rte/react';
import { getItemsMenu } from '@/shared/utils/trajectoryUtils.ts';

export const TabMenu = ({ studyData, defaultAreas, type }: MenuProps) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TRAJECTORY_TYPE>(type);
  const tabs = useMemo(() => getItemsMenu(type, t, defaultAreas), [type, t, defaultAreas]);

  const renderActiveComponent = useCallback(
    (tab: TRAJECTORY_TYPE) => {
      if (tab === TRAJECTORY_TYPE.THERMAL_PARAMETER)
        return (
          <ParametersTab
            key={`${tab}-parameters-tab`}
            studyData={studyData}
          />
        );

      if (tab === TRAJECTORY_TYPE.RES_ZONAL_DISTRIBUTION)
        return (
          <ResDistributionTab
            key={`${tab}-distribution-tab`}
            studyData={studyData}
            types={EXPANDABLE_TYPES_MAP[tab] ?? [tab]}
          />
        );

      return (
        <ExpandableTab
          key={`${tab}-expandable-tab`}
          tabType={tab}
          studyData={studyData}
          types={EXPANDABLE_TYPES_MAP[tab] ?? [tab]}
        />
      );
    },
    [studyData],
  );

  return (
    <div className="flex h-full min-h-0 w-full flex-col gap-4">
      <Tab
        onChange={(id) => {
          const tabId = tabs.find((tab) => tab.id === (id as TRAJECTORY_TYPE));
          if (tabId) setActiveTab(tabId.id);
        }}
        direction="horizontal"
        alignment="start"
        overflowType="dropdown"
        selectedTabId={activeTab}
        inverted={false}
        options={tabs}
      />
      {renderActiveComponent(activeTab)}
    </div>
  );
};
