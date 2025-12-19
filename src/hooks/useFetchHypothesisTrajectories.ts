import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { useStudy, useStudyDispatch } from '@/store/contexts/StudyContext.tsx';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckBoxData, DbTrajectory, HypothesisRowData, TrajectoryAreaData } from '@/shared/types';
import {
  buildDefaultEmptyTrajectoryList,
  buildRowWithSubRowsData,
  convertIntoHypothesisRowWithTechnologies,
  filterRow,
  generateReadOnlyIndexMap,
  removeDuplicate,
  removeDuplicateByTechnology,
  retrieveReadOnlyArea,
} from '@/shared/utils/trajectoryUtils.ts';
import { STUDY_ACTION } from '@/shared/enum/study.ts';
import { sortWithFixedPosition } from '@/shared/utils/sortUtils';
import { ReadOnlyObject } from '@common/data/stdTable/types/readOnly.type';
import { buildCheckListBox, getDefaultAreaNotIncludedInAreaList } from '@/shared/utils/hypothesisTableUtils.ts';
import { getStudyTrajectories } from '@/shared/services/studyService.ts';
import { getThermalTechnologyList } from '@/shared/services/defaultConfigService.ts';
import { STSTechnology } from '@/mocks/data/list/names.ts';

export const useFetchHypothesisTrajectories = (
  areas: TrajectoryAreaData[],
  studyId?: number,
  trajectoryType?: TRAJECTORY_TYPE,
  defaultAreas?: { name: string }[],
  isStudyGenerated?: boolean,
) => {
  const [hypothesisTrajectories, setHypothesisTrajectories] = useState<HypothesisRowData[]>([]);
  const [areasTrajectoryOptions, setAreasTrajectoryOptions] = useState<CheckBoxData[] | undefined>([]);
  const [dropDownListOptions, setDropDownListOptions] = useState<string[] | undefined>([]);
  const [readOnlyRow, setReadOnlyRow] = useState<ReadOnlyObject>({});
  const [technologyList, setTechnologyList] = useState<string[]>([]);
  const studyState = useStudy();
  const dispatch = useStudyDispatch();
  const emptyAreaSelected: DbTrajectory[] = useMemo(() => {
    if (trajectoryType && !isStudyGenerated) {
      return (
        studyState?.[trajectoryType]?.trajectories?.filter((trajectory) => trajectory?.trajectoryName?.length < 1) ?? []
      );
    }
    return [];
  }, [isStudyGenerated, trajectoryType]);

  const fetchAreas = useCallback(
    async (id: number, trajType: TRAJECTORY_TYPE) => {
      try {
        // TODO: remove this when STS api is implemented
        let technologies;
        const result = trajType === TRAJECTORY_TYPE.STS ? [] : await getStudyTrajectories(id, trajType);
        if (trajectoryType === TRAJECTORY_TYPE.THERMAL_CAPACITY) {
          const thermalOptions = await getThermalTechnologyList();
          technologies = thermalOptions?.map((thermalOption) => thermalOption.name);
          setTechnologyList(technologies);
        }
        if (trajectoryType === TRAJECTORY_TYPE.STS) {
          // TODO : To implement when thermal sts technologies api is implemented
          technologies = STSTechnology;
          setTechnologyList(STSTechnology);
        }
        // Build default empty areas (default area not linked to a trajectory)
        const defaultEmptyAreas = buildDefaultEmptyTrajectoryList(trajType, result, defaultAreas);
        const allAreas = [...(result || []), ...(emptyAreaSelected || []), ...(defaultEmptyAreas || [])];

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
          trajType === TRAJECTORY_TYPE.THERMAL_CAPACITY || trajType === TRAJECTORY_TYPE.STS
            ? convertIntoHypothesisRowWithTechnologies(
                arrayWithoutDuplicate,
                defaultAreaListNotIncludedInList,
                defaultAreas,
                technologies ?? [],
              )
            : arrayWithoutDuplicate
                .map((trajectory) =>
                  buildRowWithSubRowsData(trajectory, defaultAreas, defaultAreaListNotIncludedInList, null),
                )
                .filter(Boolean);
        let dataTrajectories = [];
        let readOnlyAreas = {};

        if (isStudyGenerated) {
          dataTrajectories = sortWithFixedPosition(filterRow(areaData));
          readOnlyAreas = generateReadOnlyIndexMap(dataTrajectories);
        } else {
          dataTrajectories = sortWithFixedPosition(areaData);
          readOnlyAreas = retrieveReadOnlyArea(dataTrajectories, defaultAreaListNotIncludedInList);
        }
        setHypothesisTrajectories(dataTrajectories);
        setReadOnlyRow(readOnlyAreas);
      } catch (error) {
        console.error('============= error', error);
      }
    },
    [areas, defaultAreas, isStudyGenerated, emptyAreaSelected, dispatch],
  );

  useEffect(() => {
    if (studyId != null && trajectoryType) {
      void fetchAreas(studyId, trajectoryType);
    }
  }, [studyId, trajectoryType]);

  return { hypothesisTrajectories, areasTrajectoryOptions, dropDownListOptions, readOnlyRow, technologyList };
};
