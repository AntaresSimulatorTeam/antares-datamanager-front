/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ReadOnlyObject } from '@common/data/stdTable/types/readOnly.type';
import { useNewStudyModal } from '@/hooks/useNewStudyModal.ts';
import { useTranslation } from 'react-i18next';
import {
  getTrajectoryDataByTypeAndId,
  linkTrajectoryToStudy,
  unlinkAllTrajectoriesFromStudy,
  unlinkMultipleTrajectoriesFromStudy,
} from '@/shared/services/trajectoryService.ts';
import { TRAJECTORY_SELECTION_STATUS, TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import {
  DbTrajectory,
  DropdownItemOption,
  HypothesisRowData,
  isTrajectoryConfigurationType,
  RowStatus,
  StudyDTO,
  TrajectoryViewData,
} from '@/shared/types';
import { ImportTrajectoryModal } from '@common/modal/ImportTrajectoryModal.tsx';
import { useStudy, useStudyDispatch } from '@/store/contexts/StudyContext';
import { STUDY_ACTION } from '@/shared/enum/study.ts';
import {
  buildReadOnlyRow,
  buildTableData,
  hasFlowbasedPrerequisites,
  hasLinkWithHvdcCapacities,
} from '@/shared/utils/trajectoryUtils.ts';
import { TrajectoryDataVisualisation } from '@common/modal/TrajectoryDataVisualisation.tsx';
import { AreaDeletionConfirmationModal } from '@common/modal/AreaDeletionConfirmationModal.tsx';
import { StudyStatus } from '@/shared/types/common/StudyStatus.type.ts';
import { PegaseHypothesisTable } from '@common/layout/PegaseHypothesisTable/PegaseHypothesisTable.tsx';
import { useTrajectoryImport } from '@/hooks/useTrajectoryImport.ts';
import { handleViewTrajectory } from '@/shared/services/hypothesisTableService.ts';
import { getParamForFetchFSTrajectory } from '@/shared/helpers/hypothesisTableHelper.ts';
import getEditableHypothesisTableHeaders from '@/components/header/EditableHypothesisTableHeaders.tsx';
import { useFetchFixHypothesisTrajectories } from '@/hooks/useFetchFixHypothesisTrajectories.ts';
import { useTrajectorySearchHandler } from '@/hooks/useTrajectorySearchHandler.ts';
import { useTrajectoryFetchFromFSHandler } from '@/hooks/useTrajectoryFetchFromFSHandler.ts';
import { useHypothesisTableUpdateHandler } from '@/hooks/useHypothesisTableUpdateHandler.ts';
import { updateStudy } from '@/shared/services/studyService.ts';
import { HypothesisType } from '@/shared/types/HypothesisTable.ts';
import getExpandableHypothesisTableHeaders from '@/components/header/ExpandableHypothesisTableHeaders.tsx';
import { notifyAlert } from '@/shared/notification/notification.tsx';
import {
  hasSelectedFlowbasedTrajectory,
  performLinkTrajectoryChange,
} from '@/shared/helpers/linkTrajectoryChangeHelper.ts';

interface PendingLinkChange {
  replacement?: DbTrajectory;
}

interface AreaLinkTabProps {
  studyData: StudyDTO;
}

export const AreaLinkTab = ({ studyData }: AreaLinkTabProps) => {
  const studyState = useStudy();
  const { isModalOpen, toggleModal } = useNewStudyModal();
  const dispatch = useStudyDispatch();
  const { t } = useTranslation();
  const [optionsFS, setOptionsFS] = useState<DropdownItemOption[] | undefined>();
  const [rowIdSelected, setRowIdSelected] = useState<string>('0');
  const [trajectoryData, setTrajectoryData] = useState<TrajectoryViewData | undefined>();
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [data, setData] = useState<HypothesisRowData[]>([]);
  const [settingsData, setSettingsData] = useState<HypothesisRowData[]>([]);
  const [readOnly, setReadOnly] = useState<ReadOnlyObject>({ '0': false, '1': true });
  const [readOnlySettings, setReadOnlySettings] = useState<ReadOnlyObject>({ '0': true, '1': true, '2.0': true, '2.1': true });
  const [dbTrajectories, setDbTrajectories] = useState<DbTrajectory[]>([]);
  const [isDeletionModalOpen, setIsDeletionModalOpen] = useState(false);
  const [pendingLinkChange, setPendingLinkChange] = useState<PendingLinkChange | null>(null);
  const [isLinkChangePending, setIsLinkChangePending] = useState(false);
  const [hasValidHvdcLinkData, setHasValidHvdcLinkData] = useState(false);
  const [isHvdcLinkDataLoading, setIsHvdcLinkDataLoading] = useState(true);
  const linkChangeInFlight = useRef(false);
  const [selectedTrajectoryType, setSelectedTrajectoryType] = useState<TRAJECTORY_TYPE>(TRAJECTORY_TYPE.AREA);
  const [isStudyGenerated, setIsStudyGenerated] = useState(
    studyState.studyStatus === StudyStatus.GENERATED || studyData?.status === StudyStatus.GENERATED,
  );
  const isFlowbasedPrerequisiteMet = useMemo(
    () => hasValidHvdcLinkData && !isHvdcLinkDataLoading && hasFlowbasedPrerequisites(data[1]),
    [data, hasValidHvdcLinkData, isHvdcLinkDataLoading],
  );
  const flowbasedReadOnlySettings = useMemo(
    () => ({
      ...readOnlySettings,
      '1': isStudyGenerated || isLinkChangePending || !isFlowbasedPrerequisiteMet,
    }),
    [isFlowbasedPrerequisiteMet, isLinkChangePending, isStudyGenerated, readOnlySettings],
  );

  const configs = useMemo(
    () => [[
      { type: TRAJECTORY_TYPE.AREA, labelKey: t('studyDetails.@areas') },
      { type: TRAJECTORY_TYPE.LINK, labelKey: t('studyDetails.@links'), options: {hasHvdcOption: true} },
    ],[
      { type: TRAJECTORY_TYPE.ADEQUACY_PATCH, labelKey: t('settings.@adequacyPatch') },
      { type: TRAJECTORY_TYPE.FLOWBASED, labelKey: t('settings.@flowBased'), options: {hasRecalculateOption: true} },
      { type: TRAJECTORY_TYPE.SETTINGS, labelKey: t('settings.@title'), subRows: [
        { type: TRAJECTORY_TYPE.SETTINGS, labelKey: t('settings.@generalData') },
        { type: TRAJECTORY_TYPE.SCENARIO_BUILDER, labelKey: t('settings.@scenarioBuilder') }]
      },
    ]],
    [t]
  );
  const options = useMemo(
    () => ({
      withReadOnlyRow: true,
    }),
    [],
  );
  const {
    firstTableData,
    firstTableReadOnlyRow,
    secondTableData,
    secondTableReadOnlyRow,
    refreshTrajectories,
  } = useFetchFixHypothesisTrajectories(configs, options, isStudyGenerated, studyData?.id);
  const { fileStatus, progress, importTrajectory } = useTrajectoryImport(studyData, dispatch);
  const { handleSearch } = useTrajectorySearchHandler({
    studyHorizon: studyData.horizon,
    setDbTrajectories,
  });
  const { handleFetchFromFS } = useTrajectoryFetchFromFSHandler();
  const { handleHypothesisTableUpdate } = useHypothesisTableUpdateHandler({
    studyData,
    setRowIdSelected,
    setIsDeletionModalOpen,
    dbTrajectories
  });

  useEffect(() => {
    firstTableData && setData(firstTableData);
    firstTableReadOnlyRow && setReadOnly(firstTableReadOnlyRow);
    secondTableData && setSettingsData(secondTableData);
    secondTableReadOnlyRow && setReadOnlySettings(secondTableReadOnlyRow);
  }, [firstTableData, firstTableReadOnlyRow, secondTableReadOnlyRow, studyData.id, secondTableData]);

  useEffect(() => {
    if (studyState.studyStatus === StudyStatus.GENERATED) {
      setIsStudyGenerated(true);
      setReadOnly(buildReadOnlyRow(['0', '1']));
      if (configs[1]) {
        setReadOnlySettings(buildReadOnlyRow(['0', '1', '2.0', '2.1']));
      }
    }
  }, [configs, studyState.studyStatus]);

  const validateLinkTrajectory = useCallback(
    async (linkTrajectory?: DbTrajectory | null) => {
      if (!linkTrajectory || linkTrajectory.type !== TRAJECTORY_TYPE.LINK) {
        setHasValidHvdcLinkData(false);
        setIsHvdcLinkDataLoading(false);
        return;
      }

      setHasValidHvdcLinkData(false);
      setIsHvdcLinkDataLoading(true);
      try {
        const linkData = await getTrajectoryDataByTypeAndId(TRAJECTORY_TYPE.LINK, linkTrajectory.id);
        setHasValidHvdcLinkData(hasLinkWithHvdcCapacities(linkData));
      } catch (error) {
        setHasValidHvdcLinkData(false);
        notifyAlert({
          message: t('flowbased.@linkDataError'),
          content: error instanceof Error ? error.message : String(error),
          type: 'error',
        });
      } finally {
        setIsHvdcLinkDataLoading(false);
      }
    },
    [t],
  );

  const linkTrajectoryId = data[1]?.trajectory?.id;
  const linkTrajectoryType = data[1]?.trajectory?.type;
  useEffect(() => {
    let isCurrentRequest = true;
    if (linkTrajectoryId == null || linkTrajectoryType !== TRAJECTORY_TYPE.LINK) {
      setHasValidHvdcLinkData(false);
      setIsHvdcLinkDataLoading(false);
      return;
    }

    setHasValidHvdcLinkData(false);
    setIsHvdcLinkDataLoading(true);
    void getTrajectoryDataByTypeAndId(TRAJECTORY_TYPE.LINK, linkTrajectoryId)
      .then((linkData) => {
        if (isCurrentRequest) setHasValidHvdcLinkData(hasLinkWithHvdcCapacities(linkData));
      })
      .catch((error: unknown) => {
        if (!isCurrentRequest) return;
        setHasValidHvdcLinkData(false);
        notifyAlert({
          message: t('flowbased.@linkDataError'),
          content: error instanceof Error ? error.message : String(error),
          type: 'error',
        });
      })
      .finally(() => {
        if (isCurrentRequest) setIsHvdcLinkDataLoading(false);
      });

    return () => {
      isCurrentRequest = false;
    };
  }, [linkTrajectoryId, linkTrajectoryType, t]);

  const reloadAfterLinkChangeError = useCallback(
    async (error: unknown) => {
      notifyAlert({
        message: t('studyDetails.@notificationAlert', {
          studyName: studyData.name,
          trajectoryName: data[1]?.trajectory?.trajectoryName ?? '',
          trajectoryType: 'LINK',
        }),
        content: error instanceof Error ? error.message : String(error),
        type: 'error',
      });
      try {
        const refreshed = await refreshTrajectories();
        await validateLinkTrajectory(refreshed.firstTableData[1]?.trajectory);
      } catch (reloadError) {
        setHasValidHvdcLinkData(false);
        setIsHvdcLinkDataLoading(false);
        notifyAlert({
          message: t('flowbased.@associationsReloadError'),
          content: reloadError instanceof Error ? reloadError.message : String(reloadError),
          type: 'error',
        });
      }
    },
    [data, refreshTrajectories, studyData.name, t, validateLinkTrajectory],
  );

  const applyLinkChange = useCallback(
    async (replacement?: DbTrajectory) => {
      const linkTrajectory = data[1]?.trajectory;
      if (
        linkChangeInFlight.current ||
        !linkTrajectory ||
        linkTrajectory.type !== TRAJECTORY_TYPE.LINK
      ) {
        return;
      }

      const flowbasedRow = settingsData[1];
      const flowbasedTrajectory = hasSelectedFlowbasedTrajectory(flowbasedRow)
        ? flowbasedRow.trajectory
        : null;
      linkChangeInFlight.current = true;
      setIsLinkChangePending(true);
      setHasValidHvdcLinkData(false);
      setIsHvdcLinkDataLoading(true);

      try {
        await performLinkTrajectoryChange({
          studyId: studyData.id,
          linkTrajectory,
          flowbasedTrajectory,
          replacement,
          detach: unlinkMultipleTrajectoriesFromStudy,
          resetStudyOptions: async (id, hasFlowbased) =>
            await updateStudy(
              { hvdc: false, ...(hasFlowbased && { recalculate: false }) },
              id,
            ),
          associate: async (id, trajectory) =>
            await linkTrajectoryToStudy(TRAJECTORY_TYPE.LINK, trajectory.id, id),
          onDetached: () => {
            setData((prev) =>
              prev.map((row, index) =>
                index === 1
                  ? { ...row, trajectory: null, status: TRAJECTORY_SELECTION_STATUS.MISSING, hvdc: false }
                  : row,
              ),
            );
            setSettingsData((prev) =>
              prev.map((row, index) =>
                index === 1
                  ? {
                      ...row,
                      trajectory: null,
                      status: TRAJECTORY_SELECTION_STATUS.MISSING,
                      recalculate: false,
                    }
                  : row,
              ),
            );
            dispatch?.({
              type: STUDY_ACTION.CLEAR_TRAJECTORY_BY_TYPE,
              payload: [
                TRAJECTORY_TYPE.LINK,
                ...(flowbasedTrajectory ? [TRAJECTORY_TYPE.FLOWBASED] : []),
              ],
            });
          },
          onAssociationSucceeded: (linkedTrajectory) => {
          setData((prev) =>
            prev.map((row, index) =>
              index === 1
                ? { ...row, trajectory: linkedTrajectory, status: TRAJECTORY_SELECTION_STATUS.OK, hvdc: false }
                : row,
            ),
          );
          dispatch?.({
            type: STUDY_ACTION.UPDATE_TRAJECTORY,
          payload: { trajectory: linkedTrajectory, status: 'success' },
          });
          },
          onStudyOptionsResetError: (error) => {
            notifyAlert({
              message: t('flowbased.@studyOptionsUpdateError'),
              content: error instanceof Error ? error.message : String(error),
              type: 'error',
            });
          },
        });
      } catch (error) {
        await reloadAfterLinkChangeError(error);
      } finally {
        linkChangeInFlight.current = false;
        setIsLinkChangePending(false);
      }
    },
    [data, dispatch, reloadAfterLinkChangeError, settingsData, studyData.id, t],
  );

  const handleAreaTableUpdate = useCallback(
    async (rowId: string, value: unknown, status: RowStatus) => {
      const indexArray = rowId.split('.').map(Number);
      const isLinkRow = indexArray[0] === 1;
      const currentLink = data[1]?.trajectory;
      const replacement =
        status === 'success'
          ? dbTrajectories.find((trajectory) => trajectory.id === Number(value))
          : undefined;
      const isReplacingLink = Boolean(replacement && currentLink && replacement.id !== currentLink.id);
      const isDeletingLink = status === 'empty' && currentLink;

      if (isLinkRow && currentLink && (isDeletingLink || isReplacingLink)) {
        if (hasSelectedFlowbasedTrajectory(settingsData[1])) {
          setPendingLinkChange({ ...(replacement && { replacement }) });
        } else {
          await applyLinkChange(replacement);
        }
        return;
      }

      await handleHypothesisTableUpdate(
        rowId,
        value,
        status,
        TRAJECTORY_TYPE.AREA,
        data,
        setData,
        setReadOnly,
        setReadOnlySettings,
      );
    },
    [applyLinkChange, data, dbTrajectories, handleHypothesisTableUpdate, settingsData],
  );

  const confirmLinkChange = useCallback(async () => {
    if (!pendingLinkChange) return;
    await applyLinkChange(pendingLinkChange.replacement);
    setPendingLinkChange(null);
  }, [applyLinkChange, pendingLinkChange]);

  const flowbasedTooltipMessage =
    hasValidHvdcLinkData && !isHvdcLinkDataLoading
      ? t('flowbased.@informationMessage')
      : t('flowbased.@hvdcLinkRequired');

  const handleSelectionChange = useCallback(
    async (fileNameContains: string, rowId: string, type: TRAJECTORY_TYPE) => {
      const indexArray = rowId.split('.').map(Number);
      return await handleSearch(type, indexArray, { fileNameContains });
    },
    [handleSearch],
  );

  const handleFetchTrajectoryFromFs = useCallback(async (rowId: string, type: TRAJECTORY_TYPE) => {
    const dataToUse = isTrajectoryConfigurationType(type) ? settingsData : data;
    const { typeToUse, areaToUse, isDefaultArea } = getParamForFetchFSTrajectory(
      type,
      rowId,
      dataToUse,
    );
    setSelectedTrajectoryType(typeToUse);
    const results = await handleFetchFromFS({ typeToUse, areaToUse, isDefaultArea });
    setOptionsFS(results);
    setRowIdSelected(rowId);
    toggleModal();
  }, [data, handleFetchFromFS, settingsData, toggleModal]);

  const handleViewTrajectoryData = useCallback(
    (rowId: string) => {
      const index = Number(rowId);
      const trajectory = data[index].trajectory;
      if (trajectory) {
        void handleViewTrajectory(trajectory, setTrajectoryData, setIsViewModalOpen, t, studyState.areas);
      }
    },
    [data, studyState.areas, t],
  );

  const handleHvdcActivate = useCallback(
    async (value?: boolean) => {
      await updateStudy({ hvdc: value }, studyData.id);
      setData((prev) => prev.map((item, index) => (index === 1 ? { ...item, hvdc: value } : item)));
    },
    [studyData.id],
  );

  const handleRecalculateActivate = useCallback(
    async (value?: boolean) => {
      await updateStudy({ recalculate: value }, studyData.id);
      setSettingsData((prev) => prev.map((item, index) => (index === 1 ? { ...item, recalculate: value } : item)));
    },
    [studyData.id],
  );

  const handleConfirmedAreaDeletion = useCallback(async () => {
    await unlinkAllTrajectoriesFromStudy(studyData.id);
    void updateStudy({ hvdc: false }, studyData.id);

    setData(buildTableData(configs[0], t, [], {hvdc: false}));
    dispatch?.({
      type: STUDY_ACTION.CLEAR_TRAJECTORY_BY_TYPE,
      payload: [TRAJECTORY_TYPE.AREA],
    });
    setReadOnly({ '0': false, '1': true });

    setSettingsData(buildTableData(configs[1], t));
    setReadOnlySettings(buildReadOnlyRow(['0', '1', '2.0', '2.1']));

    setIsDeletionModalOpen(false);
  }, [configs, dispatch, studyData.id, t]);

  return (
    <div className="flex w-full flex-col gap-6 items-start">
      <div className="flex w-full flex-col gap-2 items-start">
        <div className="text-heading-xs font-medium">{t('studyDetails.@areas_links')}</div>
          <PegaseHypothesisTable
            id="area-link-table"
            columnHeader={t('studyDetails.@hypothesis')}
            data={data}
            getTableHeaders={getEditableHypothesisTableHeaders}
            fileStatus={fileStatus}
            isStudyGenerated={isStudyGenerated}
            isActionsDisabled={isLinkChangePending}
            readOnly={readOnly}
            isReadOnlyEnable={true}
            progress={isTrajectoryConfigurationType(selectedTrajectoryType) ? 0 : progress}
            idSelected={String(rowIdSelected)}
            handleSearch={async (fileNameContains: string, rowId: string) => await handleSelectionChange(fileNameContains, rowId, TRAJECTORY_TYPE.AREA)}
            updateData={async (rowId: string, value: unknown, status: RowStatus) =>
              await handleAreaTableUpdate(rowId, value, status)
            }
            handleImport={async (rowId: string) => await handleFetchTrajectoryFromFs(rowId, TRAJECTORY_TYPE.AREA)}
            handleViewData={handleViewTrajectoryData}
            activate={async (value?: boolean | string) => await handleHvdcActivate(value as boolean)}
            type={TRAJECTORY_TYPE.AREA}
          />
      </div>
      <div className="flex w-full flex-col gap-2 items-start">
        <div className="text-heading-xs font-medium">{t('studyDetails.@configuration')}</div>
          <PegaseHypothesisTable
            id="settings-table"
            columnHeader={t('studyDetails.@hypothesis')}
            data={settingsData}
            getTableHeaders={getExpandableHypothesisTableHeaders}
            fileStatus={fileStatus}
            isStudyGenerated={isStudyGenerated}
            isActionsDisabled={isLinkChangePending}
            readOnly={flowbasedReadOnlySettings}
            isFlowbasedPrerequisiteMet={isFlowbasedPrerequisiteMet}
            flowbasedTooltipMessage={flowbasedTooltipMessage}
            isReadOnlyEnable={true}
            progress={isTrajectoryConfigurationType(selectedTrajectoryType) ? progress : 0}
            idSelected={String(rowIdSelected)}
            handleSearch={async (fileNameContains: string, rowId: string) => {
              setSelectedTrajectoryType(TRAJECTORY_TYPE.ADEQUACY_PATCH);
              return await handleSelectionChange(fileNameContains, rowId, TRAJECTORY_TYPE.ADEQUACY_PATCH)
            }}
            updateData={(rowId: string, value: unknown, status: RowStatus) => {
              void handleHypothesisTableUpdate(
                rowId,
                value,
                status,
                TRAJECTORY_TYPE.ADEQUACY_PATCH,
                settingsData,
                setSettingsData,
                setReadOnlySettings
              );
            }}
            handleImport={async (rowId: string) => await handleFetchTrajectoryFromFs(rowId, TRAJECTORY_TYPE.ADEQUACY_PATCH)}
            activate={async (value?: boolean | string) => await handleRecalculateActivate(value as boolean)}
            type={TRAJECTORY_TYPE.ADEQUACY_PATCH}
          />
      </div>
        <ImportTrajectoryModal
          options={optionsFS}
          isOpen={isModalOpen}
          onClose={async (
            typeToUse?: TRAJECTORY_TYPE,
            value?: DropdownItemOption,
            hypothesis?: HypothesisType,
            indexArray?: number[],
          ) => {
            toggleModal();
            if (typeToUse) {
              setSelectedTrajectoryType(typeToUse);
              if (value) {
                await importTrajectory(
                  isTrajectoryConfigurationType(typeToUse) ? setSettingsData : setData,
                  value,
                  typeToUse,
                  indexArray,
                  hypothesis,
                  setReadOnly,
                  setReadOnlySettings
                );
              }
            }
          }}
          tabType={selectedTrajectoryType}
          data={isTrajectoryConfigurationType(selectedTrajectoryType) ? settingsData : data}
          rowIdSelected={rowIdSelected}
        />
      {trajectoryData && (
        <TrajectoryDataVisualisation trajectoryData={trajectoryData} onClose={() => setIsViewModalOpen(false)} isOpen={isViewModalOpen}/>
      )}
      <AreaDeletionConfirmationModal
        isOpen={isDeletionModalOpen}
        onClose={() => setIsDeletionModalOpen(false)}
        onConfirm={handleConfirmedAreaDeletion}
      />
      <AreaDeletionConfirmationModal
        isOpen={pendingLinkChange !== null}
        onClose={() => {
          if (!isLinkChangePending) setPendingLinkChange(null);
        }}
        onConfirm={confirmLinkChange}
        id="link-flowbased-confirmation-modal"
        title={t('flowbased.@linkChangeConfirmationTitle')}
        message={t('flowbased.@linkChangeConfirmation')}
        isBusy={isLinkChangePending}
      />
    </div>
  );
};
