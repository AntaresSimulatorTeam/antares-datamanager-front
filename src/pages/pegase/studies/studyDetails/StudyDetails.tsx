/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { ReactNode, useEffect, useState } from 'react';
import { Location, useLocation } from 'react-router-dom';
import StudyHeader from './StudyHeader.tsx';
import { RdsDivider } from 'rte-design-system-react';
import StudyNavigationMenu from '@/components/menu/StudyNavigationMenu.tsx';
import { HypothesisTab, StudyDTO } from '@/shared/types';
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

interface StudyState {
  study: StudyDTO;
}

const StudyDetails = () => {
  const [activeContent, setActiveContent] = useState<ReactNode>(null);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const location: Location<StudyState> = useLocation();
  const { study } = location.state || {};
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
  const { warningMessages } = useFetchWarningMessages(study.id, activeTab.name);
  const [reloadStudy, setReloadStudy] = useState(0);
  const [studyData, setStudyData] = useState<StudyDTO>(study);

  const handleGenerateStudy = async () => {
    try {
      setIsGenerating(true);
      await generateStudy(study.id);
      setIsGenerating(false);
      dispatch?.({ type: STUDY_ACTION.SET_STUDY_STATUS, payload: StudyStatus.GENERATED });
    } catch {
      setIsGenerating(false);
    }
  };

  const onCloseModal = () => {
    toggleModal();
    setReloadStudy((prev) => prev + 1);
  };

  useEffect(() => {
    const fetchStudyData = async (id: number) => {
      const studyUpdated = await getStudyById(id);
      setStudyData(studyUpdated);
    };
    if (study.id != null) {
      void fetchStudyData(study.id);
    }
  }, [reloadStudy, study.id]);

  return !study.id ? (
    <div className="flex h-screen items-center justify-center">
      <p>{t('studyDetails.@loading')}</p>
    </div>
  ) : (
    <div className="flex h-full w-full flex-col pb-16">
      <StudyHeader study={studyData} />
      <div className="relative flex h-full w-full flex-col">
        <RdsDivider />
        <div className="flex flex-col">
          <DetailsContent content={studyData} onClickButton={toggleModal} />
        </div>
        <div className="flex px-3 pt-2">
          <div className="flex items-end self-stretch">
            <StudyNavigationMenu
              onRenderActiveComponent={setActiveContent}
              setActiveTab={setActiveTab}
              activeTab={activeTab}
              setErrorMessage={setErrorMessage}
              studyId={study.id}
            />
          </div>
        </div>
        <div className="relative flex flex-1 flex-col overflow-y-auto px-4">
          <div className="flex h-full w-full flex-col gap-4">
            <ContainerWithExpander content={warningMessages} placeholder={t('studyDetails.@noWarnings')} />
            <div className="flex h-screen w-full">{activeContent}</div>
          </div>
          <div className="fixed bottom-0 right-0 w-full border-t bg-gray-w px-1 py-1.5">
            <div className="flex h-fit w-full items-center justify-end">
              {!studyState.AREA?.trajectories?.length && !errorMessage && (
                <div className="mr-1 text-error-600">{t('studyDetails.@add_trajectories_message')}</div>
              )}
              {errorMessage && <div className="mr-1 text-error-600">{errorMessage}</div>}
              <ButtonWithStdIcon
                label={t('studyDetails.@generate')}
                onClick={() => void handleGenerateStudy()}
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
