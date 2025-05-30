import { RdsButton, RdsIconId, RdsModal } from 'rte-design-system-react';
import SelectAndSearchableInput from '@/components/input/SelectAndSearchableInput.tsx';
import { useTranslation } from 'react-i18next';
import { useCallback, useState } from 'react';
import { SelectOption } from '@/shared/types';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { fetchTrajectoriesFromFS } from '@/shared/services/trajectoryService.ts';
import { convertToFSSelectionOptionType } from '@/shared/utils/formFormatter.ts';

interface ImportTrajectoryModalProps {
  options: SelectOption[] | undefined;
  onClose: (value?: SelectOption) => Promise<void>;
  trajectoryType: TRAJECTORY_TYPE;
  area?: string;
}

export const ImportTrajectoryModal = ({ options, onClose, trajectoryType, area }: ImportTrajectoryModalProps) => {
  const { t } = useTranslation();
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [trajectorySelected, setTrajectorySelected] = useState<SelectOption | null>(null);

  const handleSelectOption = (value: SelectOption | null) => {
    if (value) {
      setIsButtonDisabled(false);
      setTrajectorySelected(value);
    }
  };

  const resetField = () => {
    setTrajectorySelected(null);
  };

  const handleSearchTerm = useCallback(
    async (searchTerm?: string) => {
      try {
        const results = await fetchTrajectoriesFromFS(trajectoryType, searchTerm);
        return convertToFSSelectionOptionType(results);
      } catch (error) {
        // silent handler
      }
    },
    [trajectoryType],
  );

  return (
    <RdsModal size="small">
      <RdsModal.Title onClose={() => void onClose()} icon="Upload">
        {t('studyDetails.@import_from_file_system', {
          trajectoryType,
          area,
        })}
      </RdsModal.Title>
      <RdsModal.Content>
        <div className="w-1/2">
          <SelectAndSearchableInput
            options={options}
            defaultPlaceHolder={t('studyDetails.@select_trajectory')}
            onSelect={handleSelectOption}
            isSearchable={true}
            setSearchTerm={handleSearchTerm}
            resetField={resetField}
          />
        </div>
      </RdsModal.Content>
      <RdsModal.Footer>
        <RdsButton label="Cancel" onClick={() => void onClose()} color="secondary" />
        <RdsButton
          icon={RdsIconId.Add}
          label={t('studyDetails.@import')}
          onClick={() => trajectorySelected && void onClose(trajectorySelected)}
          variant="contained"
          color="primary"
          disabled={isButtonDisabled}
        />
      </RdsModal.Footer>
    </RdsModal>
  );
};
