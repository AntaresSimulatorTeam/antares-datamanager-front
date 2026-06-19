import { getStudyTrajectories } from '@/shared/services/studyService.ts';
import { useEffect, useState } from 'react';
import { ReadOnlyObject } from '@common/data/stdTable/types/readOnly.type';
import { DbTrajectory, HypothesisRowData } from '@/shared/types';
import { useTranslation } from 'react-i18next';
import { useStudyDispatch } from '@/store/contexts/StudyContext.tsx';
import { STUDY_ACTION } from '@/shared/enum/study.ts';
import { TRAJECTORY_SELECTION_STATUS } from '@/shared/enum/trajectory.ts';
import { HypothesisConfig, HypothesisTableOptions } from '@/shared/types/HypothesisTable.ts';
import { buildReadOnlyRow } from '@/shared/utils/trajectoryUtils.ts';

export const useFetchFixHypothesisTrajectories = (
  configs: HypothesisConfig[],
  options: HypothesisTableOptions,
  studyId?: number,
) => {
  const [hypothesisTrajectories, setHypothesisTrajectories] = useState<HypothesisRowData[]>([]);
  const [readOnlyRow, setReadOnlyRow] = useState<ReadOnlyObject>({});
  const dispatch = useStudyDispatch();
  const { t } = useTranslation();

  const getTrajectories = async (id: number) => {
    try {
      const results = await Promise.all(configs.map((cfg) => getStudyTrajectories(id, cfg.type)));

      // Dispatch
      dispatch?.({
        type: STUDY_ACTION.ADD_TRAJECTORIES,
        payload: configs.reduce(
          (acc, cfg, idx) => {
            const res = results[idx];
            if (res?.length > 0) {
              acc[cfg.type] = { trajectories: res };
            }
            return acc;
          },
          {} as Record<string, { trajectories: DbTrajectory[] }>,
        ),
      });

      // Hypothesis rows
      const dataTable: { hvdc?: boolean; label: string; result: DbTrajectory[] }[] = configs.map((cfg, idx) => ({
        label: t(cfg.labelKey),
        result: results[idx],
        ...(cfg?.hvdc != null && { hvdc: cfg.hvdc }),
      }));

      const dataTrajectories = dataTable.map((data) => ({
        hypothesis: data?.label,
        trajectory: data?.result?.[0],
        status: data?.result.length > 0 ? TRAJECTORY_SELECTION_STATUS.OK : TRAJECTORY_SELECTION_STATUS.MISSING,
        ...(data.hvdc != null && { hvdc: data.hvdc }),
      }));
      setHypothesisTrajectories(dataTrajectories);

      if (options.withReadOnlyRow) {
        setReadOnlyRow({
          '0': false,
          '1': !results[0]?.length || (!results[1]?.length && options.isStudyGenerated),
        });
      } else if (options.isStudyGenerated) {
        const indexes = [...dataTrajectories.keys()];
        const onlyRows = buildReadOnlyRow(indexes);
        setReadOnlyRow(onlyRows);
      }
    } catch {
      // Silent handler
    }
  };

  useEffect(() => {
    if (studyId != null) {
      void getTrajectories(studyId);
    }
  }, [studyId]);

  return options.withReadOnlyRow || options.isStudyGenerated
    ? { hypothesisTrajectories, readOnlyRow }
    : { hypothesisTrajectories };
};
