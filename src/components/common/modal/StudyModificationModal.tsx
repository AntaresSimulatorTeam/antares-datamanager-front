/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import React, { useState } from 'react';
import { RdsModal } from 'rte-design-system-react';
import { useTranslation } from 'react-i18next';
import KeywordsInput from '@/components/input/KeywordsInput.tsx';
import { SelectDSOption, StudyDTO } from '@/shared/types';
import { useUser } from '@/store/contexts/UserContext.tsx';
import { notifyToast } from '@/shared/notification/notification';
import {
  MAX_HORIZON_NUMBER,
  MAX_KEYWORD_LENGTH,
  MAX_KEYWORD_NUMBER,
  MAX_STUDY_NAME_LENGTH,
} from '@/shared/const/studyConfig';
import SelectInput from '@/components/input/SelectInput.tsx';
import { Button, TextInput } from '@design-system-rte/react';
import { FieldInFormation } from '@common/base/FieldInFormation.tsx';
import { validateFormInputs } from '@/shared/utils/validateFormInput.ts';
import { useFetchProjectOptions } from '@/hooks/useFetchProjectOptions.ts';
import { useStudyModification } from '@/hooks/useStudyModification.ts';
import { getStudyName, validateHorizon } from '@/shared/utils/textUtils.ts';

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
  isDuplicateMode = false,
}) => {
  const { t } = useTranslation();
  const { user } = useUser();
  const { projects } = useFetchProjectOptions();

  const [studyName, setStudyName] = useState<string>(getStudyName(study.name));
  const [studyNameError, setStudyNameError] = useState<string>('');
  const [project, setProject] = useState<SelectDSOption>({
    id: Number(study.projectId),
    label: study.project,
    value: study.project,
  });
  const [horizon, setHorizon] = useState<string>(() => {
    const rawHorizon = study?.horizon || '';
    const years = rawHorizon.match(/\d{4}/g)?.map(Number) || [];
    const maxYear = years.length ? Math.max(...years) : '';
    return maxYear.toString();
  });
  const [horizonError, setHorizonError] = useState<string>('');
  const [keywords, setKeywords] = useState<string[]>(study?.keywords || []);

  const { confirmUpdate } = useStudyModification(
    () => {
      setReloadStudies?.((prev) => prev + 1);
      notifyToast({
        type: 'success',
        message: `Study ${isDuplicateMode ? 'duplicated' : 'updated'} successfully`,
      });
      onClose();
    },
    (message) => {
      if (message?.includes(t('studyDetails.@duplicateModalStudyError'))) {
        setStudyNameError(message);
      } else if (message?.includes(t('horizonInput.@validYearError'))) {
        setHorizonError(message);
      }
    },
  );

  return (
    <RdsModal size="small">
      <RdsModal.Title onClose={onClose}>
        {isDuplicateMode ? t('home.@duplicate_study') : t('studyModal.@update_study')}
      </RdsModal.Title>
      <RdsModal.Content>
        <div className="flex w-full flex-col gap-4 self-stretch">
          <div className="flex flex-col items-start justify-start gap-4">
            <FieldInFormation />
            <div className="flex w-full items-center justify-start gap-4">
              <div className="flex w-1/2">
                <TextInput
                  id="text-input-study-modify-name"
                  value={studyName}
                  label={t('modal.@input_name')}
                  onChange={(value: string) => {
                    studyNameError && setStudyNameError('');
                    setStudyName(value ?? '');
                  }}
                  required
                  maxLength={MAX_STUDY_NAME_LENGTH}
                  showCounter={true}
                  error={!!studyNameError}
                  assistiveTextLabel={studyNameError}
                  assistiveAppearance={studyNameError ? 'error' : 'description'}
                />
              </div>
              <div className="flex w-1/2">
                <SelectInput options={projects} required={true} valueSelected={project} onChange={setProject} />
              </div>
            </div>
            <div className="flex w-1/4">
              <TextInput
                id="text-input-horizon"
                label={t('home.@horizon')}
                value={horizon}
                required
                onChange={(value: string) => {
                  horizonError && setHorizonError('');
                  setHorizon(value ?? '');
                }}
                onBlur={() => validateHorizon(setHorizonError, t, horizon, false)}
                maxLength={MAX_HORIZON_NUMBER}
                showCounter={true}
                error={!!horizonError}
                assistiveTextLabel={horizonError || t('components.horizonInput.@assistiveTextForYear')}
                assistiveAppearance={horizonError ? 'error' : 'description'}
                disabled={!isDuplicateMode}
                placeholder={!isDuplicateMode ? horizon : ''}
              />
            </div>
            <KeywordsInput
              keywords={keywords}
              setKeywords={setKeywords}
              maxNbKeywords={MAX_KEYWORD_NUMBER}
              maxNbCharacters={MAX_KEYWORD_LENGTH}
              minNbCharacters={1}
            />
          </div>
        </div>
      </RdsModal.Content>
      <RdsModal.Footer>
        <Button label={t('components.quickAccess.@cancel')} onClick={onClose} variant="text" />
        <Button
          icon={isDuplicateMode ? 'copy' : 'edit'}
          label={isDuplicateMode ? t('study.@duplicate') : t('modal.@button_update')}
          onClick={() => {
            if (
              validateFormInputs(
                isDuplicateMode,
                study,
                studyName,
                project.value,
                keywords,
                horizon,
                setHorizonError,
                t,
              )
            ) {
              const studyData = {
                ...study,
                createdBy: user?.profile.sub,
                name: studyName,
                keywords,
                project: project.label,
                projectId: project?.id?.toString() || '',
                horizon,
              };

              void confirmUpdate(study.id, studyData, isDuplicateMode);
            }
          }}
          variant="primary"
        />
      </RdsModal.Footer>
    </RdsModal>
  );
};

export default StudyModificationModal;
