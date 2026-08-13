/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import StudyNavigationMenu from '@/components/menu/StudyNavigationMenu.tsx';
import { StudyDTO } from '@/shared/types';
import { useTranslation } from 'react-i18next';
import { useStudy, useStudyDispatch } from '@/store/contexts/StudyContext.tsx';
import { generateStudy, getStudyById } from '@/shared/services/studyService.ts';
import { STUDY_ACTION } from '@/shared/enum/study.ts';
import { DetailsContent } from '@/components/banner/DetailsContent.tsx';
import { StudyStatus } from '@/shared/types/common/StudyStatus.type.ts';
import StudyModificationModal from '@common/modal/StudyModificationModal.tsx';
import { useNewStudyModal } from '@/hooks/useNewStudyModal.ts';
import { Breadcrumbs, Button, Divider, Loader } from '@design-system-rte/react';
import { BreadcrumbItemProps } from '@design-system-rte/core/components/breadcrumbs/breadcrumbs.interface';

const StudyDetails = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const studyState = useStudy();
  const dispatch = useStudyDispatch();
  const { isModalOpen, toggleModal } = useNewStudyModal();
  const [isGenerating, setIsGenerating] = useState(false);
  const [reloadStudy, setReloadStudy] = useState(0);
  const [studyData, setStudyData] = useState<StudyDTO | null>(null);

  const headerItems: BreadcrumbItemProps[] = [
    {
      label: studyData?.project ?? '',
      link: `/project/${studyData?.projectId ?? ''}`,
    },
    {
      label: studyData?.name ?? '',
      link: '',
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
      dispatch?.({ type: STUDY_ACTION.SET_STUDY_HVDC, payload: studyUpdated.hvdc });
    };
    if (id != null) {
      void fetchStudyData(Number(id));
    }
  }, [reloadStudy, id, dispatch]);

  return !studyData ? (
    <div className="flex h-screen items-center justify-center">
      <p>{t('studyDetails.@loading')}</p>
    </div>
  ) : (
    <div className="flex min-h-0 flex-1 flex-col items-start gap-4 overflow-hidden p-3">
      <Breadcrumbs items={headerItems}></Breadcrumbs>
      <Divider />
      <div className="flex min-h-0 w-full flex-1 flex-col gap-2 overflow-hidden pb-3">
        <DetailsContent content={studyData} onClickButton={toggleModal} tagsList={studyData?.keywords} />
        <div className="flex flex-1 flex-col overflow-hidden">
          <StudyNavigationMenu studyData={studyData} />
          <div className="fixed bottom-0 right-0 w-full border-t bg-gray-w px-1 py-1.5">
            <div className="flex h-fit w-full items-center justify-end">
              {!studyState.AREA?.trajectories?.length && (
                <div className="mr-1 text-error-600">{t('studyDetails.@add_trajectories_message')}</div>
              )}
              {isGenerating ? (
                <Loader
                  appearance="brand"
                  label={t('studyDetails.@generating')}
                  labelPosition="right"
                  showLabel
                  size="medium"
                />
              ) : (
                <Button
                  label={t('studyDetails.@generate')}
                  onClick={() => studyData?.id && void handleGenerateStudy(studyData?.id)}
                  disabled={!studyState.AREA?.trajectories?.length || studyState.studyStatus === StudyStatus.GENERATED}
                  icon="check-circle"
                  iconPosition="right"
                  size="m"
                />
              )}
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
