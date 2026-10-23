import { getStudyById, getStudyTrajectories } from '@/shared/services/studyService.ts';
import { useCallback, useEffect, useState } from 'react';
import { ReadOnlyObject } from '@common/data/stdTable/types/readOnly.type';
import { DbTrajectory, HypothesisRowData } from '@/shared/types';
import { useTranslation } from 'react-i18next';
import { useStudyDispatch } from '@/store/contexts/StudyContext.tsx';
import { HypothesisConfig, HypothesisTableOptions } from '@/shared/types/HypothesisTable.ts';
import { buildDispatchPayload, buildReadOnlyRow, buildTableData } from '@/shared/utils/trajectoryUtils.ts';
import { STUDY_ACTION } from '@/shared/enum/study.ts';
import { notifyAlert } from '@/shared/notification/notification.tsx';

const fetchTrajectoriesForConfig = (studyId: number, config: HypothesisConfig[]) =>
  Promise.all(config.map(({ type }) => getStudyTrajectories(studyId, type)));

const extractSecondConfigData = (secondConfig?: HypothesisConfig[]): HypothesisConfig[] =>
  secondConfig ? [secondConfig[0], secondConfig[1], ...(secondConfig[2]?.subRows ?? [])] : [];

const fetchStudyOptions = async (
  studyId: number,
  firstConfig?: HypothesisConfig[],
  secondConfig?: HypothesisConfig[],
) => {
  const studyOptions = firstConfig?.[1]?.options || secondConfig?.[1]?.options || {};
  if (Object.keys(studyOptions).length > 0) {
    const studyData = await getStudyById(studyId);
    return { hvdc: studyData.hvdc, recalculate: studyData.recalculate };
  }
  return {};
};

interface ReadOnlyParams {
  isStudyGenerated: boolean;
  firstResults?: DbTrajectory[][];
  secondConfig?: HypothesisConfig[];
}

const computeReadOnlyRows = ({
  isStudyGenerated,
  firstResults,
  secondConfig,
}: ReadOnlyParams): {
  firstReadOnly: ReadOnlyObject;
  secondReadOnly: ReadOnlyObject;
} => {
  if (isStudyGenerated) {
    return {
      firstReadOnly: buildReadOnlyRow(['0', '1']),
      secondReadOnly: secondConfig ? buildReadOnlyRow(['0', '1', '2.0', '2.1']) : {},
    };
  }

  const hasFirstResult = Boolean(firstResults?.[0]?.length);

  return {
    firstReadOnly: {
      0: false,
      1: !hasFirstResult,
    },
    secondReadOnly: secondConfig
      ? {
          '0': !hasFirstResult,
          '1': !hasFirstResult,
          '2.0': !hasFirstResult,
          '2.1': !hasFirstResult,
        }
      : {},
  };
};

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

  const refreshTrajectories = useCallback(async () => {
    if (studyId == null) return { firstTableData: [], secondTableData: [] };

      const firstConfig = configs?.[0];
      const secondConfig = configs?.[1];

      const { hvdc, recalculate } = await fetchStudyOptions(studyId, firstConfig, secondConfig);
      const secondConfigData = extractSecondConfigData(secondConfig);

      const promises = [firstConfig, secondConfigData]
        .filter(Boolean)
        .map((config) => fetchTrajectoriesForConfig(studyId, config));

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
        firstData = buildTableData(firstConfig, t, firstResults, { hvdc });
        if (firstData.length > 0) setFirstTableData(firstData);
      }

      let secondData: HypothesisRowData[] = [];
      if (secondConfig) {
        secondData = buildTableData(secondConfig, t, secondResults, { recalculate });
        if (secondData.length > 0) setSecondTableData(secondData);
      }

        const { firstReadOnly, secondReadOnly } = computeReadOnlyRows({
          isStudyGenerated,
          firstResults,
          secondConfig,
        });

        setFirstTableReadOnlyRow(firstReadOnly);
        if (secondConfig) {
          setSecondTableReadOnlyRow(secondReadOnly);
        }
    return { firstTableData: firstData, secondTableData: secondData };
  }, [configs, dispatch, isStudyGenerated, studyId, t]);

  useEffect(() => {
    void refreshTrajectories().catch((error: unknown) => {
      notifyAlert({
        message: t('flowbased.@associationsReloadError'),
        content: error instanceof Error ? error.message : String(error),
        type: 'error',
      });
    });
  }, [refreshTrajectories, t]);

  return options.withReadOnlyRow
    ? { firstTableData, firstTableReadOnlyRow, secondTableData, secondTableReadOnlyRow, refreshTrajectories }
    : { firstTableData, secondTableData, refreshTrajectories };
};
