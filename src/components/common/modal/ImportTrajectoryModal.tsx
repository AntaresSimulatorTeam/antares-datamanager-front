// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { RdsButton, RdsIconId, RdsModal } from 'rte-design-system-react';
import SelectAndSearchableInput from '@/components/input/SelectAndSearchableInput.tsx';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

interface ImportTrajectoryModalProps {
  options: SelectOption[] | undefined;
  onClose: () => void;
  handleFileImport: (value: SelectOption | null) => Promise<void>;
}

export const ImportTrajectoryModal = ({ options, onClose, handleFileImport }: ImportTrajectoryModalProps) => {
  const { t } = useTranslation();
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [trajectorySelected, setTrajectorySelected] = useState<SelectOption | null>(null);

  const handleSelectOption = (value: SelectOption | null) => {
    if (value) {
      setIsButtonDisabled(false);
      setTrajectorySelected(value);
    }
  };

  return (
    <RdsModal size="small">
      <RdsModal.Title onClose={onClose} icon="Upload">
        {t('studyDetails.@import_from_file_system')}
      </RdsModal.Title>
      <RdsModal.Content>
        <div className="pb-120-80 w-2/5" style={{ height: '100px' }}>
          <SelectAndSearchableInput
            options={options}
            defaultPlaceHolder={t('studyDetails.@select_trajectory')}
            onSelect={handleSelectOption}
          />
        </div>
      </RdsModal.Content>
      <RdsModal.Footer>
        <RdsButton label="Cancel" onClick={onClose} color="secondary" />
        <RdsButton
          icon={RdsIconId.Add}
          label={t('studyDetails.@import')}
          onClick={() => void handleFileImport(trajectorySelected)}
          variant="contained"
          color="primary"
          disabled={isButtonDisabled}
        />
      </RdsModal.Footer>
    </RdsModal>
  );
};
