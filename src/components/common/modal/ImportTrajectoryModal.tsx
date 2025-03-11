import { FileInputStatus, RdsButton, RdsIconId, RdsModal } from 'rte-design-system-react';
import SelectAndSearchableInput from '@/components/input/SelectAndSearchableInput.tsx';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { ProgressBar } from '@/components/forms/ProgressBar.tsx';
import { DbTrajectory, RowStatus, SelectOption } from '@/shared/types';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { addTrajectory } from '@/shared/services/trajectoryService.ts';
import { SelectOption } from '@/shared/types/Input.type.ts';

interface ImportTrajectoryModalProps {
  options: SelectOption[] | undefined;
  onClose: (status: RowStatus, value?: DbTrajectory | SelectOption) => Promise<void>;
  trajectoryType: TRAJECTORY_TYPE;
  studyHorizon: string;
}

export const ImportTrajectoryModal = ({
  options,
  onClose,
  trajectoryType,
  studyHorizon,
}: ImportTrajectoryModalProps) => {
  const { t } = useTranslation();
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [trajectorySelected, setTrajectorySelected] = useState<SelectOption | null>(null);
  const [fileStatus, setFileStatus] = useState<FileInputStatus>('empty');
  const [progress, setProgress] = useState(0);

  const handleSelectOption = (value: SelectOption | null) => {
    if (value) {
      setIsButtonDisabled(false);
      setTrajectorySelected(value);
    }
  };

  const resetField = () => {
    setTrajectorySelected(null);
    setFileStatus('empty');
  };

  const handleImportTrajectory = async (value: SelectOption) => {
    setFileStatus('loading');
    setIsButtonDisabled(true);
    let newTrajectory: DbTrajectory;
    try {
      newTrajectory = await addTrajectory(trajectoryType, value.label, studyHorizon, (progressValue: number) => {
        setProgress(+progressValue?.toFixed(0));
      });
      setFileStatus('success');
      await onClose('success', newTrajectory);
    } catch (error) {
      // TODO handle errors considered as warning ones
      setFileStatus('error');
      await onClose('error', value);
    }
  };

  return (
    <RdsModal size="small">
      <RdsModal.Title onClose={() => void onClose('empty')} icon="Upload">
        {t('studyDetails.@import_from_file_system', {
          trajectoryType: trajectoryType === TRAJECTORY_TYPE.AREA ? 'areas' : 'links',
        })}
      </RdsModal.Title>
      <RdsModal.Content>
        <div className="inline-flex w-full items-start gap-4" style={{ height: '110px' }}>
          <div className="w-3/5">
            <SelectAndSearchableInput
              options={options}
              defaultPlaceHolder={t('studyDetails.@select_trajectory')}
              onSelect={handleSelectOption}
              resetField={resetField}
            />
          </div>
          <div className="flex w-3/5 flex-col items-start pt-2">
            <ProgressBar statusFile={fileStatus} progressValue={progress} />
          </div>
        </div>
      </RdsModal.Content>
      <RdsModal.Footer>
        <RdsButton label="Cancel" onClick={() => void onClose('empty')} color="secondary" />
        <RdsButton
          icon={RdsIconId.Add}
          label={t('studyDetails.@import')}
          onClick={() => trajectorySelected && void handleImportTrajectory(trajectorySelected)}
          variant="contained"
          color="primary"
          disabled={isButtonDisabled}
        />
      </RdsModal.Footer>
    </RdsModal>
  );
};
