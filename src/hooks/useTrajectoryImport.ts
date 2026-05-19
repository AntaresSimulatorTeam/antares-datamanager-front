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
  TechnologyType,
} from '@/shared/types';
import { useTranslation } from 'react-i18next';
import { useUser } from '@/store/contexts/UserContext.tsx';
import { useTrajectoryAttach } from '@/hooks/useTrajectoryAttach.ts';
import { isBusinessError } from '@/shared/utils/errorUtils.ts';
import { ReadOnlyObject } from '@common/data/stdTable/types/readOnly.type';
import { getTypeToImport } from '@/shared/helpers/hypothesisTableHelper.ts';

export const useTrajectoryImport = (
  study: StudyDTO,
  studyState: Partial<StudyState>,
  dispatch: Dispatch<StudyActionType> | null,
  setReadOnly?: Dispatch<SetStateAction<ReadOnlyObject>>,
) => {
  const [fileStatus, setFileStatus] = useState<FileInputStatus>('empty');
  const [progress, setProgress] = useState<number>(0);
  const { t } = useTranslation();
  const { user } = useUser();

  const { attachTrajectory } = useTrajectoryAttach(study, studyState, dispatch, setReadOnly);

  const importTrajectory = useCallback(
    async (
      type: TRAJECTORY_TYPE,
      value: SelectOption,
      rowIdSelected: string,
      data: HypothesisRowData[],
      setData: Dispatch<SetStateAction<HypothesisRowData[]>>,
      options?: TechnologyType[],
    ) => {
      const indexArray = rowIdSelected.split('.').map(Number);
      const hypothesis = data[indexArray[0]]?.hypothesis;
      let subArea = indexArray?.length > 1 ? data[indexArray[0]]?.subRows?.[indexArray[1]]?.hypothesis : undefined;
      const option = options ? options.find((opt) => opt.label === subArea) : null;
      if (option) {
        subArea = option.code;
      }
      setFileStatus('loading');
      const typeToUse = getTypeToImport(type, rowIdSelected, data);
      try {
        const newTrajectory = await uploadTrajectory(
          typeToUse,
          value.label,
          study?.horizon,
          study?.id,
          hypothesis === OTHER_AREAS_LABEL ? OTHER_AREAS : hypothesis,
          (progressValue: number) => {
            setProgress(+progressValue.toFixed(0));
          },
          false, //TODO: should be configurable
          subArea === OTHER_AREAS_LABEL ? OTHER_AREAS : subArea,
        );

        setFileStatus('success');

        if (newTrajectory.id != null) {
          await attachTrajectory(typeToUse, indexArray, 'success', newTrajectory, setData);
        }
      } catch (error) {
        setFileStatus('error');
        if (isBusinessError(error)) {
          const message = t('studyDetails.@notificationAlert', {
            studyName: study?.name,
            trajectoryName: value.label,
            trajectoryType: subArea ?? hypothesis,
          });
          handleTrajectoryError(
            typeToUse,
            indexArray,
            { id: value.id, label: value.label },
            subArea ?? hypothesis,
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
