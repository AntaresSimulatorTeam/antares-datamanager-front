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
      const promises = [configs[0], configs[1]]
        .filter(Boolean)
        .map(config => fetchTrajectories(id, config));

      const [firstResults, secondResults] = await Promise.all(promises);

      dispatch?.({
        type: STUDY_ACTION.ADD_TRAJECTORIES,
        payload: {
          ...(configs[0] && buildDispatchPayload(configs[0], firstResults)),
          ...(configs[1] && buildDispatchPayload(configs[1], secondResults)),
        },
      });

      let firstData: HypothesisRowData[] = [];
      if (configs[0]) {
        firstData = buildTableData(configs[0], firstResults, t, {hvdc: hvdcValue});
        firstData.length > 0 && setFirstTableData(firstData);
      }
      let secondData: HypothesisRowData[] = [];
      if (configs[1]) {
        secondData = buildTableData(configs[1], secondResults, t);
        secondData.length > 0 && setSecondTableData(secondData);
      }

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
    } catch(error) {
      // Silent handler
      console.error(error);
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
