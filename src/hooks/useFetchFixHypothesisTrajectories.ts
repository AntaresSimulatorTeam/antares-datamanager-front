import { getStudyById, getStudyTrajectories } from '@/shared/services/studyService.ts';
import { useEffect, useState } from 'react';
import { ReadOnlyObject } from '@common/data/stdTable/types/readOnly.type';
import { DbTrajectory, HypothesisRowData } from '@/shared/types';
import { useTranslation } from 'react-i18next';
import { useStudyDispatch } from '@/store/contexts/StudyContext.tsx';
import { HypothesisConfig, HypothesisTableOptions } from '@/shared/types/HypothesisTable.ts';
import { buildDispatchPayload, buildReadOnlyRow, buildTableData } from '@/shared/utils/trajectoryUtils.ts';
import { STUDY_ACTION } from '@/shared/enum/study.ts';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { useFetchAreas } from '@/hooks/useFetchAreas.ts';

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
  firstConfig?: HypothesisConfig[];
  secondConfig?: HypothesisConfig[];
  isFlowbasedAllowed: (id: number) => Promise<boolean | undefined>;
}

const computeReadOnlyRows = async ({
  isStudyGenerated,
  firstResults,
  firstConfig,
  secondConfig,
  isFlowbasedAllowed,
}: ReadOnlyParams): Promise<{
  firstReadOnly: ReadOnlyObject;
  secondReadOnly: ReadOnlyObject;
}> => {
  if (isStudyGenerated) {
    return {
      firstReadOnly: buildReadOnlyRow(['0', '1']),
      secondReadOnly: secondConfig ? buildReadOnlyRow(['0', '1', '2.0', '2.1']) : {},
    };
  }

  const hasFirstResult = Boolean(firstResults?.[0]?.length);
  let isFlowbasedDisabled = !hasFirstResult;

  const firstTrajectoryId = firstResults?.[0]?.[0]?.id;
  if (hasFirstResult && firstConfig?.[0]?.type === TRAJECTORY_TYPE.AREA && firstTrajectoryId != null) {
    const allMandatoryAreasInStudy = await isFlowbasedAllowed(firstTrajectoryId);
    isFlowbasedDisabled = !allMandatoryAreasInStudy;
  }

  return {
    firstReadOnly: {
      0: false,
      1: !hasFirstResult,
    },
    secondReadOnly: secondConfig
      ? {
          '0': !hasFirstResult,
          '1': isFlowbasedDisabled,
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
  const { isFlowbasedAllowed } = useFetchAreas();

  const getTrajectories = async (id: number) => {
    try {
      const firstConfig = configs?.[0];
      const secondConfig = configs?.[1];

      const { hvdc, recalculate } = await fetchStudyOptions(id, firstConfig, secondConfig);
      const secondConfigData = extractSecondConfigData(secondConfig);

      const promises = [firstConfig, secondConfigData]
        .filter(Boolean)
        .map((config) => fetchTrajectoriesForConfig(id, config));

      const [firstResults, secondResults] = await Promise.all(promises);

      dispatch?.({
        type: STUDY_ACTION.ADD_TRAJECTORIES,
        payload: {
          ...(firstConfig && buildDispatchPayload(firstConfig, firstResults)),
          ...(secondConfig && buildDispatchPayload(secondConfig, secondResults)),
        },
      });

      if (firstConfig) {
        const firstData = buildTableData(firstConfig, t, firstResults, { hvdc });
        if (firstData.length > 0) setFirstTableData(firstData);
      }

      if (secondConfig) {
        const secondData = buildTableData(secondConfig, t, secondResults, { recalculate });
        if (secondData.length > 0) setSecondTableData(secondData);
      }

      if (options.withReadOnlyRow || isStudyGenerated) {
        const { firstReadOnly, secondReadOnly } = await computeReadOnlyRows({
          isStudyGenerated,
          firstResults,
          firstConfig,
          secondConfig,
          isFlowbasedAllowed,
        });

        setFirstTableReadOnlyRow(firstReadOnly);
        if (secondConfig) {
          setSecondTableReadOnlyRow(secondReadOnly);
        }
      }
    } catch (error) {
      console.log('================= error', error);
    }
  };

  useEffect(() => {
    if (studyId != null) {
      void getTrajectories(studyId);
    }
  }, [studyId, isStudyGenerated, configs]);

  return options.withReadOnlyRow
    ? { firstTableData, firstTableReadOnlyRow, secondTableData, secondTableReadOnlyRow }
    : { firstTableData, secondTableData };
};
