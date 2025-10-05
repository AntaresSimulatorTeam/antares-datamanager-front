import { useEffect, useState } from 'react';
import { StudyState, WarningMessage } from '@/shared/types';
import { fetchWarningMessagesFromType } from '@/shared/services/warningService.ts';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { StudyStatus } from '@/shared/types/common/StudyStatus.type.ts';
import { buildDataWarningMessage } from '@/shared/utils/warningUtils.ts';

export const useFetchWarningMessages = (studyId: number, type: TRAJECTORY_TYPE, studyState: Partial<StudyState>) => {
  const [warningMessages, setWarningMessages] = useState<WarningMessage[]>([]);

  useEffect(() => {
    const fetchWarningMessages = async (id: number, trajectoryType: TRAJECTORY_TYPE, state: Partial<StudyState>) => {
      const warningMessagesFromType: WarningMessage[] = await fetchWarningMessagesFromType(trajectoryType, id);
      const isNotGenerated = state.studyStatus !== StudyStatus.GENERATED;

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
        setWarningMessages(dataWarningMessageArea.concat(dataWarningMessageLink));
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
    };
    if (studyId != null && type) {
      void fetchWarningMessages(studyId, type, studyState);
    }
  }, [type, studyState[type]?.trajectories, studyState[TRAJECTORY_TYPE.LINK]?.trajectories, studyId]);

  return { warningMessages };
};
