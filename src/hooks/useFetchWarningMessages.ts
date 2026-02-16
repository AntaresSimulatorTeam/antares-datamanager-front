import { useEffect, useState } from 'react';
import { StudyState, WarningMessage } from '@/shared/types';
import { fetchWarningMessagesFromType } from '@/shared/services/warningService.ts';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { StudyStatus } from '@/shared/types/common/StudyStatus.type.ts';
import { buildDataWarningMessage } from '@/shared/utils/warningUtils.ts';
import { useStudy, useStudyDispatch } from '@/store/contexts/StudyContext.tsx';
import { STUDY_ACTION } from '@/shared/enum/study.ts';

export const useFetchWarningMessages = (studyId: number | null, type: TRAJECTORY_TYPE) => {
  const [warningMessages, setWarningMessages] = useState<WarningMessage[]>([]);
  const studyState = useStudy();
  const dispatch = useStudyDispatch();
  // TODO remove DSR when api ok
  const hasWarningMessage = type !== TRAJECTORY_TYPE.STS && type !== TRAJECTORY_TYPE.DSR;

  useEffect(() => {
    const fetchWarningMessages = async (id: number, trajectoryType: TRAJECTORY_TYPE, state: Partial<StudyState>) => {
      const isNotGenerated = state.studyStatus !== StudyStatus.GENERATED;
      const warningMessagesFromType: WarningMessage[] = hasWarningMessage
        ? []
        : await fetchWarningMessagesFromType(trajectoryType, id);
      try {
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
          setWarningMessages([...dataWarningMessageArea, ...dataWarningMessageLink]);
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
          setWarningMessages(
            buildDataWarningMessage(
              warningMessagesFromType.concat(warningParameters),
              trajectoryType,
              isNotGenerated,
              id,
              studyState.discardWarningMessage ?? null,
            ),
          );
        } else {
          setWarningMessages(
            buildDataWarningMessage(
              warningMessagesFromType,
              trajectoryType,
              isNotGenerated,
              id,
              studyState.discardWarningMessage ?? null,
            ),
          );
        }
      } finally {
        dispatch?.({ type: STUDY_ACTION.SKIP_MESSAGE, payload: { discardActionTriggered: false } });
      }
    };
    if (studyId != null && type && hasWarningMessage) {
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
