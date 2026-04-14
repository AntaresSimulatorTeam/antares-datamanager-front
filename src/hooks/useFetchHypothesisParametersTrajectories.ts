import { TRAJECTORY_SELECTION_STATUS, TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { useStudy, useStudyDispatch } from '@/store/contexts/StudyContext.tsx';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CheckBoxData,
  DbTrajectory,
  HypothesisRowData,
  StudyDTO,
  ThermalParamTrajectoryType,
  TrajectoryAreaData,
} from '@/shared/types';
import {
  buildDefaultEmptyTrajectoryList,
  buildEmptyTrajectory,
  convertIntoHypothesisRowWithTechnologies,
  generateReadOnlyIndexMap,
  removeDuplicate,
  retrieveReadOnlyArea,
} from '@/shared/utils/trajectoryUtils.ts';
import { STUDY_ACTION } from '@/shared/enum/study.ts';
import { sortWithFixedPosition } from '@/shared/utils/sortUtils';
import { ReadOnlyObject } from '@common/data/stdTable/types/readOnly.type';
import {
  buildCheckListBox,
  getDefaultAreaNotIncludedInAreaList,
  transformToSubRowKeys,
} from '@/shared/utils/hypothesisTableUtils.ts';
import { useTranslation } from 'react-i18next';
import { fetchTrajectoriesFromTypes } from '@/shared/services/hypothesisTableService.ts';
import { isParamModulationRequired } from '@/shared/services/trajectoryService.ts';

export const useFetchHypothesisParametersTrajectories = (
  areas: TrajectoryAreaData[],
  studyData?: StudyDTO,
  defaultAreas?: { name: string }[],
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
    if (!isStudyGenerated) {
      return (
        studyState?.[TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER]?.trajectories?.filter(
          (trajectory) => trajectory?.trajectoryName?.length < 1,
        ) ?? []
      );
    }
    return [];
  }, [isStudyGenerated]);

  const fetchAreas = useCallback(
    async (id: number, horizon: string) => {
      let resultObject: Partial<Record<ThermalParamTrajectoryType, DbTrajectory[]>> | undefined;
      try {
        const types: ThermalParamTrajectoryType[] = [
          TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER,
          TRAJECTORY_TYPE.THERMAL_TECHNICAL_COMMON_PARAMETER,
          TRAJECTORY_TYPE.THERMAL_TECHNICAL_MODULATION_PARAMETER,
        ];
        resultObject = await fetchTrajectoriesFromTypes(id, types);

        const specificAreas: DbTrajectory[] =
          resultObject?.[TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER] ?? [];
        const paraModulationTrajectory =
          resultObject?.[TRAJECTORY_TYPE.THERMAL_TECHNICAL_MODULATION_PARAMETER]?.[0] ??
          buildEmptyTrajectory('', TRAJECTORY_TYPE.THERMAL_TECHNICAL_MODULATION_PARAMETER);
        const paraCommonTrajectory =
          resultObject?.[TRAJECTORY_TYPE.THERMAL_TECHNICAL_COMMON_PARAMETER]?.[0] ??
          buildEmptyTrajectory('', TRAJECTORY_TYPE.THERMAL_TECHNICAL_COMMON_PARAMETER);
        const defaultEmptyAreas =
          buildDefaultEmptyTrajectoryList(
            TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER,
            specificAreas,
            defaultAreas,
          ) ?? [];

        const allAreas = [...(specificAreas || []), ...emptyAreaSelected, ...defaultEmptyAreas];
        const arrayWithoutDuplicate =
          emptyAreaSelected.length > 0 || defaultEmptyAreas.length > 0 ? removeDuplicate(allAreas) : allAreas;

        dispatch?.({
          type: STUDY_ACTION.ADD_TRAJECTORIES,
          payload: {
            [TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER]: {
              trajectories: arrayWithoutDuplicate,
            },
            [TRAJECTORY_TYPE.THERMAL_TECHNICAL_MODULATION_PARAMETER]: { trajectories: [paraModulationTrajectory] },
            [TRAJECTORY_TYPE.THERMAL_TECHNICAL_COMMON_PARAMETER]: { trajectories: [paraCommonTrajectory] },
          },
        });

        // Build checklist for dropdown list
        const resultList = buildCheckListBox(arrayWithoutDuplicate, areas, defaultAreas);
        resultList?.areaOptions && setAreasTrajectoryOptions(resultList?.areaOptions);
        setDropDownListOptions(resultList?.checkedValues);

        // Build row data for hypothesis table
        // Find default area not included in areas trajectory list
        const defaultAreaListNotInList: string[] = getDefaultAreaNotIncludedInAreaList(defaultAreas ?? [], areas);

        // Hypothesis table
        const specificAreaData = convertIntoHypothesisRowWithTechnologies(
          arrayWithoutDuplicate,
          defaultAreaListNotInList,
          defaultAreas,
          [],
          TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER,
        );

        const specificAreaSelected = isStudyGenerated
          ? specificAreaData.filter(
              (area) => area.isDefault || (area.trajectory && area.status === TRAJECTORY_SELECTION_STATUS.OK),
            )
          : specificAreaData;
        const dataTrajectories = [
          {
            hypothesis: t('thermal.@specific'),
            trajectory: null,
            status: TRAJECTORY_SELECTION_STATUS.MISSING,
            isDefault: false,
            isDeletable: false,
            subRows: sortWithFixedPosition(specificAreaSelected),
          },
          {
            hypothesis: t('thermal.@paramModulation'),
            trajectory: paraModulationTrajectory ?? null,
            status: paraModulationTrajectory?.trajectoryName
              ? TRAJECTORY_SELECTION_STATUS.OK
              : TRAJECTORY_SELECTION_STATUS.MISSING,
            isDefault: false,
            isDeletable: false,
            subRows: null,
          },
          {
            hypothesis: t('thermal.@common'),
            trajectory: paraCommonTrajectory ?? null,
            status: paraCommonTrajectory?.trajectoryName
              ? TRAJECTORY_SELECTION_STATUS.OK
              : TRAJECTORY_SELECTION_STATUS.MISSING,
            isDefault: false,
            isDeletable: false,
            subRows: null,
          },
        ];
        setHypothesisTrajectories(dataTrajectories);
        if (isStudyGenerated) {
          const rows = generateReadOnlyIndexMap(dataTrajectories);
          setReadOnlyRow(rows);
        } else {
          const readOnlyRows = retrieveReadOnlyArea(dataTrajectories[0].subRows ?? [], defaultAreaListNotInList);
          const hasSpecificTrajectory = dataTrajectories[0].subRows?.some(
            (row) => row.status === TRAJECTORY_SELECTION_STATUS.OK,
          );
          const readOnlySubRows = transformToSubRowKeys(readOnlyRows);
          let isRequired = false;
          if (hasSpecificTrajectory) {
            isRequired = await isParamModulationRequired(id, horizon);
          }
          const next = { ...readOnlySubRows, ['1']: !isRequired };
          setReadOnlyRow(next);
        }
      } catch (error) {
        console.error('============= error', error);
      }
    },
    [areas, defaultAreas, isStudyGenerated, emptyAreaSelected, dispatch, t],
  );

  useEffect(() => {
    if (studyData?.id != null && studyData?.horizon) {
      void fetchAreas(studyData.id, studyData?.horizon);
    }
  }, [studyData?.id, studyData?.horizon]);

  return { hypothesisTrajectories, areasTrajectoryOptions, dropDownListOptions, readOnlyRow };
};
