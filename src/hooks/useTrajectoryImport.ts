import { Dispatch, SetStateAction, useCallback, useState } from 'react';
import { handleTrajectoryError } from '@/shared/services/hypothesisTableService.ts';
import { uploadTrajectory } from '@/shared/services/trajectoryService.ts';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { DropdownItemOption, FileInputStatus, HypothesisRowData, StudyActionType, StudyDTO } from '@/shared/types';
import { useTranslation } from 'react-i18next';
import { useUser } from '@/store/contexts/UserContext.tsx';
import { useTrajectoryAttach } from '@/hooks/useTrajectoryAttach.ts';
import { isBusinessError } from '@/shared/utils/errorUtils.ts';
import { ReadOnlyObject } from '@common/data/stdTable/types/readOnly.type';
import { HypothesisType } from '@/shared/types/HypothesisTable.ts';

export const useTrajectoryImport = (
  study: StudyDTO,
  dispatch: Dispatch<StudyActionType> | null
) => {
  const [fileStatus, setFileStatus] = useState<FileInputStatus>('empty');
  const [progress, setProgress] = useState<number>(0);
  const { t } = useTranslation();
  const { user } = useUser();

  const { attachTrajectory } = useTrajectoryAttach(study, dispatch);

  const importTrajectory = useCallback(
    async (
      setData: Dispatch<SetStateAction<HypothesisRowData[]>>,
      value?: DropdownItemOption,
      type?: TRAJECTORY_TYPE,
      indexArray?: number[],
      hypothesis?: HypothesisType,
      setReadOnly?: Dispatch<SetStateAction<ReadOnlyObject>>,
      setSecondTableReadOnly?: Dispatch<SetStateAction<ReadOnlyObject>>
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
            await attachTrajectory(type, indexArray, 'success', newTrajectory, setData, setReadOnly, setSecondTableReadOnly);
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
            { id: Number(value?.id), label: value?.label ?? '' },
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
