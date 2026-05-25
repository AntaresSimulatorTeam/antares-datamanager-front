import { RdsModal } from 'rte-design-system-react';
import SelectAndSearchableInput from '@/components/input/SelectAndSearchableInput.tsx';
import { useTranslation } from 'react-i18next';
import { useCallback, useState } from 'react';
import { SelectOption } from '@/shared/types';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { fetchTrajectoriesFromFS } from '@/shared/services/trajectoryService.ts';
import { convertToFSSelectionOptionType } from '@/shared/utils/formFormatter.ts';
import { getPathFromTrajectoryType, getQueryParamAreaValue } from '@/shared/utils/trajectoryUtils.ts';
import { Button, Icon } from '@design-system-rte/react';

interface ImportTrajectoryModalProps {
  options: SelectOption[] | undefined;
  onClose: (value?: SelectOption) => Promise<void>;
  trajectoryType: TRAJECTORY_TYPE;
  hypothesis?: { area: string; technology?: string; isDefault: boolean };
}

export const ImportTrajectoryModal = ({ options, onClose, trajectoryType, hypothesis }: ImportTrajectoryModalProps) => {
  const { t } = useTranslation();
  const [trajectorySelected, setTrajectorySelected] = useState<SelectOption | null>(null);
  const path = getPathFromTrajectoryType(trajectoryType, hypothesis);

  const handleSelectOption = (value: SelectOption | null) => {
    if (value) {
      setTrajectorySelected(value);
    }
  };

  const resetField = () => {
    setTrajectorySelected(null);
  };

  const handleSearchTerm = useCallback(
    async (searchTerm?: string) => {
      if (!searchTerm && !options?.length) return;
      try {
        const isTechnologyTrajectory =
          trajectoryType === TRAJECTORY_TYPE.STS ||
          trajectoryType === TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER;
        const searchHypothesis = isTechnologyTrajectory ? hypothesis?.technology : hypothesis?.area;
        const results = await fetchTrajectoriesFromFS(
          trajectoryType,
          getQueryParamAreaValue(trajectoryType, searchHypothesis),
          searchTerm,
        );
        return convertToFSSelectionOptionType(results, hypothesis?.isDefault);
      } catch (error) {
        // silent handler
      }
    },
    [options, hypothesis, trajectoryType],
  );

  return (
    <RdsModal size="small">
      <RdsModal.Title onClose={() => void onClose()} icon="Upload">
        {`${t('studyDetails.@import_from_file_system')} ${hypothesis?.area ?? trajectoryType} ${hypothesis?.technology ? ' - ' : ''} ${hypothesis?.technology ?? ''}`}
      </RdsModal.Title>
      <RdsModal.Content>
        {path && (
          <span className="mb-1 flex text-body-s text-gray-600">{t('studyDetails.@select_from', { path })}</span>
        )}
        <div className="flex h-full flex-col">
          <div className="absolute z-10">
            <div className="w-[300px]">
              <SelectAndSearchableInput
                options={options}
                defaultPlaceHolder={
                  options?.length ? t('studyDetails.@select_trajectory') : t('studyDetails.@select_no_trajectory')
                }
                onSelect={handleSelectOption}
                isSearchable={true}
                setSearchTerm={handleSearchTerm}
                resetField={resetField}
                isInputDisabled={!options?.length}
              />
            </div>
            {trajectoryType === TRAJECTORY_TYPE.STS && (
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
                  void onClose(trajectorySelected);
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
