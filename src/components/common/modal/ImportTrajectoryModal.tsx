import { FileInputStatus, RdsButton, RdsIconId, RdsModal } from 'rte-design-system-react';
import SelectAndSearchableInput from '@/components/input/SelectAndSearchableInput.tsx';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { ProgressBar } from '@/components/forms/ProgressBar.tsx';
import { DbTrajectory, RowStatus, SelectOption } from '@/shared/types';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { uploadTrajectory } from '@/shared/services/trajectoryService.ts';

interface ImportTrajectoryModalProps {
  options: SelectOption[] | undefined;
  onClose: (status?: RowStatus, valueId?: number, valueLabel?: string) => Promise<void>;
  trajectoryType: TRAJECTORY_TYPE;
  studyHorizon: string;
  studyId: number;
}

export const ImportTrajectoryModal = ({
  options,
  onClose,
  trajectoryType,
  studyHorizon,
  studyId,
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
      newTrajectory = await uploadTrajectory(
        trajectoryType,
        value.label,
        studyHorizon,
        studyId,
        (progressValue: number) => {
          setProgress(+progressValue?.toFixed(0));
        },
      );
      setFileStatus('success');
      await onClose('success', newTrajectory.id);
    } catch (error) {
      // TODO handle errors considered as warning ones
      setFileStatus('error');
      await onClose('error', value.id, value.label);
    }
  };

  return (
    <RdsModal size="small">
      <RdsModal.Title onClose={() => void onClose()} icon="Upload">
        {t('studyDetails.@import_from_file_system', {
          trajectoryType: trajectoryType === TRAJECTORY_TYPE.AREA ? 'areas' : 'links',
        })}
      </RdsModal.Title>
      <RdsModal.Content>
        <div className="w-full items-start gap-4">
          <div className="absolute">
            <SelectAndSearchableInput
              options={options ? [...options, ...options, ...options] : options}
              defaultPlaceHolder={t('studyDetails.@select_trajectory')}
              onSelect={handleSelectOption}
              resetField={resetField}
            />
          </div>
          <div className="relative float-right w-2/5 flex-col pt-2">
            <ProgressBar statusFile={fileStatus} progressValue={progress} />
          </div>
        </div>
      </RdsModal.Content>
      <RdsModal.Footer>
        <RdsButton label={t('components.quickAccess.@cancel')} onClick={() => void onClose()} color="secondary" />
        <RdsButton
          icon={RdsIconId.Add}
          label={t('components.buttonLabel.@import')}
          onClick={() => trajectorySelected && void handleImportTrajectory(trajectorySelected)}
          variant="contained"
          color="primary"
          disabled={isButtonDisabled}
        />
      </RdsModal.Footer>
    </RdsModal>
  );
};
