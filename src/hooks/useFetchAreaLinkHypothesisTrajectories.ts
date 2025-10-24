import { useEffect, useState } from 'react';
import { getStudyTrajectories } from '@/shared/services/studyService.ts';
import { TRAJECTORY_SELECTION_STATUS, TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { STUDY_ACTION } from '@/shared/enum/study.ts';
import { HypothesisRowData } from '@/shared/types';
import { ReadOnlyObject } from '@common/data/stdTable/types/readOnly.type';
import { useStudyDispatch } from '@/store/contexts/StudyContext.tsx';
import { useTranslation } from 'react-i18next';

export const useFetchAreaLinkHypothesisTrajectories = (isStudyGenerated: boolean, studyId?: number) => {
  const [hypothesisTrajectories, setHypothesisTrajectories] = useState<HypothesisRowData[]>([]);
  const [readOnlyRow, setReadOnlyRow] = useState<ReadOnlyObject>({});
  const dispatch = useStudyDispatch();
  const { t } = useTranslation();

  const getTrajectories = async (id: number) => {
    try {
      const [trajectoryAreaResult, trajectoryLinkResult] = await Promise.all([
        getStudyTrajectories(id, TRAJECTORY_TYPE.AREA),
        getStudyTrajectories(id, TRAJECTORY_TYPE.LINK),
      ]);
      dispatch?.({
        type: STUDY_ACTION.ADD_TRAJECTORIES,
        payload: {
          ...(trajectoryAreaResult && { [TRAJECTORY_TYPE.AREA]: { trajectories: trajectoryAreaResult } }),
          ...(trajectoryLinkResult && { [TRAJECTORY_TYPE.LINK]: { trajectories: trajectoryLinkResult } }),
        },
      });
      const trajectoryResult = [
        { label: t('studyDetails.@areas'), result: trajectoryAreaResult },
        { label: t('studyDetails.@links'), result: trajectoryLinkResult },
      ];

      setHypothesisTrajectories(
        trajectoryResult.map(({ label, result }) => ({
          hypothesis: label,
          trajectory: result?.[0],
          status: result.length > 0 ? TRAJECTORY_SELECTION_STATUS.OK : TRAJECTORY_SELECTION_STATUS.MISSING,
        })),
      );
      setReadOnlyRow({
        '0': false,
        '1': !trajectoryAreaResult?.length || (!trajectoryLinkResult?.length && isStudyGenerated),
      });
    } catch {
      //Silent handler
    }
  };

  useEffect(() => {
    if (studyId != null) {
      void getTrajectories(studyId);
    }
  }, [dispatch, isStudyGenerated, studyId, t]);

  return { hypothesisTrajectories, readOnlyRow };
};
