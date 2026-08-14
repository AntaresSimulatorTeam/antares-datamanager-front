import { RdsModal } from 'rte-design-system-react';
import SelectAndSearchableInput from '@/components/input/SelectAndSearchableInput.tsx';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { getModalTile, getPathFromTrajectoryType } from '@/shared/utils/trajectoryUtils.ts';
import { Button, Icon } from '@design-system-rte/react';
import { useTrajectoryFetchFromFSHandler } from '@/hooks/useTrajectoryFetchFromFSHandler.ts';
import { getParamForFetchFSTrajectory } from '@/shared/helpers/hypothesisTableHelper.ts';
import { HypothesisType } from '@/shared/types/HypothesisTable.ts';
import { DropdownItemProps } from '@design-system-rte/core/components/dropdown/dropdown.interface';

interface ImportTrajectoryModalProps {
  options: DropdownItemProps[] | undefined;
  onClose: (
    typeToUse?: TRAJECTORY_TYPE,
    value?: DropdownItemProps,
    hypothesis?: HypothesisType,
    indexArray?: number[],
  ) => Promise<void>;
  tabType: TRAJECTORY_TYPE;
  hypothesis?: HypothesisType;
  indexArray: number[];
  rowsNb: number;
}

export const ImportTrajectoryModal = ({
  options,
  onClose,
  tabType,
  hypothesis,
  indexArray,
  rowsNb,
}: ImportTrajectoryModalProps) => {
  const { t } = useTranslation();
  const [trajectorySelected, setTrajectorySelected] = useState<DropdownItemProps | null>(null);
  const [optionsFS, setOptionsFS] = useState<DropdownItemProps[] | undefined>(options);
  const { typeToUse, areaToUse, isDefaultArea } = getParamForFetchFSTrajectory(tabType, indexArray, rowsNb, hypothesis);
  const path = getPathFromTrajectoryType(typeToUse, hypothesis);
  const { handleFetchFromFS } = useTrajectoryFetchFromFSHandler();

  return (
    <RdsModal size="small">
      <RdsModal.Title onClose={() => void onClose()} icon="Upload">
        {`${t('studyDetails.@import_from_file_system')} ${getModalTile(tabType, hypothesis)}`}
      </RdsModal.Title>
      <RdsModal.Content>
        {path && (
          <span className="mb-1 flex text-body-s text-gray-600">{t('studyDetails.@select_from', { path })}</span>
        )}
        <div className="flex h-full flex-col">
          <div className="absolute z-10">
            <div className="w-[400px]">
              <SelectAndSearchableInput
                options={optionsFS}
                defaultPlaceHolder={
                  options?.length ? t('studyDetails.@select_trajectory') : t('studyDetails.@select_no_trajectory')
                }
                onSelect={setTrajectorySelected}
                isSearchable={true}
                setSearchTerm={async (value?: string) => {
                  const results = await handleFetchFromFS({ typeToUse, areaToUse, isDefaultArea, searchTerm: value });
                  setOptionsFS(results);
                  return results;
                }}
                resetField={() => setTrajectorySelected(null)}
                isInputDisabled={!options?.length}
                dropdownWidth={400}
              />
            </div>
            {tabType === TRAJECTORY_TYPE.STS && (
              <div className="mt-1 flex items-center gap-1 text-body-s text-gray-600">
                <Icon name="info" size={15} />
                <span>{t('trajectoryImportModal.@timeSeries')}</span>
              </div>
            )}
          </div>
          <div className="relative flex w-full justify-end gap-1 pb-2 pt-8">
            <Button label={t('trajectoryDeletionModal.@cancel')} onClick={() => void onClose()} variant="text" />
            <Button
              icon="add"
              label={t('studyDetails.@import')}
              onClick={() => {
                if (trajectorySelected) {
                  void onClose(typeToUse, trajectorySelected, hypothesis, indexArray);
                }
              }}
              variant="primary"
              disabled={!trajectorySelected}
            />
          </div>
        </div>
      </RdsModal.Content>
    </RdsModal>
  );
};
