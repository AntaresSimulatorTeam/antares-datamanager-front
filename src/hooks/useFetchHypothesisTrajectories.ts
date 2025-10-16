import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { useStudy, useStudyDispatch } from '@/store/contexts/StudyContext.tsx';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckBoxData, DbTrajectory, HypothesisRowData, TrajectoryAreaData } from '@/shared/types';
import {
  buildDefaultEmptyTrajectoryList,
  buildRowWithSubRowsData,
  convertIntoHypothesisRowWithTechnologies,
  generateReadOnlyIndexMap,
  removeDuplicate,
  removeDuplicateByTechnology,
  retrieveReadOnlyArea,
} from '@/shared/utils/trajectoryUtils.ts';
import { STUDY_ACTION } from '@/shared/enum/study.ts';
import { sortWithFixedPosition } from '@/shared/utils/sortUtils';
import { ReadOnlyObject } from '@common/data/stdTable/types/readOnly.type';
import { buildCheckListBox, getDefaultAreaNotIncludedInAreaList } from '@/shared/utils/hypothesisTableUtils.ts';
import { useTranslation } from 'react-i18next';
import { getStudyTrajectories } from '@/shared/services/studyService.ts';

export const useFetchHypothesisTrajectories = (
  studyId?: number,
  trajectoryType?: TRAJECTORY_TYPE,
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
  const { t } = useTranslation();
  const emptyAreaSelected: DbTrajectory[] = useMemo(() => {
    if (trajectoryType) {
      return studyState?.[trajectoryType]?.trajectories ?? [];
    }
    return [];
  }, [trajectoryType]);

  const fetchAreas = useCallback(
    async (id?: number, trajType?: TRAJECTORY_TYPE) => {
      try {
        if (id != null && trajType) {
          const result = await getStudyTrajectories(id, trajType);
          // Build default empty areas (default area not linked to a trajectory)
          const defaultEmptyAreas = buildDefaultEmptyTrajectoryList(trajType, result, defaultAreas);
          const allAreas = result?.concat(emptyAreaSelected).concat(defaultEmptyAreas);

          const arrayWithoutDuplicate =
            trajType === TRAJECTORY_TYPE.THERMAL_CAPACITY
              ? removeDuplicateByTechnology(allAreas)
              : removeDuplicate(allAreas);
          dispatch?.({
            type: STUDY_ACTION.ADD_TRAJECTORIES,
            payload: {
              [trajType]: {
                trajectories: arrayWithoutDuplicate,
              },
            },
          });

          // Build checklist for dropdown list
          const resultList = buildCheckListBox(arrayWithoutDuplicate, areas, defaultAreas);
          resultList?.areaOptions && setAreasTrajectoryOptions(resultList?.areaOptions);
          setDropDownListOptions(resultList?.checkedValues);

          // Build row data for hypothesis table
          // Find default area not included in areas trajectory list
          const defaultAreaListNotIncludedInList: string[] = getDefaultAreaNotIncludedInAreaList(
            defaultAreas ?? [],
            areas,
          );

          // Hypothesis table
          const areaData =
            trajType === TRAJECTORY_TYPE.THERMAL_CAPACITY
              ? convertIntoHypothesisRowWithTechnologies(
                  arrayWithoutDuplicate,
                  defaultAreaListNotIncludedInList,
                  defaultAreas,
                )
              : arrayWithoutDuplicate
                  .map((trajectory) =>
                    buildRowWithSubRowsData(trajectory, defaultAreas, defaultAreaListNotIncludedInList, null),
                  )
                  .filter(Boolean);
          const dataTrajectories = sortWithFixedPosition(areaData);
          setHypothesisTrajectories(dataTrajectories);

          if (isStudyGenerated) {
            const rows = generateReadOnlyIndexMap(dataTrajectories);
            setReadOnlyRow(rows);
          } else {
            const readOnlyRows = retrieveReadOnlyArea(dataTrajectories, defaultAreaListNotIncludedInList);
            setReadOnlyRow(readOnlyRows);
          }
        }
      } catch (error) {
        console.error('============= error', error);
      }
    },
    [areas, defaultAreas, isStudyGenerated, emptyAreaSelected, dispatch, t],
  );

  useEffect(() => {
    void fetchAreas(studyId, trajectoryType);
  }, [studyId, trajectoryType]);

  return { hypothesisTrajectories, areasTrajectoryOptions, dropDownListOptions, readOnlyRow };
};
