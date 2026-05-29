/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { Dispatch, ReactNode, SetStateAction, useCallback, useEffect, useState } from 'react';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { useTranslation } from 'react-i18next';
import { useStudy } from '@/store/contexts/StudyContext.tsx';
import { StudyDTO } from '@/shared/types';
import { getStudyMenu } from '@/shared/utils/trajectoryUtils.ts';
import { useFetchAreas } from '@/hooks/useFetchAreas.ts';
import { getNbMessagesFromTrajectoryType } from '@/shared/services/trajectoryService.ts';
import { AreaLinkTab } from '@/components/tab/AreaLinkTab.tsx';
import { TabMenu } from '@/components/menu/TabMenu.tsx';
import ExpandableTab from '@/components/tab/ExpandableTab.tsx';
import { Tab } from '@design-system-rte/react';
import { TabItemProps } from '@design-system-rte/core/components/tab/tab.interface';

type StudyNavigationMenuProps = {
  onRenderActiveComponent?: (content: ReactNode | null) => void;
  setActiveTab: Dispatch<SetStateAction<TabItemProps>>;
  activeTab: TabItemProps;
  setErrorMessage: Dispatch<SetStateAction<string>>;
  studyData: StudyDTO;
};

const StudyNavigationMenu = ({
  onRenderActiveComponent,
  setActiveTab,
  activeTab,
  setErrorMessage,
  studyData,
}: StudyNavigationMenuProps) => {
  const { t } = useTranslation();
  const studyState = useStudy();
  const [tabs, setTabs] = useState<TabItemProps[]>(
    getStudyMenu(t, !!studyState[`${TRAJECTORY_TYPE.AREA}`]?.trajectories?.[0]),
  );

  const { areaDefault, trajectoryAreas } = useFetchAreas(studyState[`${TRAJECTORY_TYPE.AREA}`]?.trajectories?.[0]);

  useEffect(() => {
    setTabs((prev) =>
      prev.map((tab) => ({
        ...tab,
        disabled:
          tab.id != (TRAJECTORY_TYPE.AREA as string) && !studyState[`${TRAJECTORY_TYPE.AREA}`]?.trajectories?.[0],
      })),
    );
  }, [studyState[`${TRAJECTORY_TYPE.AREA}`]?.trajectories]);

  const renderActiveComponent = useCallback(
    (type: TRAJECTORY_TYPE): ReactNode | null => {
      switch (type) {
        case TRAJECTORY_TYPE.LOAD:
        case TRAJECTORY_TYPE.DSR:
        case TRAJECTORY_TYPE.STS:
          return (
            <ExpandableTab
              tabType={type}
              types={[type]}
              defaultAreas={areaDefault}
              areas={trajectoryAreas}
              studyData={studyData}
            />
          );
        case TRAJECTORY_TYPE.THERMAL_CAPACITY:
        case TRAJECTORY_TYPE.MISC_CAPACITY:
        case TRAJECTORY_TYPE.RES_CAPACITY:
        case TRAJECTORY_TYPE.HYDRO_SERIES:
          return <TabMenu type={type} defaultAreas={areaDefault} areas={trajectoryAreas} studyData={studyData} />;
        default:
          return <AreaLinkTab setErrorMessage={setErrorMessage} studyData={studyData} />;
      }
    },
    [areaDefault, setErrorMessage, studyData, trajectoryAreas],
  );

  useEffect(() => {
    const countNbWarningMessages = async (id: number) => {
      try {
        const result = await getNbMessagesFromTrajectoryType(id);
        setTabs((prev) =>
          prev.map((tab) => {
            let nbWarning = result?.[tab.id as TRAJECTORY_TYPE] || 0;
            if (TRAJECTORY_TYPE.AREA === (tab.id as TRAJECTORY_TYPE)) {
              nbWarning += result.LINK || 0;
            }
            const count = { badgeCount: 0 };
            if (activeTab.id !== tab.id && nbWarning > 0) {
              count.badgeCount = nbWarning;
              return {
                ...tab,
                ...(activeTab.id !== tab.id && nbWarning > 0 && count),
              };
            } else if (activeTab.id === tab.id) {
              delete tab.badgeCount;
              return {
                ...tab,
              };
            } else {
              return tab;
            }
          }),
        );
      } catch {
        // silent handler
      }
    };

    void countNbWarningMessages(studyData?.id);
    if (onRenderActiveComponent) {
      if (!activeTab.disabled) {
        setErrorMessage('');
        onRenderActiveComponent(renderActiveComponent(activeTab.id as TRAJECTORY_TYPE));
      }
    }
  }, [
    activeTab.disabled,
    activeTab.id,
    areaDefault,
    onRenderActiveComponent,
    renderActiveComponent,
    setErrorMessage,
    studyData,
    studyData?.id,
    studyState,
    trajectoryAreas,
  ]);

  return (
    <div className="pb-4">
      <Tab
        onChange={(id) => {
          const tabId = tabs.find((tab) => tab.id === id);
          if (tabId) {
            setActiveTab(tabId);
          }
        }}
        direction="horizontal"
        alignment="start"
        overflowType="dropdown"
        selectedTabId={activeTab.id}
        inverted={false}
        options={tabs}
      />
    </div>
  );
};

export default StudyNavigationMenu;
