import { getStudyById, getStudyTrajectories } from '@/shared/services/studyService.ts';
import { useEffect, useState } from 'react';
import { ReadOnlyObject } from '@common/data/stdTable/types/readOnly.type';
import { HypothesisRowData } from '@/shared/types';
import { useTranslation } from 'react-i18next';
import { useStudyDispatch } from '@/store/contexts/StudyContext.tsx';
import { HypothesisConfig, HypothesisTableOptions } from '@/shared/types/HypothesisTable.ts';
import { buildDispatchPayload, buildReadOnlyRow, buildTableData } from '@/shared/utils/trajectoryUtils.ts';
import { STUDY_ACTION } from '@/shared/enum/study.ts';

export const useFetchFixHypothesisTrajectories = (
  configs: HypothesisConfig[][],
  options: HypothesisTableOptions,
  studyId?: number,
) => {
  const [firstTableData, setFirstTableData] = useState<HypothesisRowData[]>([]);
  const [firstTableReadOnlyRow, setFirstTableReadOnlyRow] = useState<ReadOnlyObject>({});
  const [secondTableData, setSecondTableData] = useState<HypothesisRowData[]>([]);
  const [secondTableReadOnlyRow, setSecondTableReadOnlyRow] = useState<ReadOnlyObject>({});
  const dispatch = useStudyDispatch();
  const { t } = useTranslation();

  const fetchTrajectories = async (id: number, config: (typeof configs)[number]) =>
    Promise.all(config.map(({ type }) => getStudyTrajectories(id, type)));

  const getTrajectories = async (id: number) => {
    try {
      let hvdcValue: boolean | undefined;
      if (configs[0][1].hasHvdcOption && id != null) {
        const studyData = await getStudyById(id);
        hvdcValue = studyData.hvdc;
      }
      const [firstResults, secondResults] = await Promise.all([
        fetchTrajectories(id, configs[0]),
        fetchTrajectories(id, configs[1]),
      ]);

      const results = await Promise.all(configs.map((cfg) => getStudyTrajectories(id, cfg.type)));

      dispatch?.({
        type: STUDY_ACTION.ADD_TRAJECTORIES,
        payload: {
          ...buildDispatchPayload(configs[0], firstResults),
          ...buildDispatchPayload(configs[1], secondResults),
        },
      });

      const firstData = buildTableData(configs[0], firstResults, t);
      const secondData = buildTableData(configs[1], secondResults, t);

      setFirstTableData(firstData);
      setSecondTableData(secondData);

      if (options.withReadOnlyRow && !options.isStudyGenerated) {
        setFirstTableReadOnlyRow({
          0: false,
          1: !firstResults[0]?.length || (!firstResults[1]?.length && options.isStudyGenerated),
        });

        setSecondTableReadOnlyRow({
          0: !firstResults[0]?.length || (!!secondResults[0]?.length && options.isStudyGenerated),
          1: !firstResults[0]?.length || (!!secondResults[1]?.length && options.isStudyGenerated),
        });
      } else if (options.isStudyGenerated) {
        setFirstTableReadOnlyRow(buildReadOnlyRow([...firstData.keys()]));
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
    ? { firstTableData, firstTableReadOnlyRow, secondTableData, secondTableReadOnlyRow }
    : { firstTableData };
};
