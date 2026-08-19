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
  isStudyGenerated: boolean,
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
      let recalculateValue: boolean | undefined;
      const firstConfig = configs?.[0];
      const secondConfig = configs?.[1];
      const studyOptions = firstConfig?.[1].options || secondConfig?.[1].options || {};
      if (Object.keys(studyOptions)?.length > 0 && id != null) {
        const studyData = await getStudyById(id);
        hvdcValue = studyData.hvdc;
        recalculateValue = studyData.recalculate;
      }
      const promises = [firstConfig, secondConfig]
        .filter(Boolean)
        .map(config => fetchTrajectories(id, config));

      const [firstResults, secondResults] = await Promise.all(promises);

      dispatch?.({
        type: STUDY_ACTION.ADD_TRAJECTORIES,
        payload: {
          ...(firstConfig && buildDispatchPayload(firstConfig, firstResults)),
          ...(secondConfig && buildDispatchPayload(secondConfig, secondResults)),
        },
      });

      let firstData: HypothesisRowData[] = [];
      if (firstConfig) {
        firstData = buildTableData(firstConfig, t, firstResults, {hvdc: hvdcValue});
        firstData.length > 0 && setFirstTableData(firstData);
      }
      let secondData: HypothesisRowData[] = [];
      if (secondConfig) {
        secondData = buildTableData(secondConfig, t, secondResults, {recalculate: recalculateValue});
        secondData.length > 0 && setSecondTableData(secondData);
      }

      if (options.withReadOnlyRow && !isStudyGenerated) {
        setFirstTableReadOnlyRow({
          0: false,
          1: !firstResults[0]?.length,
        });
        if (secondConfig) {
          setSecondTableReadOnlyRow({
            '0': !firstResults[0]?.length,
            '1': !firstResults[0]?.length,
            '2.0': !firstResults[0]?.length,
            '2.1': !firstResults[0]?.length,
          });
        }
      } else if (isStudyGenerated) {
        setFirstTableReadOnlyRow(buildReadOnlyRow(['0', '1']));
        if (secondConfig) {
          setSecondTableReadOnlyRow(buildReadOnlyRow(['0', '1', '2.0', '2.1']));
        }
      }
    } catch(error) {
      console.log("================= error", error)
    }
  };

  useEffect(() => {
    if (studyId != null) {
      void getTrajectories(studyId);
    }
  }, [studyId]);

  return options.withReadOnlyRow || isStudyGenerated
    ? { firstTableData, firstTableReadOnlyRow, secondTableData, secondTableReadOnlyRow }
    : { firstTableData, secondTableData };
};
