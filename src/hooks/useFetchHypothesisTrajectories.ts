import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { useStudy, useStudyDispatch } from '@/store/contexts/StudyContext.tsx';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckBoxData, DbTrajectory, HypothesisRowData, TrajectoryAreaData, TrajectoryState } from '@/shared/types';
import { getStudyTrajectoriesWithWarnings } from '@/shared/services/trajectoryService';
import {
  buildDefaultEmptyTrajectoryList,
  buildRowWithSubRowsData,
  convertIntoHypothesisRowWithTechnologies,
  removeDuplicate,
  removeDuplicateByTechnology,
  retrieveReadOnlyArea,
} from '@/shared/utils/trajectoryUtils.ts';
import { STUDY_ACTION } from '@/shared/enum/study.ts';
import { sortWithFixedPosition } from '@/shared/utils/sortUtils';
import { ReadOnlyObject } from '@common/data/stdTable/types/readOnly.type';
import { getReadOnlyForGeneratedStudy } from '@/shared/helpers/hypothesisTableHelper.ts';
import { getDefaultAreaNotIncludedInAreaList } from '@/shared/utils/hypothesisTableUtils.ts';

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
  const emptyAreaSelected = useMemo(
    () => (trajectoryType ? (studyState?.[trajectoryType]?.trajectories ?? []) : []),
    [trajectoryType],
  );

  const fetchAreas = useCallback(
    async (id?: number, type?: TRAJECTORY_TYPE) => {
      try {
        if (id != null && type) {
          const result: TrajectoryState = await getStudyTrajectoriesWithWarnings(id, type);
          // Build default empty areas (default area not linked to a trajectory)
          const defaultEmptyAreas = buildDefaultEmptyTrajectoryList(type, result?.trajectories, defaultAreas);

          const allAreas = result?.trajectories?.concat(emptyAreaSelected).concat(defaultEmptyAreas);

          const arrayWithoutDuplicate: DbTrajectory[] =
            type === TRAJECTORY_TYPE.THERMAL_CAPACITY
              ? removeDuplicateByTechnology(allAreas)
              : removeDuplicate(allAreas);

          dispatch?.({
            type: STUDY_ACTION.ADD_TRAJECTORIES,
            payload: {
              [type]: {
                trajectories: arrayWithoutDuplicate,
                warningMessages: result?.warningMessages,
              },
            },
          });

          // Build checklist for dropdown list
          const newArea = (areas || [])
            .map((trajectoryArea) => {
              if (!defaultAreas?.some((item) => item.name === trajectoryArea.areaName)) {
                return { name: trajectoryArea.areaName, isDefault: false };
              }
            })
            .filter(Boolean) as CheckBoxData[];
          setAreasTrajectoryOptions(
            defaultAreas?.map((area) => ({ name: area.name, isDefault: true }))?.concat(newArea),
          );

          const checkList = arrayWithoutDuplicate
            ?.map((trajectory) => {
              if (trajectory.area) {
                return trajectory.area;
              }
            })
            .filter(Boolean) as string[];
          setDropDownListOptions(defaultAreas?.map((item) => item.name).concat(checkList));

          // Build row data for hypothesis table
          // Find default area not included in areas trajectory list
          const defaultAreaListNotIncludedInList: string[] = defaultAreas
            ? getDefaultAreaNotIncludedInAreaList(defaultAreas, areas)
            : [];

          // Hypothesis table
          const areaData =
            type === TRAJECTORY_TYPE.THERMAL_CAPACITY
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
            const rows = getReadOnlyForGeneratedStudy(dataTrajectories);
            setReadOnlyRow(rows);
          } else if (defaultAreaListNotIncludedInList.length > 0 && !isStudyGenerated) {
            setReadOnlyRow(retrieveReadOnlyArea(dataTrajectories, defaultAreaListNotIncludedInList));
          }
        }
      } catch {
        // Silent handler
      }
    },
    [defaultAreas, emptyAreaSelected, dispatch, areas, isStudyGenerated],
  );

  useEffect(() => {
    void fetchAreas(studyId, trajectoryType);
  }, [studyId, trajectoryType]);

  return { hypothesisTrajectories, areasTrajectoryOptions, dropDownListOptions, readOnlyRow };
};
