/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { RdsModal } from 'rte-design-system-react';
import { useTranslation } from 'react-i18next';
import KeywordsInput from '@/components/input/KeywordsInput.tsx';
import HorizonInput from '@/components/input/HorizonInput';
import { duplicateStudy, updateStudy } from '@/shared/services/studyService';
import { SelectDSOption, StudyDTO } from '@/shared/types';
import { useUser } from '@/store/contexts/UserContext.tsx';
import { notifyAlert, notifyToast } from '@/shared/notification/notification';
import { validateMaxLength } from '@/shared/utils/validateMaxTextLength';
import { MAX_STUDY_NAME_LENGTH } from '@/shared/const/studyConfig';
import { hasArrayChanged } from '@/shared/utils/arrayUtils.ts';
import { Button, Select, TextInput } from '@design-system-rte/react';
import { FieldInFormation } from '@common/base/FieldInFormation.tsx';
import { convertToOneYearHorizon } from '@/shared/utils/textUtils.ts';
import { fetchProjectsFromPartialName } from '@/shared/services/projectService.ts';

interface StudyCreationModalProps {
  isOpen?: boolean;
  onClose: () => void;
  study: StudyDTO;
  setReloadStudies?: React.Dispatch<React.SetStateAction<number>>;
  isDuplicateMode?: boolean;
}

const StudyModificationModal: React.FC<StudyCreationModalProps> = ({
  onClose,
  study,
  setReloadStudies,
  isDuplicateMode,
}) => {
  const { t } = useTranslation();
  const { user } = useUser();
  const baseStudyName = study.name.substring(0, study.name.lastIndexOf('_'));
  const [studyName, setStudyName] = useState<string>(baseStudyName);
  const [project, setProject] = useState<SelectDSOption>({
    id: Number(study.projectId),
    label: study.project,
    value: study.project,
  });
  const [projects, setProjects] = useState<SelectDSOption[]>([]);
  const [keywords, setKeywords] = useState<string[]>(study?.keywords || []);
  const [horizon, setHorizon] = useState<string>(() => convertToOneYearHorizon(study.horizon));
  const [isFormValid, setIsFormValid] = useState(false);
  const [isHorizonValid, setIsHorizonValid] = useState(false);
  const [studyErrorMessage, setStudyErrorMessage] = useState<string>('');
  const [horizonErrorMessage, setHorizonErrorMessage] = useState<string>('');

  const resetErrorMessage = () => {
    setStudyErrorMessage('');
    setHorizonErrorMessage('');
  };

  const updateStudyHandler = useCallback(async () => {
    resetErrorMessage();
    const studyData = {
      ...study,
      createdBy: user?.profile.sub,
      name: studyName,
      keywords,
      project: project.label,
      projectId: project?.id?.toString() || '',
      horizon,
    };

    try {
      isDuplicateMode ? await duplicateStudy(studyData) : await updateStudy(studyData, study.id);
      setReloadStudies?.((prev) => prev + 1);
      notifyToast({
        type: 'success',
        message: `Study ${isDuplicateMode ? 'duplicated' : 'updated'} successfully`,
      });
      onClose();
    } catch (error) {
      const errorMessages = (error as Error)?.message;
      if (errorMessages?.includes('study')) {
        setStudyErrorMessage(errorMessages);
        setIsFormValid(false);
      } else if (errorMessages?.includes('horizon')) {
        setHorizonErrorMessage(errorMessages);
      }
    }
  }, [
    horizon,
    isDuplicateMode,
    keywords,
    onClose,
    project?.id,
    project.label,
    setReloadStudies,
    study,
    studyName,
    user?.profile.sub,
  ]);

  useEffect(() => {
    const loadProjects = async (valueLabel?: string) => {
      try {
        const projectList = await fetchProjectsFromPartialName(valueLabel ?? '');
        const projectOptions = projectList.map(({ name, id }) => ({
          id: Number(id),
          label: name,
          value: name,
        }));
        setProjects(projectOptions);
      } catch (error) {
        notifyAlert({
          icon: 'check',
          message: t('project.@fetch_failed'),
          content: (error as Error).message,
          type: 'error',
          filledIcon: true,
        });
      }
    };
    void loadProjects();
  }, [t]);

  useEffect(() => {
    const validateForm = () => {
      const studyNameChanged = studyName.trim() !== baseStudyName.trim();
      const projectNameChanged = study.project.trim() !== project?.label.trim();
      const keywordsChanged = hasArrayChanged(study.keywords, keywords);

      isDuplicateMode
        ? setIsFormValid(isHorizonValid || !!project?.value || studyNameChanged)
        : setIsFormValid(studyNameChanged || projectNameChanged || keywordsChanged);
    };
    validateForm();
  }, [study, studyName, project, horizon, keywords, isHorizonValid, isDuplicateMode, baseStudyName]);

  const handleStudyNameChange = (value: string) => {
    resetErrorMessage();
    if (validateMaxLength(value, MAX_STUDY_NAME_LENGTH)) {
      setStudyName(value || '');
    }
  };

  return (
    <RdsModal size="small">
      <RdsModal.Title onClose={onClose}>
        {isDuplicateMode ? t('home.@duplicate_study') : t('studyModal.@update_study')}
      </RdsModal.Title>
      <RdsModal.Content>
        <div className="flex flex-col items-start gap-4">
          <FieldInFormation />
          <div className="flex w-full items-center justify-start gap-4">
            <div className="flex w-1/2">
              <TextInput
                id="text-input-study-modify-name"
                value={studyName}
                label={t('modal.@input_name')}
                onChange={handleStudyNameChange}
                required
                maxLength={75}
                error={!!studyErrorMessage}
                assistiveTextLabel={studyErrorMessage}
              />
            </div>
            <div className="column flex w-1/2">
              <Select
                id="project-select"
                value={project?.value ?? ''}
                onChange={(value: string) => {
                  const selectedProject = projects.find((projectOption) => projectOption.value === value);
                  if (selectedProject) {
                    setProject(selectedProject);
                  }
                }}
                label={t('page.@project')}
                options={projects}
                multiple={false}
                required={true}
                width={280}
              />
            </div>
          </div>
          <div className="flex w-1/2">
            <HorizonInput
              horizon={horizon}
              onChange={setHorizon}
              onValidChange={setIsHorizonValid}
              required
              disabled={!isDuplicateMode}
              customErrorMessage={isDuplicateMode && horizonErrorMessage ? horizonErrorMessage : ''}
            />
          </div>
          <KeywordsInput
            keywords={keywords}
            setKeywords={setKeywords}
            maxNbKeywords={6}
            maxNbCharacters={15}
            minNbCharacters={1}
          />
        </div>
      </RdsModal.Content>
      <RdsModal.Footer>
        <Button label={t('components.quickAccess.@cancel')} onClick={onClose} variant="text" />
        <Button
          icon={isDuplicateMode ? 'copy' : 'edit'}
          label={isDuplicateMode ? t('study.@duplicate') : t('modal.@button_update')}
          onClick={() => void updateStudyHandler()}
          variant="primary"
          disabled={!isFormValid}
        />
      </RdsModal.Footer>
    </RdsModal>
  );
};

export default StudyModificationModal;
