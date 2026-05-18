import {
  CheckBoxData,
  DbTrajectory,
  FetchResult,
  HypothesisRowData,
  isTrajectoryHydroType,
  TechnologyType,
  TrajectoryAreaData,
} from '@/shared/types';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ReadOnlyObject } from '@/shared/types/HypothesisTable.ts';
import { useStudy, useStudyDispatch } from '@/store/contexts/StudyContext.tsx';
import { useTranslation } from 'react-i18next';
import {
  buildHypothesisRows,
  buildPayload,
  buildReadOnlyMap,
  fetchAndNormalizeTrajectories,
} from '@/shared/helpers/hypothesisTableHelper.ts';
import { buildCheckListBox, getDefaultAreaNotIncludedInAreaList } from '@/shared/utils/hypothesisTableUtils.ts';
import { StudyStatus } from '@/shared/types/common/StudyStatus.type.ts';

import { STUDY_ACTION } from '@/shared/enum/study.ts';

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
  const [technologyList, setTechnologyList] = useState<
    Record<TRAJECTORY_TYPE, TechnologyType[] | undefined> | undefined
  >();

  const studyState = useStudy();
  const dispatch = useStudyDispatch();
  const { t } = useTranslation();

  const studyStateRef = useRef(studyState);
  studyStateRef.current = studyState;

  const trajectoryTypesKey = trajectoryTypes.join(',');

  /**
   * Zones vides déjà présentes dans l’étude (si non générée)
   */
  const emptyAreaSelected = useMemo(() => {
    if (!trajectoryTypes || studyStatus === StudyStatus.GENERATED) {
      return {} as Record<TRAJECTORY_TYPE, DbTrajectory[]>;
    }

    return trajectoryTypes.reduce<Record<TRAJECTORY_TYPE, DbTrajectory[]>>(
      (acc, type) => {
        const trajectories = studyStateRef.current?.[type]?.trajectories ?? [];
        acc[type] = trajectories.filter((trajectory) => (trajectory?.trajectoryName?.length ?? 0) < 1);
        return acc;
      },
      {} as Record<TRAJECTORY_TYPE, DbTrajectory[]>,
    );
  }, [studyStatus, trajectoryTypesKey]);

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
            const contextTrajectories = studyStateRef.current?.[trajType]?.trajectories ?? [];

            const shouldSkipFetch = studyStatus === StudyStatus.GENERATED && contextTrajectories.length > 0;

            const { trajectories, dsrCmResult, technologies } = await fetchAndNormalizeTrajectories({
              id,
              trajType,
              defaultAreas,
              emptyAreaSelected: emptyAreaSelected?.[trajType] ?? [],
            });

            const list = buildCheckListBox(trajectories, areas, defaultAreas);
            const labelTechnologies = technologies
              ? technologies.map((technology: TechnologyType) => technology.label)
              : [];
            const rows = buildHypothesisRows({
              trajType,
              trajectories: shouldSkipFetch ? contextTrajectories : trajectories,
              defaultAreas,
              areas,
              technologies: labelTechnologies,
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

        let hydroRows: HypothesisRowData[] = [];
        if (isTrajectoryHydroType(trajectoryTypes[0])) {
          hydroRows = buildHypothesisRows({
            trajType: TRAJECTORY_TYPE.HYDRO_SERIES,
            trajectories: [],
            defaultAreas,
            areas,
            technologies: [],
            isStudyGenerated,
            t,
            dsrCmResult: [],
            allResults: results,
          });
        }

        // 3) Mise à jour des states React (1 seul setState par state)
        setHypothesisTrajectories((prev) => {
          const next = { ...prev };
          results.forEach(({ trajType, rows }) => {
            if (isTrajectoryHydroType(trajType)) {
              next[TRAJECTORY_TYPE.HYDRO_SERIES] = hydroRows;
            } else {
              next[trajType] = rows;
            }
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
          return next as Record<TRAJECTORY_TYPE, TechnologyType[]>;
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

    [studyContextStatus, studyStatus, defaultAreas, emptyAreaSelected, areas, t, dispatch],
  );

  const fetchAreasRef = useRef(fetchAreas);
  fetchAreasRef.current = fetchAreas;

  /**
   * Déclenchement automatique
   */
  useEffect(() => {
    studyId != null && void fetchAreasRef.current(studyId, trajectoryTypes);
  }, [studyId, studyContextStatus, trajectoryTypesKey]);

  return {
    hypothesisTrajectories,
    areasTrajectoryOptions,
    dropDownListOptions,
    readOnlyRow,
    technologyList,
  };
};
