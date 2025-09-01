import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { useStudy, useStudyDispatch } from '@/store/contexts/StudyContext.tsx';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckBoxData, DbTrajectory, HypothesisRowData, TrajectoryAreaData, TrajectoryState } from '@/shared/types';
import { getStudyTrajectoriesWithWarnings } from '@/shared/services/trajectoryService';
import {
  buildEmptyTrajectory,
  buildRowWithSubRowsData,
  removeDuplicate,
  retrieveReadOnlyArea,
} from '@/shared/utils/trajectoryUtils.ts';
import { STUDY_ACTION } from '@/shared/enum/study.ts';
import { OTHER_AREAS } from '@/shared/const/studyConfig.ts';
import { sortWithFixedPosition } from '@/shared/utils/sortUtils';
import { ThermalOptions } from '@/mocks/data/list/names.ts';
import { ReadOnlyObject } from '@common/data/stdTable/types/readOnly.type';
import { getReadOnlyForGeneratedStudy } from '@/shared/helpers/hypothesisTableHelper.ts';

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
          const areaDefault = [
            { name: OTHER_AREAS },
            ...(Array.isArray(defaultAreas) && defaultAreas.length > 0 ? defaultAreas : []),
          ];

          // check if default areas are not already linked to a trajectory
          const defaultAreasNotLinkedToStudy =
            result?.trajectories.length > 0
              ? areaDefault?.filter((area) => result?.trajectories.find((trajectory) => area.name !== trajectory.area))
              : areaDefault;
          const defaultEmptyAreas = (defaultAreasNotLinkedToStudy || []).map((defaultArea) =>
            buildEmptyTrajectory(defaultArea.name, type),
          );

          const arrayWithoutDuplicate: DbTrajectory[] = removeDuplicate(
            result?.trajectories?.concat(emptyAreaSelected).concat(defaultEmptyAreas),
          );

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
            ?.map((defaultArea) => {
              if (!areas?.some((trajectoryArea) => trajectoryArea.areaName === defaultArea.name)) {
                return defaultArea.name;
              }
            })
            .filter(Boolean) as string[];

          // Hypothesis table
          const areaData = arrayWithoutDuplicate
            .map((trajectory) =>
              buildRowWithSubRowsData(
                trajectory,
                defaultAreas,
                defaultAreaListNotIncludedInList,
                type === TRAJECTORY_TYPE.THERMAL_CAPACITY ? ThermalOptions : null,
              ),
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
