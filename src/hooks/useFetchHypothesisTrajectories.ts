import { CheckBoxData, HypothesisRowData, TrajectoryAreaData } from '@/shared/types';
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

export const useFetchHypothesisTrajectories = (
  areas: TrajectoryAreaData[],
  trajectoryType: TRAJECTORY_TYPE,
  defaultAreas: { name: string }[],
  studyId: number,
  studyStatus: StudyStatus,
  studyContextStatus?: StudyStatus,
) => {
  const [hypothesisTrajectories, setHypothesisTrajectories] = useState<HypothesisRowData[]>([]);
  const [areasTrajectoryOptions, setAreasTrajectoryOptions] = useState<CheckBoxData[]>();
  const [dropDownListOptions, setDropDownListOptions] = useState<string[]>();
  const [readOnlyRow, setReadOnlyRow] = useState<ReadOnlyObject>({});
  const [technologyList, setTechnologyList] = useState<string[]>([]);

  const studyState = useStudy();
  const dispatch = useStudyDispatch();
  const { t } = useTranslation();

  /**
   * Zones vides déjà présentes dans l’étude (si non générée)
   */
  const emptyAreaSelected = useMemo(() => {
    if (trajectoryType && studyStatus !== StudyStatus.GENERATED) {
      return (
        studyState?.[trajectoryType]?.trajectories?.filter((trajectory) => trajectory?.trajectoryName?.length < 1) ?? []
      );
    }
    return [];
  }, [studyState, studyStatus, trajectoryType]);

  /**
   * Fonction principale de récupération + normalisation
   */
  const fetchAreas = useCallback(
    async (id: number, trajType: TRAJECTORY_TYPE) => {
      try {
        const isStudyGenerated = studyContextStatus === StudyStatus.GENERATED || studyStatus === StudyStatus.GENERATED;
        const contextTrajectories = studyState?.[trajType]?.trajectories ?? [];
        let shouldSkipFetch = false;
        if (studyStatus === StudyStatus.GENERATED && contextTrajectories) {
          shouldSkipFetch = studyStatus === StudyStatus.GENERATED && Boolean(contextTrajectories?.length > 0);
        }
        const { trajectories, dsrCmResult, technologies } = await fetchAndNormalizeTrajectories({
          id,
          trajType,
          defaultAreas,
          emptyAreaSelected,
        });
        // Mise à jour du store
        if (!shouldSkipFetch) {
          dispatch?.({
            type: STUDY_ACTION.ADD_TRAJECTORIES,
            payload: buildPayload(trajType, trajectories, dsrCmResult ?? []),
          });
        }

        // Options dropdown + checkbox
        const list = buildCheckListBox(trajectories, areas, defaultAreas);
        setAreasTrajectoryOptions(list.areaOptions);
        setDropDownListOptions(list.checkedValues);

        // Construction des lignes du tableau Hypothesis
        const rows = buildHypothesisRows({
          trajType,
          trajectories,
          defaultAreas,
          areas,
          technologies,
          isStudyGenerated,
          t,
          dsrCmResult,
        });

        setHypothesisTrajectories(rows);

        // Zones par défaut non incluses
        const defaultAreaListNotInList = getDefaultAreaNotIncludedInAreaList(defaultAreas ?? [], areas);

        // Construction de la map readOnly
        setReadOnlyRow(
          buildReadOnlyMap({
            rows,
            trajType,
            isStudyGenerated,
            defaultAreaListNotInList,
          }),
        );

        // Mise à jour technologies
        if (technologies) {
          setTechnologyList(technologies);
        }
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
    studyId != null && void fetchAreas(studyId, trajectoryType);
  }, [studyId, trajectoryType, studyContextStatus]);

  return {
    hypothesisTrajectories,
    areasTrajectoryOptions,
    dropDownListOptions,
    readOnlyRow,
    technologyList,
  };
};
