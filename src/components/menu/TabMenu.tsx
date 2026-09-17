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

export const TabMenu = ({ studyData, defaultAreas, type, areas }: MenuProps) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TRAJECTORY_TYPE>(type === TRAJECTORY_TYPE.OTHER_VECTOR ? TRAJECTORY_TYPE.P2G : type);
  const tabs = useMemo(() => getItemsMenu(type, t, defaultAreas), [type, t, defaultAreas]);

  const renderActiveComponent = useCallback(
    (trajectoryType: TRAJECTORY_TYPE) => {
      if (trajectoryType === TRAJECTORY_TYPE.THERMAL_PARAMETER)
        return (
          <ParametersTab
            key={`${trajectoryType}-parameters-tab`}
            studyData={studyData}
            defaultAreas={defaultAreas}
            areas={areas}
          />
        );

      if (trajectoryType === TRAJECTORY_TYPE.RES_ZONAL_DISTRIBUTION)
        return (
          <ResDistributionTab
            key={`${trajectoryType}-distribution-tab`}
            studyData={studyData}
            types={EXPANDABLE_TYPES_MAP[trajectoryType] ?? [trajectoryType]}
            defaultAreas={defaultAreas}
            areas={areas}
          />
        );

      return (
        <ExpandableTab
          key={`${trajectoryType}-expandable-tab`}
          tabType={trajectoryType}
          studyData={studyData}
          types={EXPANDABLE_TYPES_MAP[trajectoryType] ?? [trajectoryType]}
          defaultAreas={defaultAreas}
          areas={areas}
        />
      );
    },
    [areas, defaultAreas, studyData],
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
