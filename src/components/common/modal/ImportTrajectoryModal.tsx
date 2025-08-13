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
import { OTHER_AREAS } from '@/shared/const/studyConfig.ts';
import StdButton from '@common/base/stdButton/StdButton.tsx';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps.ts';

interface ImportTrajectoryModalProps {
  options: SelectOption[] | undefined;
  onClose: (value?: SelectOption) => Promise<void>;
  trajectoryType: TRAJECTORY_TYPE;
  area?: string;
}

export const ImportTrajectoryModal = ({ options, onClose, trajectoryType, area }: ImportTrajectoryModalProps) => {
  const { t } = useTranslation();
  const [trajectorySelected, setTrajectorySelected] = useState<SelectOption | null>(null);

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
      try {
        const searchArea =
          trajectoryType === TRAJECTORY_TYPE.THERMAL_CAPACITY && area?.includes('FR') ? 'FR' : OTHER_AREAS;
        const results = await fetchTrajectoriesFromFS(trajectoryType, searchTerm, searchArea);
        return convertToFSSelectionOptionType(results);
      } catch (error) {
        // silent handler
      }
    },
    [trajectoryType, area],
  );

  return (
    <RdsModal size="small">
      <RdsModal.Title onClose={() => void onClose()} icon="Upload">
        {t('studyDetails.@import_from_file_system', {
          area,
        })}
      </RdsModal.Title>
      <RdsModal.Content>
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
