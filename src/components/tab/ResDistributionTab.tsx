/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { DbTrajectory, HypothesisRowData, RowStatus, SelectOption, TabProps } from '@/shared/types';
import { useEffect, useState } from 'react';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { useStudy, useStudyDispatch } from '@/store/contexts/StudyContext.tsx';
import { ReadOnlyObject } from '@common/data/stdTable/types/readOnly.type';
import { getAreaTrajectoryName, getRowDataSelected } from '@/shared/utils/trajectoryUtils.ts';
import { StudyStatus } from '@/shared/types/common/StudyStatus.type.ts';
import { PegaseHypothesisTable } from '@common/layout/PegaseHypothesisTable/PegaseHypothesisTable.tsx';
import getExpandableHypothesisTableHeaders from '@/components/header/ExpandableHypothesisTableHeaders.tsx';
import { ImportTrajectoryModal } from '@common/modal/ImportTrajectoryModal.tsx';
import { useNewStudyModal } from '@/hooks/useNewStudyModal.ts';
import { handleTrajectorySearch } from '@/shared/services/hypothesisTableService.ts';
import { useTrajectoryImport } from '@/hooks/useTrajectoryImport.ts';
import { useTrajectoryAttach } from '@/hooks/useTrajectoryAttach.ts';
import { useTrajectoryDetach } from '@/hooks/useTrajectoryDetach.ts';
import { useFetchHypothesisTrajectories } from '@/hooks/useFetchHypothesisTrajectories.ts';
import { useTranslation } from 'react-i18next';
import getEditableHypothesisTableHeaders from '@/components/header/EditableHypothesisTableHeaders.tsx';
import { snakeCaseUnderscore } from '@/shared/utils/textUtils.ts';

const ResDistributionTab = ({ defaultAreas, areas, studyData }: TabProps) => {
  const studyState = useStudy();
  const dispatch = useStudyDispatch();
  const { t } = useTranslation();
  const [data, setData] = useState<HypothesisRowData[]>([]);
  const [technologyData, setTechnologyData] = useState<HypothesisRowData[]>([]);
  const [rowIdSelected, setRowIdSelected] = useState<string>('0');
  const [readOnly, setReadOnly] = useState<ReadOnlyObject>({});
  const [technologies, setTechnologies] = useState<string[]>([]);
  const { isModalOpen, toggleModal } = useNewStudyModal();
  const [dbTrajectories, setDbTrajectories] = useState<DbTrajectory[]>([]);
  const [selectedType, setSelectedType] = useState<TRAJECTORY_TYPE>(TRAJECTORY_TYPE.RES_ZONAL_DISTRIBUTION);
  const types = [TRAJECTORY_TYPE.RES_ZONAL_DISTRIBUTION, TRAJECTORY_TYPE.RES_TECHNOLOGY_DISTRIBUTION];
  const { hypothesisTrajectories, readOnlyRow, technologyList } = useFetchHypothesisTrajectories(
    areas,
    types,
    defaultAreas,
    studyData?.id,
    studyData?.status,
    studyState.studyStatus,
  );
  const { fileStatus, progress, importTrajectory } = useTrajectoryImport(studyData, studyState, dispatch);
  const { attachTrajectory } = useTrajectoryAttach(studyData, studyState, dispatch);
  const { detachTrajectory } = useTrajectoryDetach(studyData, dispatch);

  useEffect(() => {
    const zonalData = hypothesisTrajectories?.[TRAJECTORY_TYPE.RES_ZONAL_DISTRIBUTION];
    zonalData && setData(zonalData);
    const technologyResData = hypothesisTrajectories?.[TRAJECTORY_TYPE.RES_TECHNOLOGY_DISTRIBUTION];
    technologyResData && setTechnologyData(technologyResData);
    const resTechnologies = technologyList?.[TRAJECTORY_TYPE.RES_TECHNOLOGY_DISTRIBUTION];
    resTechnologies && setTechnologies(resTechnologies);
    const resReadOnly = readOnlyRow?.[TRAJECTORY_TYPE.RES_ZONAL_DISTRIBUTION];
    resReadOnly && setReadOnly(resReadOnly);
  }, [hypothesisTrajectories, technologyList, readOnlyRow, studyState.studyStatus]);

  return (
    <div className="flex h-fit w-full flex-col gap-6">
      <PegaseHypothesisTable
        id="zonal-distribution-table"
        columnHeader={t('res.@zonalDistribution')}
        data={data}
        getTableHeaders={getEditableHypothesisTableHeaders}
        fileStatus={fileStatus}
        isStudyGenerated={
          studyState.studyStatus === StudyStatus.GENERATED || studyData.status === StudyStatus.GENERATED
        }
        readOnly={readOnly}
        idSelected={rowIdSelected}
        progress={selectedType === TRAJECTORY_TYPE.RES_ZONAL_DISTRIBUTION ? progress : 0}
        handleSearch={async (fileNameContains: string, rowId: string) => {
          const indexArray = rowId.split('.').map(Number);
          const technology =
            indexArray?.length > 1 ? data[indexArray[0]]?.subRows?.[indexArray[1]]?.hypothesis : undefined;
          return await handleTrajectorySearch(
            TRAJECTORY_TYPE.RES_ZONAL_DISTRIBUTION,
            setDbTrajectories,
            studyData?.horizon,
            {
              area: data[indexArray[0]]?.hypothesis,
              technology,
              fileNameContains,
            },
          );
        }}
        handleImport={(rowId: string) => {
          setRowIdSelected(rowId);
          setSelectedType(TRAJECTORY_TYPE.RES_ZONAL_DISTRIBUTION);
          toggleModal();
        }}
        isReadOnlyEnable={true}
        updateData={(rowId: string, value: unknown, status: RowStatus) => {
          const indexArray = rowId.split('.').map(Number);
          if (status === 'empty' || status === 'emptyError') {
            const row = getRowDataSelected(data, indexArray) ?? null;
            if (row) {
              void detachTrajectory(
                TRAJECTORY_TYPE.RES_ZONAL_DISTRIBUTION,
                indexArray,
                setData,
                data,
                status,
                row?.hypothesis,
              );
            }
          } else if (status === 'success') {
            const dbTrajectory =
              dbTrajectories.length > 0
                ? dbTrajectories.find((item) => item.id === value)
                : getRowDataSelected(data, indexArray)?.trajectory;
            if (dbTrajectory) {
              void attachTrajectory(TRAJECTORY_TYPE.RES_ZONAL_DISTRIBUTION, indexArray, status, dbTrajectory, setData);
            }
          }
        }}
      />
      <PegaseHypothesisTable
        id="technology-distribution-table"
        columnHeader={t('res.@technologyDistribution')}
        data={technologyData}
        getTableHeaders={getExpandableHypothesisTableHeaders}
        fileStatus={fileStatus}
        isStudyGenerated={
          studyState.studyStatus === StudyStatus.GENERATED || studyData.status === StudyStatus.GENERATED
        }
        readOnly={readOnly}
        progress={selectedType === TRAJECTORY_TYPE.RES_TECHNOLOGY_DISTRIBUTION ? progress : 0}
        idSelected={rowIdSelected}
        type={TRAJECTORY_TYPE.RES_TECHNOLOGY_DISTRIBUTION}
        list={technologies}
        handleSearch={async (fileNameContains: string, rowId: string) => {
          const indexArray = rowId.split('.').map(Number);
          const technology =
            indexArray?.length > 1 ? technologyData[indexArray[0]]?.subRows?.[indexArray[1]]?.hypothesis : undefined;
          const formattedTechnology = technology ? snakeCaseUnderscore(technology) : undefined;
          return await handleTrajectorySearch(
            TRAJECTORY_TYPE.RES_TECHNOLOGY_DISTRIBUTION,
            setDbTrajectories,
            studyData?.horizon,
            {
              area: technologyData[indexArray[0]]?.hypothesis,
              technology: formattedTechnology,
              fileNameContains,
            },
          );
        }}
        handleImport={(rowId: string) => {
          setRowIdSelected(rowId);
          setSelectedType(TRAJECTORY_TYPE.RES_TECHNOLOGY_DISTRIBUTION);
          toggleModal();
        }}
        isReadOnlyEnable={true}
        updateData={(rowId: string, value: unknown, status: RowStatus) => {
          const indexArray = rowId.split('.').map(Number);
          if (status === 'empty' || status === 'emptyError') {
            const row = getRowDataSelected(technologyData, indexArray) ?? null;
            if (row) {
              void detachTrajectory(
                TRAJECTORY_TYPE.RES_TECHNOLOGY_DISTRIBUTION,
                indexArray,
                setTechnologyData,
                technologyData,
                status,
                row?.hypothesis,
              );
            }
          } else if (status === 'success') {
            const dbTrajectory =
              dbTrajectories.length > 0
                ? dbTrajectories.find((item) => item.id === value)
                : getRowDataSelected(technologyData, indexArray)?.trajectory;
            if (dbTrajectory) {
              void attachTrajectory(
                TRAJECTORY_TYPE.RES_TECHNOLOGY_DISTRIBUTION,
                indexArray,
                status,
                dbTrajectory,
                setTechnologyData,
              );
            }
          }
        }}
      />
      {isModalOpen && (
        <ImportTrajectoryModal
          isOpen={isModalOpen}
          onClose={async (value?: SelectOption) => {
            toggleModal();
            if (value != null) {
              const indexArray = rowIdSelected.split('.').map(Number);
              const dataToUse = selectedType === TRAJECTORY_TYPE.RES_ZONAL_DISTRIBUTION ? data : technologyData;
              const setterToUse = selectedType === TRAJECTORY_TYPE.RES_ZONAL_DISTRIBUTION ? setData : setTechnologyData;
              await importTrajectory(selectedType, value, indexArray, dataToUse, setterToUse);
            }
          }}
          trajectoryType={selectedType}
          hypothesis={getAreaTrajectoryName(
            rowIdSelected,
            selectedType === TRAJECTORY_TYPE.RES_ZONAL_DISTRIBUTION ? data : technologyData,
            selectedType,
          )}
        />
      )}
    </div>
  );
};

export default ResDistributionTab;
