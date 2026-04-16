import { CheckBoxData, DbTrajectory, HypothesisRowData, TrajectoryAreaData } from '@/shared/types';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ReadOnlyObject } from '@/shared/types/HypothesisTable.ts';
import { useStudy, useStudyDispatch } from '@/store/contexts/StudyContext.tsx';
import { useTranslation } from 'react-i18next';
import {
  buildHypothesisRows,
  buildPayload,
  buildReadOnlyMap,
  fetchAndNormalizeTrajectories,
} from '@/shared/helpers/hypothesisTableHelper.ts';
import { STUDY_ACTION } from '@/shared/enum/study.ts';
import { buildCheckListBox, getDefaultAreaNotIncludedInAreaList } from '@/shared/utils/hypothesisTableUtils.ts';
import { StudyStatus } from '@/shared/types/common/StudyStatus.type.ts';

interface FetchResult {
  trajType: TRAJECTORY_TYPE;
  trajectories: DbTrajectory[];
  dsrCmResult: DbTrajectory[] | null;
  technologies?: string[] | null;
  rows: HypothesisRowData[];
  list: {
    areaOptions: CheckBoxData[];
    checkedValues: string[];
  };
  readOnlyMap: Record<string, boolean>;
  shouldSkipFetch: boolean;
}

export const useFetchHypothesisTrajectories = (
  areas: TrajectoryAreaData[],
  trajectoryTypes: TRAJECTORY_TYPE[],
  defaultAreas: { name: string }[],
  studyId: number,
  studyStatus: StudyStatus,
  studyContextStatus?: StudyStatus,
) => {
  const [hypothesisTrajectories, setHypothesisTrajectories] = useState<
    Record<TRAJECTORY_TYPE, HypothesisRowData[] | undefined> | undefined
  >();
  const [areasTrajectoryOptions, setAreasTrajectoryOptions] = useState<
    Record<TRAJECTORY_TYPE, CheckBoxData[] | undefined> | undefined
  >();
  const [dropDownListOptions, setDropDownListOptions] = useState<
    Record<TRAJECTORY_TYPE, string[] | undefined> | undefined
  >();
  const [readOnlyRow, setReadOnlyRow] = useState<Record<TRAJECTORY_TYPE, ReadOnlyObject | undefined> | undefined>();
  const [technologyList, setTechnologyList] = useState<Record<TRAJECTORY_TYPE, string[] | undefined> | undefined>();

  const studyState = useStudy();
  const dispatch = useStudyDispatch();
  const { t } = useTranslation();

  /**
   * Zones vides déjà présentes dans l’étude (si non générée)
   */
  const emptyAreaSelected = useMemo(() => {
    if (!trajectoryTypes || studyStatus === StudyStatus.GENERATED) {
      return {} as Record<TRAJECTORY_TYPE, DbTrajectory[]>;
    }

    return trajectoryTypes.reduce<Record<TRAJECTORY_TYPE, DbTrajectory[]>>(
      (acc, type) => {
        const trajectories = studyState?.[type]?.trajectories ?? [];
        acc[type] = trajectories.filter((trajectory) => (trajectory?.trajectoryName?.length ?? 0) < 1);
        return acc;
      },
      {} as Record<TRAJECTORY_TYPE, DbTrajectory[]>,
    );
  }, [studyStatus, trajectoryTypes]);

  /**
   * Fonction principale de récupération + normalisation
   */
  const fetchAreas = useCallback(
    async (id: number, trajTypes: TRAJECTORY_TYPE[]) => {
      try {
        const isStudyGenerated = studyContextStatus === StudyStatus.GENERATED || studyStatus === StudyStatus.GENERATED;

        // 1) Lancer toutes les requêtes en parallèle
        const results: FetchResult[] = await Promise.all(
          trajTypes.map(async (trajType: TRAJECTORY_TYPE): Promise<FetchResult> => {
            const contextTrajectories = studyState?.[trajType]?.trajectories ?? [];

            const shouldSkipFetch = studyStatus === StudyStatus.GENERATED && contextTrajectories.length > 0;

            const { trajectories, dsrCmResult, technologies } = await fetchAndNormalizeTrajectories({
              id,
              trajType,
              defaultAreas,
              emptyAreaSelected: emptyAreaSelected?.[trajType] ?? [],
            });

            const list = buildCheckListBox(trajectories, areas, defaultAreas);

            const rows = buildHypothesisRows({
              trajType,
              trajectories: shouldSkipFetch ? contextTrajectories : trajectories,
              defaultAreas,
              areas,
              technologies: trajType === TRAJECTORY_TYPE.HYDRO_CAPACITY ? technologies : undefined,
              isStudyGenerated,
              t,
              dsrCmResult,
            });

            const defaultAreaListNotInList = getDefaultAreaNotIncludedInAreaList(defaultAreas ?? [], areas);

            const readOnlyMap = buildReadOnlyMap({
              rows,
              trajType,
              isStudyGenerated,
              defaultAreaListNotInList,
            });

            return {
              trajType,
              trajectories,
              dsrCmResult,
              technologies,
              rows,
              list,
              readOnlyMap,
              shouldSkipFetch,
            };
          }),
        );

        // 2) Mise à jour du store Redux
        results.forEach(({ trajType, trajectories, dsrCmResult, shouldSkipFetch }) => {
          if (!shouldSkipFetch) {
            dispatch?.({
              type: STUDY_ACTION.ADD_TRAJECTORIES,
              payload: buildPayload(trajType, trajectories, dsrCmResult ?? []),
            });
          }
        });

        // 3) Mise à jour des states React (1 seul setState par state)
        setHypothesisTrajectories((prev) => {
          const next = { ...prev };
          results.forEach(({ trajType, rows }) => {
            next[trajType] = rows;
          });
          return next as Record<TRAJECTORY_TYPE, HypothesisRowData[]>;
        });

        setReadOnlyRow((prev) => {
          const next = { ...prev };
          results.forEach(({ trajType, readOnlyMap }) => {
            next[trajType] = readOnlyMap;
          });
          return next as Record<TRAJECTORY_TYPE, ReadOnlyObject>;
        });

        setTechnologyList((prev) => {
          const next = { ...prev };
          results.forEach(({ trajType, technologies }) => {
            if (technologies) next[trajType] = technologies;
          });
          return next as Record<TRAJECTORY_TYPE, string[]>;
        });

        setAreasTrajectoryOptions(
          results.reduce<Record<TRAJECTORY_TYPE, CheckBoxData[]>>(
            (acc, r) => {
              acc[r.trajType] = r.list.areaOptions;
              return acc;
            },
            {} as Record<TRAJECTORY_TYPE, CheckBoxData[]>,
          ),
        );

        setDropDownListOptions(
          results.reduce<Record<TRAJECTORY_TYPE, string[]>>(
            (acc, r) => {
              acc[r.trajType] = r.list.checkedValues;
              return acc;
            },
            {} as Record<TRAJECTORY_TYPE, string[]>,
          ),
        );
      } catch (error) {
        console.error('fetchAreas error', error);
      }
    },
    [areas, defaultAreas, t, emptyAreaSelected],
  );

  /**
   * Déclenchement automatique
   */
  useEffect(() => {
    studyId != null && void fetchAreas(studyId, trajectoryTypes);
  }, [studyId, studyContextStatus, trajectoryTypes[0]]);

  return {
    hypothesisTrajectories,
    areasTrajectoryOptions,
    dropDownListOptions,
    readOnlyRow,
    technologyList,
  };
};
