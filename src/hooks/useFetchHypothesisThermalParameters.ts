import { TRAJECTORY_SELECTION_STATUS, TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { useStudy, useStudyDispatch } from '@/store/contexts/StudyContext.tsx';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckBoxData, DbTrajectory, HypothesisRowData, TrajectoryAreaData } from '@/shared/types';
import {
  buildDefaultEmptyTrajectoryList,
  buildRowWithSubRowsData,
  removeDuplicate,
  retrieveReadOnlyArea,
} from '@/shared/utils/trajectoryUtils.ts';
import { sortWithFixedPosition } from '@/shared/utils/sortUtils';
import { ReadOnlyObject } from '@common/data/stdTable/types/readOnly.type';
import { getReadOnlyForGeneratedStudy } from '@/shared/helpers/hypothesisTableHelper.ts';
import {
  buildCheckListBox,
  getDefaultAreaNotIncludedInAreaList,
  transformToSubRowKeys,
} from '@/shared/utils/hypothesisTableUtils.ts';
import { useTranslation } from 'react-i18next';
import { getStudyTrajectories } from '@/shared/services/studyService.ts';
import { STUDY_ACTION } from '@/shared/enum/study.ts';

export const useFetchHypothesisThermalParameters = (
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
  const { t } = useTranslation();
  const emptyAreaSelected = useMemo(
    () =>
      mainType
        ? (studyState?.[mainType]?.trajectories.find(
            (traj) => traj.type === TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER,
          ) ?? [])
        : [],
    [mainType],
  );

  const fetchAreas = useCallback(
    async (id: number, trajectoryType: TRAJECTORY_TYPE, types: TRAJECTORY_TYPE[]) => {
      try {
        // Fetch trajectories but not warnings
        const arrayResults: { type: TRAJECTORY_TYPE; data: DbTrajectory[] }[] = await Promise.all(
          types.map(async (thermalType: TRAJECTORY_TYPE) => ({
            type: thermalType,
            data: await getStudyTrajectories(id, thermalType),
          })),
        );
        const temporaryResult = arrayResults.flat().reduce(
          (acc, { type, data }) => {
            acc[type] = data;
            return acc;
          },
          {} as Record<TRAJECTORY_TYPE, DbTrajectory[]>,
        );
        const defaultEmptyAreas =
          buildDefaultEmptyTrajectoryList(
            TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER,
            temporaryResult.THERMAL_TECHNICAL_SPECIFIC_PARAMETER,
            defaultAreas,
          ) ?? [];
        const allSpecificTrajectories =
          temporaryResult.THERMAL_TECHNICAL_SPECIFIC_PARAMETER?.concat(emptyAreaSelected).concat(defaultEmptyAreas);
        const specificTrajectories = removeDuplicate(allSpecificTrajectories);

        const paraModulationTrajectory = temporaryResult.THERMAL_TECHNICAL_MODULATION_PARAMETER?.[0];
        const paraCommonTrajectory = temporaryResult.THERMAL_TECHNICAL_COMMON_PARAMETER?.[0];

        dispatch?.({
          type: STUDY_ACTION.ADD_TRAJECTORIES,
          payload: {
            [trajectoryType]: {
              trajectories: [...specificTrajectories, paraModulationTrajectory, paraCommonTrajectory],
            },
          },
        });

        // Build checklist for dropdown list
        const resultList = buildCheckListBox(specificTrajectories, areas, defaultAreas);
        resultList?.areaOptions && setAreasTrajectoryOptions(resultList?.areaOptions);
        setDropDownListOptions(resultList?.checkedValues);

        // Build row data for hypothesis table
        // Find default area not included in areas trajectory list
        const defaultAreaListNotIncludedInList: string[] = defaultAreas
          ? getDefaultAreaNotIncludedInAreaList(defaultAreas, areas)
          : [];

        // Hypothesis table
        const specificAreaSubRows: HypothesisRowData[] = specificTrajectories
          .map((trajectory) =>
            buildRowWithSubRowsData(trajectory, defaultAreas, defaultAreaListNotIncludedInList, null),
          )
          .filter(Boolean);

        const dataTrajectories: HypothesisRowData[] = [
          {
            hypothesis: t('thermal.@specific'),
            trajectory: null,
            status: TRAJECTORY_SELECTION_STATUS.MISSING,
            isDefault: false,
            isDeletable: false,
            subRows: sortWithFixedPosition(specificAreaSubRows),
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
        setHypothesisTrajectories(dataTrajectories);

        if (isStudyGenerated) {
          const rows = getReadOnlyForGeneratedStudy(dataTrajectories);
          setReadOnlyRow(rows);
        } else {
          const readOnlyRows = retrieveReadOnlyArea(
            dataTrajectories?.[0]?.subRows ?? [],
            defaultAreaListNotIncludedInList,
          );
          const hasSpecificTrajectory = dataTrajectories[0].subRows?.some(
            (row) => row.status === TRAJECTORY_SELECTION_STATUS.OK,
          );
          const readOnlySubRows = transformToSubRowKeys(readOnlyRows);
          if (!hasSpecificTrajectory) {
            const next = { ...readOnlySubRows, ['1']: true };
            setReadOnlyRow(next);
          } else {
            setReadOnlyRow(readOnlySubRows);
          }
        }
      } catch (error) {
        console.error('============= error', error);
      }
    },
    [areas, defaultAreas, isStudyGenerated, emptyAreaSelected, dispatch, t],
  );

  useEffect(() => {
    if (studyId != null && mainType) {
      void fetchAreas(studyId, mainType, subTypes);
    }
  }, [studyId, mainType]);

  return { hypothesisTrajectories, areasTrajectoryOptions, dropDownListOptions, readOnlyRow };
};
