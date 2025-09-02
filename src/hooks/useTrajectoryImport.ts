import { Dispatch, SetStateAction, useCallback, useState } from 'react';
import { handleTrajectoryError } from '@/shared/services/hypothesisTableService.ts';
import { uploadTrajectory } from '@/shared/services/trajectoryService.ts';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { OTHER_AREAS, OTHER_AREAS_LABEL } from '@/shared/const/studyConfig.ts';
import {
  FileInputStatus,
  HypothesisRowData,
  SelectOption,
  StudyActionType,
  StudyDTO,
  StudyState,
} from '@/shared/types';
import { useTranslation } from 'react-i18next';
import { useUser } from '@/store/contexts/UserContext.tsx';
import { useTrajectoryAttach } from '@/hooks/useTrajectoryAttach.ts';
import { isBusinessError } from '@/shared/utils/errorUtils.ts';

export const useTrajectoryImport = (
  study: StudyDTO,
  studyState: Partial<StudyState>,
  dispatch: Dispatch<StudyActionType> | null,
  setData: Dispatch<SetStateAction<HypothesisRowData[]>>,
) => {
  const [fileStatus, setFileStatus] = useState<FileInputStatus>('empty');
  const [progress, setProgress] = useState<number>(0);
  const { t } = useTranslation();
  const { user } = useUser();

  const { attachTrajectory } = useTrajectoryAttach(study, studyState, dispatch, setData);

  const importTrajectory = useCallback(
    async (type: TRAJECTORY_TYPE, value: SelectOption, indexArray: number[], data: HypothesisRowData[]) => {
      const hypothesis = data[indexArray[0]]?.hypothesis;
      const technology = indexArray?.length > 1 ? data[indexArray[0]]?.subRows?.[indexArray[1]]?.hypothesis : undefined;
      setFileStatus('loading');
      try {
        const newTrajectory = await uploadTrajectory(
          type,
          value.label,
          study.horizon,
          study.id,
          hypothesis === OTHER_AREAS_LABEL ? OTHER_AREAS : hypothesis,
          (progressValue: number) => {
            setProgress(+progressValue.toFixed(0));
          },
          false, //TODO: should be configurable
          technology,
        );

        setFileStatus('success');

        if (newTrajectory.id != null) {
          await attachTrajectory(type, indexArray, 'success', newTrajectory);
        }
      } catch (error) {
        setFileStatus('error');
        if (isBusinessError(error)) {
          const message = t('studyDetails.@notificationAlert', {
            studyName: study.name,
            trajectoryName: value.label,
            trajectoryType: technology ?? hypothesis,
          });
          handleTrajectoryError(
            type,
            indexArray,
            { id: value.id, label: value.label },
            technology ?? hypothesis,
            user?.profile?.sub ?? '',
            setData,
            { message, content: error.antaresErrorMessage },
          );
        }
      }
    },
    [study.horizon, study.id, study?.name, attachTrajectory, t, user?.profile?.sub, setData],
  );

  return {
    fileStatus,
    progress,
    importTrajectory,
  };
};
