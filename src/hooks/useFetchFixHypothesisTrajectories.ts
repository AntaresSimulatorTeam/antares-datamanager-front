import { getStudyById, getStudyTrajectories } from '@/shared/services/studyService.ts';
import { useCallback, useEffect, useState } from 'react';
import { ReadOnlyObject } from '@common/data/stdTable/types/readOnly.type';
import { DbTrajectory, HypothesisRowData, TrajectoryLinkData } from '@/shared/types';
import { useTranslation } from 'react-i18next';
import { useStudyDispatch } from '@/store/contexts/StudyContext.tsx';
import { HypothesisConfig, HypothesisTableOptions } from '@/shared/types/HypothesisTable.ts';
import {
  buildDispatchPayload,
  buildReadOnlyRow,
  buildTableData,
  hasLinkWithHvdcCapacities,
} from '@/shared/utils/trajectoryUtils.ts';
import { STUDY_ACTION } from '@/shared/enum/study.ts';
import { notifyAlert } from '@/shared/notification/notification.tsx';
import { getTrajectoryDataByTypeAndId } from '@/shared/services/trajectoryService.ts';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';

const fetchTrajectoriesForConfig = (studyId: number, config: HypothesisConfig[]) =>
  Promise.all(config.map(({ type }) => getStudyTrajectories(studyId, type)));

const extractSecondConfigData = (secondConfig?: HypothesisConfig[]): HypothesisConfig[] =>
  secondConfig ? [secondConfig[0], secondConfig[1], ...(secondConfig[2]?.subRows ?? [])] : [];

const fetchStudyOptions = async (
  studyId: number,
  firstConfig?: HypothesisConfig[],
  secondConfig?: HypothesisConfig[],
  newDbTrajectoryLinkId?: number,
): Promise<{ hvdc?: boolean; recalculate?: boolean; hasHvdcCapacities?: boolean }> => {
  const studyOptions = firstConfig?.[1]?.options || secondConfig?.[1]?.options || {};
  if (Object.keys(studyOptions).length > 0) {
    const studyData = await getStudyById(studyId);
    let hasHvdcCapacities = undefined;
    if (studyOptions.hasHvdcOption && newDbTrajectoryLinkId != null) {
        const linkData: TrajectoryLinkData[] = await getTrajectoryDataByTypeAndId(TRAJECTORY_TYPE.LINK, newDbTrajectoryLinkId);
        hasHvdcCapacities = hasLinkWithHvdcCapacities(linkData);
    }
    return { hvdc: studyData.hvdc, recalculate: studyData.recalculate, hasHvdcCapacities };
  }
  return {};
};

interface ReadOnlyParams {
  isStudyGenerated: boolean;
  firstResults?: DbTrajectory[][];
  secondConfig?: HypothesisConfig[];
  hvdc?: boolean;
}

const computeReadOnlyRows = ({
  isStudyGenerated,
  firstResults,
  secondConfig,
  hvdc
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
  const hasSecondResult = Boolean(firstResults?.[1]?.length);

  return {
    firstReadOnly: {
      0: false,
      1: !hasFirstResult,
    },
    secondReadOnly: secondConfig
      ? {
          '0': !hasFirstResult,
          '1': !hasSecondResult || !hvdc,
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
    if (studyId == null) {
      return { firstTableData: [], secondTableData: [] };
    }

    const firstConfig: HypothesisConfig[] = configs?.[0];
    const secondConfig: HypothesisConfig[] = configs?.[1];

    const secondConfigData = extractSecondConfigData(secondConfig);
    const promises = [firstConfig, secondConfigData]
      .filter(Boolean)
      .map((config) => fetchTrajectoriesForConfig(studyId, config));

    const [firstResults, secondResults] = await Promise.all(promises);

    const { hvdc, recalculate, hasHvdcCapacities } = await fetchStudyOptions(studyId, firstConfig, secondConfig, firstResults?.[1]?.[0]?.id);

    dispatch?.({
      type: STUDY_ACTION.ADD_TRAJECTORIES,
      payload: {
        ...(firstConfig && buildDispatchPayload(firstConfig, firstResults)),
        ...(secondConfig && buildDispatchPayload(secondConfig, secondResults)),
      },
    });

    let firstData: HypothesisRowData[] = [];
    if (firstConfig) {
      firstData = buildTableData(firstConfig, t, firstResults, { hvdc, hasHvdcCapacities });
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
      hvdc
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
