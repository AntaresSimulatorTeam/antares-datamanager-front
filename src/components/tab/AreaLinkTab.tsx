/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { ReadOnlyObject } from '@common/data/stdTable/types/readOnly.type';
import { useNewStudyModal } from '@/hooks/useNewStudyModal.ts';
import { useTranslation } from 'react-i18next';
import {
  getStudyTrajectoriesWithWarnings,
  linkTrajectoryToStudy,
  unlinkAllTrajectoriesFromStudy,
  unlinkTrajectoryFromStudy,
} from '@/shared/services/trajectoryService.ts';
import { TRAJECTORY_SELECTION_STATUS, TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import {
  DbTrajectory,
  HypothesisRowData,
  LocationStudy,
  RowStatus,
  SelectOption,
  StudyActionType,
  TrajectoryBackendError,
  TrajectoryViewData,
} from '@/shared/types';
import { ImportTrajectoryModal } from '@common/modal/ImportTrajectoryModal.tsx';
import { useStudy, useStudyDispatch } from '@/store/contexts/StudyContext';
import { STUDY_ACTION } from '@/shared/enum/study.ts';
import { buildErrorTrajectory, getStatus } from '@/shared/utils/trajectoryUtils.ts';
import { TrajectoryDataVisualisation } from '@common/modal/TrajectoryDataVisualisation.tsx';
import { useLocation } from 'react-router-dom';
import { useUser } from '@/store/contexts/UserContext.tsx';
import { notifyAlert } from '@/shared/notification/notification.tsx';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps.ts';
import { AreaDeletionConfirmationModal } from '@common/modal/AreaDeletionConfirmationModal.tsx';
import { StudyStatus } from '@/shared/types/common/StudyStatus.type.ts';
import { PegaseHypothesisTable } from '@common/layout/PegaseHypothesisTable/PegaseHypothesisTable.tsx';
import { useTrajectoryImport } from '@/hooks/useTrajectoryImport.ts';
import {
  handleFetchTrajectoriesFS,
  handleTrajectorySearch,
  handleViewTrajectory,
} from '@/shared/services/hypothesisTableService.ts';
import { getReadOnlyForGeneratedStudy } from '@/shared/helpers/hypothesisTableHelper.ts';
import getEditableHypothesisTableHeaders from '@/components/header/EditableHypothesisTableHeaders.tsx';
import { useFetchFixHypothesisTrajectories } from '@/hooks/useFetchFixHypothesisTrajectories.ts';

interface AreaLinkTabProps {
  setErrorMessage: Dispatch<SetStateAction<string>>;
}

export const AreaLinkTab = ({ setErrorMessage }: AreaLinkTabProps) => {
  const studyState = useStudy();
  const location = useLocation();
  const study = (location.state as LocationStudy)?.study;
  const { isModalOpen, toggleModal } = useNewStudyModal();
  const dispatch = useStudyDispatch();
  const { t } = useTranslation();
  const { user } = useUser();
  const [optionsFS, setOptionsFS] = useState<SelectOption[]>();
  const [rowIdSelected, setRowIdSelected] = useState<string>('0');
  const [trajectoryData, setTrajectoryData] = useState<TrajectoryViewData | undefined>();
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [data, setData] = useState<HypothesisRowData[]>([]);
  const [readOnly, setReadOnly] = useState<ReadOnlyObject>({ '0': false, '1': true });
  const [dbTrajectories, setDbTrajectories] = useState<DbTrajectory[]>([]);
  const [isAreaDeletionConfirmOpen, setIsAreaDeletionConfirmOpen] = useState(false);
  const [isStudyGenerated, setIsStudyGenerated] = useState(
    studyState.studyStatus === StudyStatus.GENERATED || study.status === StudyStatus.GENERATED,
  );

  const configs = [
    { type: TRAJECTORY_TYPE.AREA, labelKey: t('studyDetails.@areas') },
    { type: TRAJECTORY_TYPE.LINK, labelKey: t('studyDetails.@links') },
  ];
  const options = { withReadOnlyRow: true, isStudyGenerated };
  const { hypothesisTrajectories, readOnlyRow } = useFetchFixHypothesisTrajectories(configs, options, study?.id);
  const { fileStatus, progress, importTrajectory } = useTrajectoryImport(study, studyState, dispatch, setReadOnly);

  useEffect(() => {
    setErrorMessage('');
    hypothesisTrajectories && setData(hypothesisTrajectories);
    readOnlyRow && setReadOnly(readOnlyRow);
  }, [hypothesisTrajectories, readOnlyRow, setErrorMessage]);

  useEffect(() => {
    if (isStudyGenerated) {
      setIsStudyGenerated(true);
      const rows = getReadOnlyForGeneratedStudy(data);
      setReadOnly(rows);
    }
  }, [isStudyGenerated]);

  const handleTrajectoryError = async (
    rowIndex: number,
    trajectoryId: number,
    trajectoryLabel: string,
    errorMessage?: string,
  ): Promise<void> => {
    try {
      const newDbTrajectory = buildErrorTrajectory(
        rowIndex === 0 ? TRAJECTORY_TYPE.AREA : TRAJECTORY_TYPE.LINK,
        trajectoryId,
        trajectoryLabel,
        user?.profile?.sub ?? null,
        '',
      );

      //Case: area control failed and a trajectory Links is linked to the study with ok status
      const shouldUnlink =
        rowIndex === 0 && data[1]?.trajectory && data[1]?.status !== TRAJECTORY_SELECTION_STATUS.ERROR;
      if (shouldUnlink && data[1]?.trajectory?.id) {
        await unlinkTrajectoryFromStudy(data[1]?.trajectory?.id, study.id);
        dispatch?.({
          type: STUDY_ACTION.CLEAR_TRAJECTORY_BY_TYPE,
          payload: [TRAJECTORY_TYPE.LINK],
        } as StudyActionType);
      }
      setData((prev) =>
        prev.map((item, index) => {
          if (index === rowIndex) {
            return {
              ...item,
              trajectory: newDbTrajectory,
              status: TRAJECTORY_SELECTION_STATUS.ERROR,
            };
          } else if (shouldUnlink) {
            return {
              ...item,
              trajectory: null,
              status: TRAJECTORY_SELECTION_STATUS.MISSING,
            };
          } else {
            return item;
          }
        }),
      );

      setReadOnly({ '0': false, '1': false });
      notifyAlert({
        icon: StdIconId.Close,
        message: t('studyDetails.@notificationAlert', {
          studyName: study?.name ?? '',
          trajectoryName: trajectoryLabel,
          trajectoryType: rowIndex === 0 ? TRAJECTORY_TYPE.AREA : TRAJECTORY_TYPE.LINK,
        }),
        content: errorMessage,
        type: 'error',
        filledIcon: true,
      });
    } catch {
      //Silent handler
    }
  };

  const unlinkWithConfirmationCheck = async (trajectoryId: number, rowId: string): Promise<void> => {
    const rowIndex = Number(rowId);
    try {
      await unlinkTrajectoryFromStudy(trajectoryId, study.id);
      setErrorMessage(t('studyDetails.@add_trajectories_message'));
      dispatch?.({
        type: STUDY_ACTION.CLEAR_TRAJECTORY_BY_TYPE,
        payload: rowIndex === 0 ? [TRAJECTORY_TYPE.AREA] : [TRAJECTORY_TYPE.LINK],
      });
      const hasLinks = rowIndex === 0 && data[1].trajectory;
      setData((prev) =>
        prev.map((item, index) =>
          index === rowIndex || hasLinks
            ? {
                ...item,
                trajectory: null,
                status: TRAJECTORY_SELECTION_STATUS.MISSING,
              }
            : item,
        ),
      );
      setReadOnly({ '0': false, '1': rowIndex === 0 });
    } catch (error) {
      if ((error as TrajectoryBackendError).message.includes('Confirmation required')) {
        setRowIdSelected(rowId);
        setIsAreaDeletionConfirmOpen(true);
      }
    }
  };

  const handleTrajectoryDeletion = async (rowId: string, status: RowStatus, trajectoryId: number) => {
    const rowIndex = Number(rowId);
    if (status === 'empty') {
      await unlinkWithConfirmationCheck(trajectoryId, rowId);
    } else if (status === 'emptyError') {
      setData((prev) =>
        prev.map((item, index) =>
          index === rowIndex
            ? {
                ...item,
                trajectory: null,
                status: TRAJECTORY_SELECTION_STATUS.MISSING,
              }
            : item,
        ),
      );
    }
  };

  const handleConfirmedAreaDeletion = async () => {
    await unlinkAllTrajectoriesFromStudy(study.id);

    dispatch?.({ type: STUDY_ACTION.RESET_STUDY_STATE });
    setData([
      { hypothesis: t('studyDetails.@areas'), trajectory: null, status: TRAJECTORY_SELECTION_STATUS.MISSING },
      { hypothesis: t('studyDetails.@links'), trajectory: null, status: TRAJECTORY_SELECTION_STATUS.MISSING },
    ]);

    setReadOnly({ '0': false, '1': true });
    setIsAreaDeletionConfirmOpen(false);
    setErrorMessage(t('studyDetails.@add_trajectories_message'));
  };

  const handleTrajectoryUpdate = async (rowId: string, value: string, status: RowStatus) => {
    const rowIndex = Number(rowId);
    const trajectory = data[rowIndex]?.trajectory;
    const dbTrajectory = dbTrajectories.find((item) => item.trajectoryName === value) ?? trajectory;
    try {
      if (dbTrajectory?.id != null && status === 'success') {
        setErrorMessage('');
        const trajectoryType = rowIndex === 0 ? TRAJECTORY_TYPE.AREA : TRAJECTORY_TYPE.LINK;
        await linkTrajectoryToStudy(trajectoryType, dbTrajectory?.id, study.id);
        const result = await getStudyTrajectoriesWithWarnings(study.id, trajectoryType);
        const newTrajectory = result?.trajectories?.[0];
        if (newTrajectory) {
          dispatch?.({
            type: STUDY_ACTION.ADD_TRAJECTORIES,
            payload: { [trajectoryType]: result },
          });
        }
        setData((prev) =>
          prev.map((item, index) =>
            index === rowIndex
              ? {
                  ...item,
                  trajectory: newTrajectory ?? null,
                  status: getStatus(newTrajectory ? status : 'empty'),
                }
              : item,
          ),
        );
        setReadOnly({ '0': false, '1': false });
      }

      // Handle deletion case for areas
      if (rowIndex != null && dbTrajectory?.id != null && (status === 'empty' || status === 'emptyError')) {
        await handleTrajectoryDeletion(rowId, status, dbTrajectory?.id);
      }
    } catch (error) {
      if (rowIndex != null && dbTrajectory?.id != null) {
        await handleTrajectoryError(
          rowIndex,
          dbTrajectory?.id,
          dbTrajectory.trajectoryName ?? '',
          (error as Error).message,
        );
      }
    }
  };

  return (
    <div className="flex h-fit w-full">
      <PegaseHypothesisTable
        id="area-link-table"
        columnHeader={t('studyDetails.@hypothesis')}
        data={data}
        getTableHeaders={getEditableHypothesisTableHeaders}
        fileStatus={fileStatus}
        studyState={studyState?.studyStatus ?? StudyStatus.IN_PROGRESS}
        readOnly={readOnly}
        isReadOnlyEnable={true}
        progress={progress}
        idSelected={String(rowIdSelected)}
        updateData={(rowId: string, value: unknown, status: RowStatus) =>
          void handleTrajectoryUpdate(rowId, value as string, status)
        }
        handleSearch={async (value: string, rowId: string) => {
          const index = Number(rowId);
          const type = index === 0 ? TRAJECTORY_TYPE.AREA : TRAJECTORY_TYPE.LINK;
          return await handleTrajectorySearch(type, value, '', setDbTrajectories, study);
        }}
        handleImport={async (rowId: string) =>
          await handleFetchTrajectoriesFS(
            Number(rowId) === 0 ? TRAJECTORY_TYPE.AREA : TRAJECTORY_TYPE.LINK,
            rowId,
            setOptionsFS,
            setRowIdSelected,
            toggleModal,
            data[Number(rowId)]?.hypothesis,
          )
        }
        handleViewData={(rowId: string) => {
          const index = Number(rowId);
          const trajectory = data[index].trajectory;
          if (trajectory) {
            void handleViewTrajectory(trajectory, setTrajectoryData, setIsViewModalOpen, t);
          }
        }}
      />
      {isModalOpen && (
        <ImportTrajectoryModal
          options={optionsFS}
          onClose={async (value?: SelectOption) => {
            toggleModal();
            if (value != null) {
              await importTrajectory(
                rowIdSelected === '0' ? TRAJECTORY_TYPE.AREA : TRAJECTORY_TYPE.LINK,
                value,
                [Number(rowIdSelected)],
                data,
                setData,
              );
            }
          }}
          trajectoryType={rowIdSelected === '0' ? TRAJECTORY_TYPE.AREA : TRAJECTORY_TYPE.LINK}
          area={rowIdSelected === '0' ? TRAJECTORY_TYPE.AREA : TRAJECTORY_TYPE.LINK}
        />
      )}
      {isViewModalOpen && trajectoryData && (
        <TrajectoryDataVisualisation trajectoryData={trajectoryData} onClose={() => setIsViewModalOpen(false)} />
      )}
      <AreaDeletionConfirmationModal
        isOpen={isAreaDeletionConfirmOpen}
        onClose={() => setIsAreaDeletionConfirmOpen(false)}
        onConfirm={handleConfirmedAreaDeletion}
      />
    </div>
  );
};
