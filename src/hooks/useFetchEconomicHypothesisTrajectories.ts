import { useEffect, useState } from 'react';
import { getStudyTrajectories } from '@/shared/services/studyService.ts';
import { TRAJECTORY_SELECTION_STATUS, TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { STUDY_ACTION } from '@/shared/enum/study.ts';
import { HypothesisRowData } from '@/shared/types';
import { useStudyDispatch } from '@/store/contexts/StudyContext.tsx';
import { useTranslation } from 'react-i18next';

export const useFetchEconomicHypothesisTrajectories = (isStudyGenerated: boolean, studyId?: number) => {
  const [hypothesisTrajectories, setHypothesisTrajectories] = useState<HypothesisRowData[]>([]);
  const dispatch = useStudyDispatch();
  const { t } = useTranslation();

  const getTrajectories = async (id: number) => {
    try {
      const [trajectoryCostResult, trajectoryEconomicResult] = await Promise.all([
        getStudyTrajectories(id, TRAJECTORY_TYPE.THERMAL_ECONOMIC_COST_PARAMETER),
        getStudyTrajectories(id, TRAJECTORY_TYPE.THERMAL_ECONOMIC_PARAMETER),
      ]);
      dispatch?.({
        type: STUDY_ACTION.ADD_TRAJECTORIES,
        payload: {
          ...(trajectoryCostResult?.length > 0 && {
            [TRAJECTORY_TYPE.THERMAL_ECONOMIC_COST_PARAMETER]: { trajectories: trajectoryCostResult },
          }),
          ...(trajectoryEconomicResult?.length > 0 && {
            [TRAJECTORY_TYPE.THERMAL_ECONOMIC_PARAMETER]: { trajectories: trajectoryEconomicResult },
          }),
        },
      });
      const trajectoryResult = [
        { label: t('thermal.@costs'), result: trajectoryCostResult },
        { label: t('thermal.@economics'), result: trajectoryEconomicResult },
      ];

      setHypothesisTrajectories(
        trajectoryResult.map(({ label, result }) => ({
          hypothesis: label,
          trajectory: result?.[0],
          status: result.length > 0 ? TRAJECTORY_SELECTION_STATUS.OK : TRAJECTORY_SELECTION_STATUS.MISSING,
        })),
      );
    } catch {
      //Silent handler
    }
  };

  useEffect(() => {
    if (studyId != null) {
      void getTrajectories(studyId);
    }
  }, [dispatch, isStudyGenerated, studyId, t]);

  return { hypothesisTrajectories };
};
