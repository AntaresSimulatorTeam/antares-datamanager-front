import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { useStudy, useStudyDispatch } from '@/store/contexts/StudyContext.tsx';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckBoxData, HypothesisRowData, TrajectoryAreaData } from '@/shared/types';
import {
  buildDefaultEmptyTrajectoryList,
  convertIntoHypothesisRowWithTechnologies,
  removeDuplicateByTechnology,
} from '@/shared/utils/trajectoryUtils.ts';
import { STUDY_ACTION } from '@/shared/enum/study.ts';
import { sortWithFixedPosition } from '@/shared/utils/sortUtils';
import { ReadOnlyObject } from '@common/data/stdTable/types/readOnly.type';
import {
  buildCheckListBox,
  buildReadOnlyRows,
  getDefaultAreaNotIncludedInAreaList,
} from '@/shared/utils/hypothesisTableUtils.ts';
import { getStudyTrajectories } from '@/shared/services/studyService.ts';
import { fetchWarningMessagesFromType } from '@/shared/services/warningService.ts';

export const useFetchHypothesisTrajectoriesSubRow = (
  studyId: number,
  mainType: TRAJECTORY_TYPE,
  subTypes: TRAJECTORY_TYPE[],
  defaultAreas?: { name: string }[],
  areas?: TrajectoryAreaData[],
  isStudyGenerated?: boolean,
) => {
  const [hypothesisTrajectories, setHypothesisTrajectories] = useState<HypothesisRowData[]>([]);
  const [areasTrajectoryOptions, setAreasTrajectoryOptions] = useState<CheckBoxData[] | undefined>([]);
  const [dropDownListOptions, setDropDownListOptions] = useState<string[] | undefined>([]);
  const [readOnlyRow, setReadOnlyRow] = useState<ReadOnlyObject>({});
  const studyState = useStudy();
  const dispatch = useStudyDispatch();
  const emptyAreaSelected = useMemo(() => (mainType ? (studyState?.[mainType]?.trajectories ?? []) : []), [mainType]);

  const fetchAreas = useCallback(
    async (id: number, type: TRAJECTORY_TYPE, otherTypes?: TRAJECTORY_TYPE[]) => {
      try {
        const result = await getStudyTrajectories(id, type);
        const typesForWarnings = otherTypes?.length ? [type, ...otherTypes] : [type];
        const temporaryWarnings = await Promise.all(
          typesForWarnings.map(
            async (warningType: TRAJECTORY_TYPE) => await fetchWarningMessagesFromType(warningType, id),
          ),
        );
        const warningMessages = temporaryWarnings?.flat();
        // Build default empty areas (default area not linked to a trajectory)
        const defaultEmptyAreas = buildDefaultEmptyTrajectoryList(type, result, defaultAreas);
        const allAreas = result?.concat(emptyAreaSelected).concat(defaultEmptyAreas);

        const arrayWithoutDuplicate = removeDuplicateByTechnology(allAreas);

        dispatch?.({
          type: STUDY_ACTION.ADD_TRAJECTORIES,
          payload: {
            [type]: {
              trajectories: arrayWithoutDuplicate,
              warningMessages,
            },
          },
        });

        // Build checklist for dropdown list
        const resultList = buildCheckListBox(arrayWithoutDuplicate, areas, defaultAreas);
        resultList?.areaOptions && setAreasTrajectoryOptions(resultList?.areaOptions);
        setDropDownListOptions(resultList?.checkedValues);

        // Build row data for hypothesis table
        // Find default area not included in areas trajectory list
        const defaultAreaListNotIncludedInList: string[] = defaultAreas
          ? getDefaultAreaNotIncludedInAreaList(defaultAreas, areas)
          : [];

        // Hypothesis table
        const areaData = convertIntoHypothesisRowWithTechnologies(
          arrayWithoutDuplicate,
          defaultAreaListNotIncludedInList,
          defaultAreas,
        );
        const dataTrajectories: HypothesisRowData[] = sortWithFixedPosition(areaData);
        setHypothesisTrajectories(dataTrajectories);

        const readOnlyRows: ReadOnlyObject = buildReadOnlyRows(
          isStudyGenerated,
          dataTrajectories,
          defaultAreaListNotIncludedInList,
        );
        setReadOnlyRow(readOnlyRows);
      } catch (error) {
        console.error('============= error', error);
      }
    },
    [areas, defaultAreas, isStudyGenerated, emptyAreaSelected, dispatch],
  );

  useEffect(() => {
    if (studyId != null && mainType) {
      void fetchAreas(studyId, mainType, subTypes);
    }
  }, [studyId, mainType]);

  return { hypothesisTrajectories, areasTrajectoryOptions, dropDownListOptions, readOnlyRow };
};
