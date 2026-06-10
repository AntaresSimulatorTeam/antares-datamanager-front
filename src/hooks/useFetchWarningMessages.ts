import { useEffect, useState } from 'react';
import { DataWarningMessage, StudyState, WarningMessage } from '@/shared/types';
import { fetchWarningMessagesFromType } from '@/shared/services/warningService.ts';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { StudyStatus } from '@/shared/types/common/StudyStatus.type.ts';
import { buildDataWarningMessage } from '@/shared/utils/warningUtils.ts';
import { useStudy, useStudyDispatch } from '@/store/contexts/StudyContext.tsx';
import { STUDY_ACTION } from '@/shared/enum/study.ts';

export const useFetchWarningMessages = (studyId: number | null, type: TRAJECTORY_TYPE) => {
  const [warningMessages, setWarningMessages] = useState<
    { type: TRAJECTORY_TYPE; data: DataWarningMessage[] } | undefined
  >();
  const studyState = useStudy();
  const dispatch = useStudyDispatch();

  useEffect(() => {
    const fetchWarningMessages = async (
      id: number,
      trajectoryType: TRAJECTORY_TYPE,
      state: Partial<StudyState>,
    ): Promise<void> => {
      const isNotGenerated = state.studyStatus !== StudyStatus.GENERATED;
      const hasWarningMessage =
        type !== TRAJECTORY_TYPE.STS &&
        type !== TRAJECTORY_TYPE.DSR &&
        type !== TRAJECTORY_TYPE.RES_CAPACITY &&
        type !== TRAJECTORY_TYPE.RES_LOAD &&
        type !== TRAJECTORY_TYPE.HYDRO_SERIES &&
        type !== TRAJECTORY_TYPE.HYDRO_PSP;
      const warningMessagesFromType: WarningMessage[] = hasWarningMessage
        ? await fetchWarningMessagesFromType(trajectoryType, id)
        : [];
      try {
        let dataWarningMessages: DataWarningMessage[] = [];
        if (trajectoryType === TRAJECTORY_TYPE.AREA) {
          const dataWarningMessageArea = buildDataWarningMessage(
            warningMessagesFromType,
            type,
            isNotGenerated,
            id,
            studyState.discardWarningMessage ?? null,
          );
          const warningLink: WarningMessage[] = await fetchWarningMessagesFromType(TRAJECTORY_TYPE.LINK, id);
          const dataWarningMessageLink = buildDataWarningMessage(
            warningLink,
            TRAJECTORY_TYPE.LINK,
            isNotGenerated,
            id,
            studyState.discardWarningMessage ?? null,
          );
          dataWarningMessages = [...dataWarningMessageArea, ...dataWarningMessageLink];
        } else if (trajectoryType === TRAJECTORY_TYPE.THERMAL_CAPACITY) {
          const warningParameters: WarningMessage[] = (
            await Promise.all(
              [
                TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER,
                TRAJECTORY_TYPE.THERMAL_TECHNICAL_COMMON_PARAMETER,
                TRAJECTORY_TYPE.THERMAL_TECHNICAL_MODULATION_PARAMETER,
              ].map(async (thermalType: TRAJECTORY_TYPE) => await fetchWarningMessagesFromType(thermalType, id)),
            )
          ).flat();
          dataWarningMessages = buildDataWarningMessage(
            warningMessagesFromType.concat(warningParameters),
            trajectoryType,
            isNotGenerated,
            id,
            studyState.discardWarningMessage ?? null,
          );
        } else {
          dataWarningMessages =
            warningMessagesFromType.length > 0
              ? buildDataWarningMessage(
                  warningMessagesFromType,
                  trajectoryType,
                  isNotGenerated,
                  id,
                  studyState.discardWarningMessage ?? null,
                )
              : [];
        }
        setWarningMessages({ type: trajectoryType, data: dataWarningMessages });
      } finally {
        dispatch?.({ type: STUDY_ACTION.SKIP_MESSAGE, payload: { discardActionTriggered: false } });
      }
    };
    if (studyId != null && type) {
      void fetchWarningMessages(studyId, type, studyState);
    }
  }, [
    type,
    studyState[type]?.trajectories,
    studyState[TRAJECTORY_TYPE.LINK]?.trajectories,
    studyState[TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER]?.trajectories,
    studyState[TRAJECTORY_TYPE.THERMAL_TECHNICAL_MODULATION_PARAMETER]?.trajectories,
    studyId,
    studyState.discardActionTriggered,
  ]);

  return { warningMessages };
};
