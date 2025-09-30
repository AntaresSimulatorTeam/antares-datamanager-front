import { TRAJECTORY_SELECTION_STATUS, TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { useStudy, useStudyDispatch } from '@/store/contexts/StudyContext.tsx';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CheckBoxData,
  DbTrajectory,
  HypothesisRowData,
  ParamTrajectoryState,
  ThermalParamTrajectoryType,
  TrajectoryAreaData,
  TrajectoryState,
  WarningMessage,
} from '@/shared/types';
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
import { getDefaultAreaNotIncludedInAreaList, transformToSubRowKeys } from '@/shared/utils/hypothesisTableUtils.ts';
import { useTranslation } from 'react-i18next';
import { fetchMultipleTrajectoryType } from '@/shared/services/hypothesisTableService.ts';

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
  const emptyAreaSelected = useMemo(
    () => (trajectoryType ? (studyState?.[trajectoryType]?.trajectories ?? []) : []),
    [trajectoryType],
  );

  const fetchAreas = useCallback(
    async (id?: number, type?: TRAJECTORY_TYPE) => {
      try {
        if (id != null && type) {
          let result: TrajectoryState | ParamTrajectoryState;
          let defaultEmptyAreas: DbTrajectory[];
          let arrayWithoutDuplicate: DbTrajectory[];
          if (type === TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER) {
            const types: ThermalParamTrajectoryType[] = [
              TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER,
              TRAJECTORY_TYPE.THERMAL_TECHNICAL_COMMON_PARAMETER,
              TRAJECTORY_TYPE.THERMAL_TECHNICAL_MODULATION_PARAMETER,
            ];
            result = await fetchMultipleTrajectoryType(id, types);

            const specificAreas: DbTrajectory[] = result?.[type]?.trajectories;
            defaultEmptyAreas = buildDefaultEmptyTrajectoryList(type, specificAreas, defaultAreas) ?? [];
            const allAreas = specificAreas?.concat(emptyAreaSelected).concat(defaultEmptyAreas);
            arrayWithoutDuplicate = removeDuplicate(allAreas);
            const warnings: WarningMessage[] = [
              ...(result?.THERMAL_TECHNICAL_SPECIFIC_PARAMETER?.warningMessages ?? []),
              ...(result?.THERMAL_TECHNICAL_COMMON_PARAMETER?.warningMessages ?? []),
              ...(result?.THERMAL_TECHNICAL_MODULATION_PARAMETER?.warningMessages ?? []),
            ];
            dispatch?.({
              type: STUDY_ACTION.ADD_TRAJECTORIES,
              payload: {
                [TRAJECTORY_TYPE.THERMAL_PARAMETER]: {
                  trajectories: arrayWithoutDuplicate,
                  warningMessages: warnings,
                },
              },
            });
          } else {
            result = await getStudyTrajectoriesWithWarnings(id, type);
            // Build default empty areas (default area not linked to a trajectory)
            defaultEmptyAreas = buildDefaultEmptyTrajectoryList(type, result?.trajectories, defaultAreas);
            const allAreas = result?.trajectories?.concat(emptyAreaSelected).concat(defaultEmptyAreas);

            arrayWithoutDuplicate =
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
          if (type === TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER) {
            const specificAreaData = arrayWithoutDuplicate
              .map((trajectory) =>
                buildRowWithSubRowsData(trajectory, defaultAreas, defaultAreaListNotIncludedInList, null),
              )
              .filter(Boolean);

            const paraModulationTrajectory = (result as ParamTrajectoryState)?.[
              TRAJECTORY_TYPE.THERMAL_TECHNICAL_MODULATION_PARAMETER
            ].trajectories?.[0];
            const paraCommonTrajectory = (result as ParamTrajectoryState)?.[
              TRAJECTORY_TYPE.THERMAL_TECHNICAL_COMMON_PARAMETER
            ].trajectories?.[0];

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
            dataTrajectories = sortWithFixedPosition(areaData);
          }
          setHypothesisTrajectories(dataTrajectories);

          if (isStudyGenerated) {
            const rows = getReadOnlyForGeneratedStudy(dataTrajectories);
            setReadOnlyRow(rows);
          } else {
            const dataToCheck =
              type === TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER && dataTrajectories[0].subRows
                ? dataTrajectories[0].subRows
                : dataTrajectories;
            const readOnlyRows = retrieveReadOnlyArea(dataToCheck, defaultAreaListNotIncludedInList);
            if (type === TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER) {
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
