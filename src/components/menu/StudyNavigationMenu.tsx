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
import { AreaLinkTab } from '@/components/tab/AreaLinkTab.tsx';
import { TabMenu } from '@/components/menu/TabMenu.tsx';
import ExpandableTab from '@/components/tab/ExpandableTab.tsx';
import { Tab } from '@design-system-rte/react';
import { TabItemProps } from '@design-system-rte/core/components/tab/tab.interface';
import { ContainerWithExpander } from '@/components/banner/ContainerWithExpander.tsx';
import { useFetchWarningMessages } from '@/hooks/useFetchWarningMessages.ts';

type StudyNavigationMenuProps = {
  setErrorMessage: Dispatch<SetStateAction<string>>;
  studyData: StudyDTO;
};

const StudyNavigationMenu = ({ setErrorMessage, studyData }: StudyNavigationMenuProps) => {
  const { t } = useTranslation();
  const studyState = useStudy();
  const [tabs, setTabs] = useState<TabItemProps[]>(
    getStudyMenu(t, !!studyState[`${TRAJECTORY_TYPE.AREA}`]?.trajectories?.[0]),
  );
  const [activeTab, setActiveTab] = useState<TabItemProps>({
    id: TRAJECTORY_TYPE.AREA,
    panelId: TRAJECTORY_TYPE.AREA,
    label: t('studyDetails.@areas_links'),
    icon: 'share',
    disabled: false,
  });

  const { areaDefault, trajectoryAreas } = useFetchAreas(studyState[`${TRAJECTORY_TYPE.AREA}`]?.trajectories?.[0]);
  const { warningMessages } = useFetchWarningMessages(
    studyData.id ? Number(studyData.id) : null,
    activeTab.id as TRAJECTORY_TYPE,
  );

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
    setTabs((prev) =>
      prev.map((tab) => {
        let nbWarning =
          warningMessages?.filter((message) => message.trajectoryType === (tab.id as TRAJECTORY_TYPE)).length || 0;
        if (TRAJECTORY_TYPE.AREA === (tab.id as TRAJECTORY_TYPE)) {
          nbWarning +=
            warningMessages?.filter((message) => message.trajectoryType === TRAJECTORY_TYPE.LINK)?.length || 0;
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

    if (!activeTab.disabled) {
      setErrorMessage('');
      renderActiveComponent(activeTab.id as TRAJECTORY_TYPE);
    }
  }, [
    activeTab.disabled,
    activeTab.id,
    areaDefault,
    renderActiveComponent,
    setErrorMessage,
    studyData,
    studyData?.id,
    studyState,
    trajectoryAreas,
  ]);

  return (
    <div className="flex w-full flex-col gap-4">
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
      <ContainerWithExpander content={warningMessages} placeholder={t('studyDetails.@noWarnings')} />
      {renderActiveComponent(activeTab.id as TRAJECTORY_TYPE)}
    </div>
  );
};

export default StudyNavigationMenu;
