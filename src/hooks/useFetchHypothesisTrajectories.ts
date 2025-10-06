import { TRAJECTORY_SELECTION_STATUS, TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { useStudy, useStudyDispatch } from '@/store/contexts/StudyContext.tsx';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CheckBoxData,
  DbTrajectory,
  HypothesisRowData,
  ThermalParamTrajectoryType,
  TrajectoryAreaData,
} from '@/shared/types';
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
import { getDefaultAreaNotIncludedInAreaList, transformToSubRowKeys } from '@/shared/utils/hypothesisTableUtils.ts';
import { useTranslation } from 'react-i18next';
import { getStudyTrajectories } from '@/shared/services/studyService.ts';
import { fetchTrajectoriesFromTypes } from '@/shared/services/hypothesisTableService.ts';

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
      if (trajectoryType === TRAJECTORY_TYPE.THERMAL_PARAMETER) {
        return (
          studyState?.[trajectoryType]?.trajectories?.filter(
            (trajectory) => trajectory.type === TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER,
          ) ?? []
        );
      } else {
        return studyState?.[trajectoryType]?.trajectories ?? [];
      }
    }
    return [];
  }, [trajectoryType]);

  const fetchAreas = useCallback(
    async (id?: number, trajType?: TRAJECTORY_TYPE) => {
      let resultObject: Partial<Record<ThermalParamTrajectoryType, DbTrajectory[]>>;
      try {
        if (id != null && trajType) {
          let result: DbTrajectory[];
          let defaultEmptyAreas: DbTrajectory[];
          let arrayWithoutDuplicate: DbTrajectory[];
          if (trajType === TRAJECTORY_TYPE.THERMAL_PARAMETER) {
            const types: ThermalParamTrajectoryType[] = [
              TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER,
              TRAJECTORY_TYPE.THERMAL_TECHNICAL_COMMON_PARAMETER,
              TRAJECTORY_TYPE.THERMAL_TECHNICAL_MODULATION_PARAMETER,
            ];
            resultObject = await fetchTrajectoriesFromTypes(id, types);

            const specificAreas: DbTrajectory[] =
              resultObject?.[TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER] ?? [];
            defaultEmptyAreas =
              buildDefaultEmptyTrajectoryList(
                TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER,
                specificAreas,
                defaultAreas,
              ) ?? [];
            const allAreas = specificAreas?.concat(emptyAreaSelected).concat(defaultEmptyAreas);
            arrayWithoutDuplicate = removeDuplicate(allAreas);
          } else {
            result = await getStudyTrajectories(id, trajType);
            // Build default empty areas (default area not linked to a trajectory)
            defaultEmptyAreas = buildDefaultEmptyTrajectoryList(trajType, result, defaultAreas);
            const allAreas = result?.concat(emptyAreaSelected).concat(defaultEmptyAreas);

            arrayWithoutDuplicate =
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
          }

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
          let dataTrajectories: HypothesisRowData[] = [];
          // Find default area not included in areas trajectory list
          const defaultAreaListNotIncludedInList: string[] = defaultAreas
            ? getDefaultAreaNotIncludedInAreaList(defaultAreas, areas)
            : [];

          // Hypothesis table
          if (trajType === TRAJECTORY_TYPE.THERMAL_PARAMETER) {
            // @ts-ignore
            const resultToUse = { ...resultObject };
            const specificAreaData = arrayWithoutDuplicate
              .map((trajectory) =>
                buildRowWithSubRowsData(trajectory, defaultAreas, defaultAreaListNotIncludedInList, null),
              )
              .filter(Boolean);
            const paraModulationTrajectory =
              resultToUse[TRAJECTORY_TYPE.THERMAL_TECHNICAL_MODULATION_PARAMETER]?.[0] ?? null;
            const paraCommonTrajectory = resultToUse[TRAJECTORY_TYPE.THERMAL_TECHNICAL_COMMON_PARAMETER]?.[0] ?? null;
            dataTrajectories = [
              {
                hypothesis: t('thermal.@specific'),
                trajectory: null,
                status: TRAJECTORY_SELECTION_STATUS.MISSING,
                isDefault: false,
                isDeletable: false,
                subRows: sortWithFixedPosition(specificAreaData),
              },
              {
                hypothesis: t('thermal.@paramModulation'),
                trajectory: paraModulationTrajectory ?? null,
                status: paraModulationTrajectory ? TRAJECTORY_SELECTION_STATUS.OK : TRAJECTORY_SELECTION_STATUS.MISSING,
                isDefault: false,
                isDeletable: false,
                subRows: null,
              },
              {
                hypothesis: t('thermal.@common'),
                trajectory: paraCommonTrajectory ?? null,
                status: paraCommonTrajectory ? TRAJECTORY_SELECTION_STATUS.OK : TRAJECTORY_SELECTION_STATUS.MISSING,
                isDefault: false,
                isDeletable: false,
                subRows: null,
              },
            ];
          } else {
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
            dataTrajectories = sortWithFixedPosition(areaData);
          }
          setHypothesisTrajectories(dataTrajectories);

          if (isStudyGenerated) {
            const rows = getReadOnlyForGeneratedStudy(dataTrajectories);
            setReadOnlyRow(rows);
          } else {
            const dataToCheck =
              trajType === TRAJECTORY_TYPE.THERMAL_PARAMETER && dataTrajectories[0].subRows
                ? dataTrajectories[0].subRows
                : dataTrajectories;
            const readOnlyRows = retrieveReadOnlyArea(dataToCheck, defaultAreaListNotIncludedInList);
            if (trajType === TRAJECTORY_TYPE.THERMAL_PARAMETER) {
              const hasSpecificTrajectory = dataToCheck?.some((row) => row.status === TRAJECTORY_SELECTION_STATUS.OK);
              const readOnlySubRows = transformToSubRowKeys(readOnlyRows);
              if (!hasSpecificTrajectory) {
                const next = { ...readOnlySubRows, ['1']: true };
                setReadOnlyRow(next);
              } else {
                setReadOnlyRow(readOnlySubRows);
              }
            } else {
              setReadOnlyRow(readOnlyRows);
            }
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
