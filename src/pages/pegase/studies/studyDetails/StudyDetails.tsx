/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { ReactNode, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { RdsDivider } from 'rte-design-system-react';
import StudyNavigationMenu from '@/components/menu/StudyNavigationMenu.tsx';
import { HypothesisTab, PegaseBreadcrumbItemType, StudyDTO } from '@/shared/types';
import { useTranslation } from 'react-i18next';
import { useStudy, useStudyDispatch } from '@/store/contexts/StudyContext.tsx';
import { generateStudy, getStudyById } from '@/shared/services/studyService.ts';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps.ts';
import { ButtonWithStdIcon } from '@/components/button/ButtonWithStdIcon.tsx';
import { STUDY_ACTION } from '@/shared/enum/study.ts';
import { DetailsContent } from '@/components/banner/DetailsContent.tsx';
import { StudyStatus } from '@/shared/types/common/StudyStatus.type.ts';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { ContainerWithExpander } from '@/components/banner/ContainerWithExpander.tsx';
import { useFetchWarningMessages } from '@/hooks/useFetchWarningMessages.ts';
import StudyModificationModal from '@common/modal/StudyModificationModal.tsx';
import { useNewStudyModal } from '@/hooks/useNewStudyModal.ts';
import { useProjectNavigation } from '@/hooks/useProjectNavigation.ts';
import { PegaseBreadcrumb } from '@common/layout/PegaseBreadcrumb/PegaseBreadcrumb.tsx';

const StudyDetails = () => {
  const [activeContent, setActiveContent] = useState<ReactNode>(null);
  const { id } = useParams();
  const { t } = useTranslation();
  const studyState = useStudy();
  const dispatch = useStudyDispatch();
  const { isModalOpen, toggleModal } = useNewStudyModal();
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<HypothesisTab>({
    name: TRAJECTORY_TYPE.AREA,
    label: t('studyDetails.@areas_links'),
    icon: StdIconId.LinkedServices,
    isDisabled: false,
  });
  const [errorMessage, setErrorMessage] = useState<string>('');
  const { warningMessages } = useFetchWarningMessages(id ? Number(id) : null, activeTab.name);
  const [reloadStudy, setReloadStudy] = useState(0);
  const [studyData, setStudyData] = useState<StudyDTO | null>(null);
  const { navigateToProject } = useProjectNavigation();
  const headerItems: PegaseBreadcrumbItemType[] = [
    {
      key: 'item-0',
      label: studyData?.project ?? '',
      data: { id: studyData?.projectId ?? '', name: studyData?.project ?? '' },
      onClickItem: navigateToProject,
    },
    {
      key: 'item-1',
      label: studyData?.name ?? '',
      data: null,
    },
  ];

  const handleGenerateStudy = async (studyId: number) => {
    try {
      setIsGenerating(true);
      await generateStudy(studyId);
      dispatch?.({ type: STUDY_ACTION.SET_STUDY_STATUS, payload: StudyStatus.GENERATED });
    } catch {
      // Silent handler
    } finally {
      setIsGenerating(false);
    }
  };

  const onCloseModal = () => {
    toggleModal();
    setReloadStudy((prev) => prev + 1);
  };

  useEffect(() => {
    const fetchStudyData = async (studyId: number) => {
      const studyUpdated = await getStudyById(studyId);
      setStudyData(studyUpdated);
    };
    if (id != null) {
      void fetchStudyData(Number(id));
    }
  }, [reloadStudy, id]);

  return !studyData ? (
    <div className="flex h-screen items-center justify-center">
      <p>{t('studyDetails.@loading')}</p>
    </div>
  ) : (
    <div className="flex h-full flex-col gap-4">
      <div className="px-3 pt-3">
        <PegaseBreadcrumb items={headerItems} />
      </div>
      <RdsDivider />
      <div className="flex flex-1 flex-col gap-2 overflow-hidden px-3 pb-3">
        <DetailsContent content={studyData} onClickButton={toggleModal} />

        <div className="flex flex-1 flex-col overflow-hidden">
          <StudyNavigationMenu
            onRenderActiveComponent={setActiveContent}
            setActiveTab={setActiveTab}
            activeTab={activeTab}
            setErrorMessage={setErrorMessage}
            studyData={studyData}
          />

          <div className="flex flex-1 flex-col gap-4 overflow-y-auto pb-10">
            <ContainerWithExpander content={warningMessages} placeholder={t('studyDetails.@noWarnings')} />

            <div className="w-full pb-2">{activeContent}</div>
          </div>

          <div className="fixed bottom-0 right-0 w-full border-t bg-gray-w px-1 py-1.5">
            <div className="flex h-fit w-full items-center justify-end">
              {!studyState.AREA?.trajectories?.length && !errorMessage && (
                <div className="mr-1 text-error-600">{t('studyDetails.@add_trajectories_message')}</div>
              )}
              {errorMessage && <div className="mr-1 text-error-600">{errorMessage}</div>}
              <ButtonWithStdIcon
                label={t('studyDetails.@generate')}
                onClick={() => studyData?.id && void handleGenerateStudy(studyData?.id)}
                disabled={!studyState.AREA?.trajectories?.length || studyState.studyStatus === StudyStatus.GENERATED}
                icon={StdIconId.CheckCircle}
                position="right"
                isLoading={isGenerating}
              />
            </div>
          </div>
        </div>
      </div>
      {isModalOpen && studyData && studyData.status !== StudyStatus.GENERATED && (
        <StudyModificationModal onClose={onCloseModal} study={studyData} />
      )}
    </div>
  );
};

export default StudyDetails;
