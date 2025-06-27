/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { Dispatch, ReactNode, SetStateAction, useEffect, useState } from 'react';
import { RdsTabItem } from 'rte-design-system-react';
import LoadTab from '@/components/tab/LoadTab.tsx';
import EnrTab from '@/components/tab/EnrTab.tsx';
import MiscTab from '@/components/tab/MiscLinkTab.tsx';
import AreaLinkTab from '@/components/tab/AreaLinkTab.tsx';
import StdIcon from '@common/base/stdIcon/StdIcon.tsx';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { useTranslation } from 'react-i18next';
import { useStudy } from '@/store/contexts/StudyContext.tsx';
import { HypothesisTab, LocationStudy } from '@/shared/types';
import StdAvatar from '@common/layout/stdAvatar/StdAvatar.tsx';
import { getMessagesNb } from '@/shared/utils/warningUtils.ts';
import { ThermalMenu } from '@/components/menu/ThermalMenu.tsx';
import { getStudyMenu } from '@/shared/utils/trajectoryUtils.ts';
import { useFetchAreas } from '@/hooks/useFetchAreas.ts';
import { useLocation } from 'react-router-dom';

type StudyNavigationMenuProps = {
  onRenderActiveComponent?: (content: ReactNode | null) => void;
  setActiveTab: Dispatch<SetStateAction<HypothesisTab>>;
  activeTab: HypothesisTab;
  setErrorMessage: Dispatch<SetStateAction<string>>;
};

const StudyNavigationMenu = ({
  onRenderActiveComponent,
  setActiveTab,
  activeTab,
  setErrorMessage,
}: StudyNavigationMenuProps) => {
  const { t } = useTranslation();
  const studyState = useStudy();
  const [tabs, setTabs] = useState<HypothesisTab[]>(getStudyMenu(t, !!studyState[`${TRAJECTORY_TYPE.AREA}`]?.[0]));
  const location = useLocation();
  const study = (location.state as LocationStudy)?.study;
  const { areaDefault, trajectoryAreas } = useFetchAreas(study?.id);

  const renderActiveComponent = (): ReactNode | null => {
    switch (activeTab.name) {
      case TRAJECTORY_TYPE.AREA:
        return <AreaLinkTab setErrorMessage={setErrorMessage} />;
      case TRAJECTORY_TYPE.LOAD:
        return <LoadTab defaultAreas={areaDefault} areas={trajectoryAreas} />;
      case TRAJECTORY_TYPE.THERMAL_CAPACITY:
        return <ThermalMenu defaultAreas={areaDefault} areas={trajectoryAreas} />;
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
        isDisabled: !studyState[`${TRAJECTORY_TYPE.AREA}`]?.[0],
      })),
    );
  }, [studyState]);

  useEffect(() => {
    if (onRenderActiveComponent) {
      if (!activeTab.isDisabled) {
        setErrorMessage('');
        onRenderActiveComponent(renderActiveComponent());
      }
    }
  }, [activeTab, onRenderActiveComponent]);

  return (
    <div className="flex space-x-4 p-4">
      {tabs.map((tab) => {
        const warmingMessagesNb = getMessagesNb(studyState, tab.name);
        return (
          <div className="flex items-center space-x-2" key={tab.name}>
            <StdIcon name={tab.icon} />
            <RdsTabItem
              key={tab.name}
              name={tab.name}
              label={tab.label}
              active={activeTab.name === tab.name}
              disabled={tab.isDisabled}
              onClick={() => setActiveTab(tab)}
            />
            {warmingMessagesNb > 0 && activeTab.name !== tab.name && (
              <StdAvatar
                initials={`${warmingMessagesNb}`}
                size="es"
                backgroundColor="orange"
                fullname=""
                textColor="white"
                hasToolTip={false}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default StudyNavigationMenu;
