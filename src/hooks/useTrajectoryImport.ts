import { Dispatch, SetStateAction, useCallback, useState } from 'react';
import { handleTrajectoryError } from '@/shared/services/hypothesisTableService.ts';
import { uploadTrajectory } from '@/shared/services/trajectoryService.ts';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
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
import { ReadOnlyObject } from '@common/data/stdTable/types/readOnly.type';
import { HypothesisType } from '@/shared/types/HypothesisTable.ts';

export const useTrajectoryImport = (
  study: StudyDTO,
  studyState: Partial<StudyState>,
  dispatch: Dispatch<StudyActionType> | null,
  setReadOnly?: Dispatch<SetStateAction<ReadOnlyObject>>,
  setSecondTableReadOnly?: Dispatch<SetStateAction<ReadOnlyObject>>
) => {
  const [fileStatus, setFileStatus] = useState<FileInputStatus>('empty');
  const [progress, setProgress] = useState<number>(0);
  const { t } = useTranslation();
  const { user } = useUser();

  const { attachTrajectory } = useTrajectoryAttach(study, studyState, dispatch, setReadOnly, setSecondTableReadOnly);

  const importTrajectory = useCallback(
    async (
      setData: Dispatch<SetStateAction<HypothesisRowData[]>>,
      value?: SelectOption,
      type?: TRAJECTORY_TYPE,
      indexArray?: number[],
      hypothesis?: HypothesisType,
    ) => {
      setFileStatus('loading');

      try {
        if (type) {
          const newTrajectory = await uploadTrajectory(
            study?.horizon,
            study?.id,
            type,
            value?.value,
            hypothesis?.area,
            (progressValue: number) => {
              setProgress(+progressValue.toFixed(0));
            },
            false, //TODO: should be configurable
            hypothesis?.technology,
          );

          setFileStatus('success');

          if (newTrajectory.id != null && !!indexArray?.length) {
            await attachTrajectory(type, indexArray, 'success', newTrajectory, setData);
          }
        }
      } catch (error) {
        setFileStatus('error');
        if (isBusinessError(error) && type && !!indexArray?.length) {
          const message = t('studyDetails.@notificationAlert', {
            studyName: study?.name,
            trajectoryName: value?.label ?? '',
            trajectoryType: hypothesis?.technology ?? hypothesis?.area,
          });

          handleTrajectoryError(
            type,
            indexArray,
            { id: value?.id, label: value?.label ?? '' },
            hypothesis?.technology ?? hypothesis?.area ?? '',
            user?.profile?.sub ?? '',
            setData,
            { message, content: error.antaresErrorMessage },
          );
        }
      }
    },
    [study?.horizon, study?.id, study?.name, attachTrajectory, t, user?.profile?.sub],
  );

  return {
    fileStatus,
    progress,
    importTrajectory,
  };
};
