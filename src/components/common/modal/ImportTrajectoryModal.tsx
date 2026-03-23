import { RdsModal } from 'rte-design-system-react';
import SelectAndSearchableInput from '@/components/input/SelectAndSearchableInput.tsx';
import { useTranslation } from 'react-i18next';
import { useCallback, useState } from 'react';
import { SelectOption } from '@/shared/types';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { fetchTrajectoriesFromFS } from '@/shared/services/trajectoryService.ts';
import { convertToFSSelectionOptionType } from '@/shared/utils/formFormatter.ts';
import StdButton from '@common/base/stdButton/StdButton';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps.ts';
import { getPathFromTrajectoryType, getQueryParamAreaValue } from '@/shared/utils/trajectoryUtils.ts';
import StdIcon from '@common/base/stdIcon/StdIcon.tsx';

interface ImportTrajectoryModalProps {
  options: SelectOption[] | undefined;
  onClose: (value?: SelectOption) => Promise<void>;
  trajectoryType: TRAJECTORY_TYPE;
  hypothesis?: { area?: string; technology?: string };
}

export const ImportTrajectoryModal = ({ options, onClose, trajectoryType, hypothesis }: ImportTrajectoryModalProps) => {
  const { t } = useTranslation();
  const [trajectorySelected, setTrajectorySelected] = useState<SelectOption | null>(null);
  const path = getPathFromTrajectoryType(trajectoryType, hypothesis?.technology);

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
        return convertToFSSelectionOptionType(results, searchTerm);
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
            <div className="w-[400px]">
              <SelectAndSearchableInput
                options={options}
                defaultPlaceHolder={t('studyDetails.@select_trajectory')}
                onSelect={handleSelectOption}
                isSearchable={true}
                setSearchTerm={handleSearchTerm}
                resetField={resetField}
              />
            </div>
            {trajectoryType === TRAJECTORY_TYPE.STS && (
              <div className="mt-1 flex items-center gap-1 text-body-s text-gray-600">
                <StdIcon name={StdIconId.Info} width={15} height={15} />
                <span>{t('trajectoryImportModal.@timeSeries')}</span>
              </div>
            )}
          </div>
          <div className="relative flex w-full justify-end gap-1 pb-2 pt-8">
            <StdButton label="Cancel" onClick={() => void onClose()} color="secondary" />
            <StdButton
              icon={StdIconId.Add}
              label={t('studyDetails.@import')}
              onClick={() => {
                if (trajectorySelected) {
                  void onClose(trajectorySelected);
                }
              }}
              variant="contained"
              color="primary"
              disabled={!trajectorySelected}
            />
          </div>
        </div>
      </RdsModal.Content>
    </RdsModal>
  );
};
