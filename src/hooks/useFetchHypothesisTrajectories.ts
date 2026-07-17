import {
  CheckBoxData,
  DbTrajectory,
  FetchResult,
  HypothesisRowData,
  HypothesisTableResults,
  isTrajectoryHydroPSPType,
  isTrajectoryHydroType,
  isTrajectoryNuclearType,
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
  buildRowsByType,
  fetchAndNormalizeTrajectories,
} from '@/shared/helpers/hypothesisTableHelper.ts';
import { buildCheckListBox, getDefaultAreaNotIncludedInAreaList } from '@/shared/utils/hypothesisTableUtils.ts';
import { StudyStatus } from '@/shared/types/common/StudyStatus.type.ts';

import { STUDY_ACTION } from '@/shared/enum/study.ts';
import { filterRow, mergeRows } from '@/shared/utils/trajectoryUtils.ts';
import { sortWithFixedPosition } from '@/shared/utils/sortUtils.ts';
import {
  HYDRO_PSP_TYPES,
  HYDRO_TYPES,
  NUCLEAR_FR_TIME_NON_SERIES_TYPES,
  NUCLEAR_FR_TIME_SERIES_TYPES,
} from '@/shared/const/trajectoryTypes.ts';
import { HydroSubRows } from '@/mocks/data/list/names.ts';

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
        const defaultAreaListNotInList = getDefaultAreaNotIncludedInAreaList(defaultAreas ?? [], areas);

        // 1) Lancer toutes les requêtes en parallèle
        // --- 1) FETCH + NORMALISATION ---
        const rawResults: FetchResult[] = await Promise.all(
          trajTypes.map(async (trajType: TRAJECTORY_TYPE) => {
            const contextTrajectories = studyStateRef.current?.[trajType]?.trajectories ?? [];

            const shouldSkipFetch = studyStatus === StudyStatus.GENERATED && contextTrajectories.length > 0;

            const { trajectories, dsrCmResult, technologies } = await fetchAndNormalizeTrajectories({
              id,
              trajType,
              defaultAreas,
              emptyAreaSelected: emptyAreaSelected?.[trajType] ?? [],
            });

            return {
              trajType,
              trajectories,
              dsrCmResult,
              technologies,
              shouldSkipFetch,
              contextTrajectories,
            };
          }),
        );

        const hydroTypeToSet = isTrajectoryHydroPSPType(trajectoryTypes[0])
          ? TRAJECTORY_TYPE.HYDRO_PSP_SERIES
          : TRAJECTORY_TYPE.HYDRO_SERIES;

        // Cas nucléaire ou hydro : pas de list/checkedValues
        let results: HypothesisTableResults[] = [];
        if (isTrajectoryNuclearType(trajTypes[0])) {
          const nuclearRows = buildRowsByType({
            rowTypes: NUCLEAR_FR_TIME_NON_SERIES_TYPES,
            subRowTypes: NUCLEAR_FR_TIME_SERIES_TYPES,
            trajectoriesByType: rawResults,
            t,
          });

          results = rawResults.flatMap((result) => {
            if (result.trajType === TRAJECTORY_TYPE.NUCLEAR_FR_MODULATION) {
              return {
                ...result,
                rows: nuclearRows,
                readOnlyMap: {},
              };
            } else {
              return [];
            }
          });
        } else if (isTrajectoryHydroType(trajTypes[0])) {
          const effectiveTrajectories = rawResults.flatMap((result) =>
            result.shouldSkipFetch ? result.contextTrajectories : result.trajectories,
          );
          const areasWithTrajectory = effectiveTrajectories.flatMap((traj) => (traj.area?.length > 0 ? traj : []));
          const hydroTypes = hydroTypeToSet === TRAJECTORY_TYPE.HYDRO_SERIES ? HYDRO_TYPES : HYDRO_PSP_TYPES;

          const allHydroRows = hydroTypes.flatMap((type) =>
            buildHypothesisRows({
              trajType: type,
              trajectories: effectiveTrajectories,
              defaultAreas,
              areas,
              technologies: HydroSubRows.map((row) => row.label),
              isStudyGenerated,
              t,
            }),
          );

          const hydroRows = sortWithFixedPosition(isStudyGenerated ? filterRow(allHydroRows) : allHydroRows);
          const hydroReadOnlyMap = buildReadOnlyMap({
            rows: allHydroRows,
            trajType: trajectoryTypes[0],
            isStudyGenerated,
            defaultAreaListNotInList,
          });

          const { areaOptions, checkedValues } = buildCheckListBox(areasWithTrajectory, areas, defaultAreas);

          results = rawResults.flatMap((result) => {
            if (result.trajType === hydroTypeToSet) {
              return {
                ...result,
                rows: mergeRows(hydroRows),
                readOnlyMap: hydroReadOnlyMap,
                list: {
                  areaOptions,
                  checkedValues,
                },
              };
            } else {
              return [];
            }
          });
        } else {
          // --- 2) CONSTRUCTION DES ROWS, LIST, READONLYMAP ---
          results = rawResults.map((res) => {
            const { trajType, trajectories, dsrCmResult, technologies, shouldSkipFetch, contextTrajectories } = res;

            const effectiveTrajectories = shouldSkipFetch ? contextTrajectories : trajectories;
            const areasWithTrajectory = effectiveTrajectories.flatMap((traj) => (traj.area?.length > 0 ? traj : []));
            const list = buildCheckListBox(areasWithTrajectory, areas, defaultAreas);

            const rows = buildHypothesisRows({
              trajType,
              trajectories: effectiveTrajectories,
              defaultAreas,
              areas,
              technologies: technologies?.map((technology) => technology.label) ?? [],
              isStudyGenerated,
              t,
              dsrCmResult,
            });

            const readOnlyMap = buildReadOnlyMap({
              rows,
              trajType,
              isStudyGenerated,
              defaultAreaListNotInList,
            });

            return {
              ...res,
              list,
              rows,
              readOnlyMap,
            };
          });
        }

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
            if (isTrajectoryHydroType(trajType)) {
              next[hydroTypeToSet] = rows;
            } else {
              next[trajType] = rows;
            }
          });
          return next as Record<TRAJECTORY_TYPE, HypothesisRowData[]>;
        });

        setReadOnlyRow((prev) => {
          const next = { ...prev };
          results.forEach(({ trajType, readOnlyMap }) => {
            if (isTrajectoryHydroType(trajType)) {
              next[hydroTypeToSet] = readOnlyMap;
            } else {
              next[trajType] = readOnlyMap;
            }
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

        if (!isTrajectoryNuclearType(trajTypes[0])) {
          setAreasTrajectoryOptions(
            results.reduce<Record<TRAJECTORY_TYPE, CheckBoxData[]>>(
              (acc, r) => {
                acc[r.trajType] = r.list?.areaOptions ?? [];
                return acc;
              },
              {} as Record<TRAJECTORY_TYPE, CheckBoxData[]>,
            ),
          );

          setDropDownListOptions(
            results.reduce<Record<TRAJECTORY_TYPE, string[]>>(
              (acc, r) => {
                const key = isTrajectoryHydroType(r.trajType) ? hydroTypeToSet : r.trajType;

                const previous = acc[key] ?? [];
                const current = r.list?.checkedValues ?? [];

                acc[key] = [...new Set([...previous, ...current])];
                return acc;
              },
              {} as Record<TRAJECTORY_TYPE, string[]>,
            ),
          );
        }
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
