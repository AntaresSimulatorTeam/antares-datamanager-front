import { RdsModal } from 'rte-design-system-react';
import SelectAndSearchableInput from '@/components/input/SelectAndSearchableInput.tsx';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { SelectOption } from '@/shared/types';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import StdButton from '@common/base/stdButton/StdButton';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps.ts';
import { getPathFromTrajectoryType } from '@/shared/utils/trajectoryUtils.ts';
import StdIcon from '@common/base/stdIcon/StdIcon.tsx';
import { handleFetchTrajectoriesFS } from '@/shared/services/hypothesisTableService.ts';

interface ImportTrajectoryModalProps {
  isOpen: boolean;
  onClose: (value?: SelectOption) => Promise<void>;
  trajectoryType: TRAJECTORY_TYPE;
  hypothesis: { type: TRAJECTORY_TYPE; area: string; technology?: string; isDefault: boolean };
}

export const ImportTrajectoryModal = ({ isOpen, onClose, trajectoryType, hypothesis }: ImportTrajectoryModalProps) => {
  const { t } = useTranslation();
  const [trajectorySelected, setTrajectorySelected] = useState<SelectOption | null>(null);
  const path = getPathFromTrajectoryType(trajectoryType, hypothesis);
  const [options, setOptions] = useState<SelectOption[]>([]);
  const [placeholder, setPlaceholder] = useState<string>(t('studyDetails.@select_no_trajectory'));
  const [isInputDisabled, setIsInputDisabled] = useState<boolean>(false);

  useEffect(() => {
    const fetchOptions = async () => {
      const optionsFS = await handleFetchTrajectoriesFS(trajectoryType, hypothesis);
      optionsFS && setOptions(optionsFS);
      const placeholderSelect =
        optionsFS?.length > 0 ? t('studyDetails.@select_trajectory') : t('studyDetails.@select_no_trajectory');
      setPlaceholder(placeholderSelect);
      setIsInputDisabled(optionsFS?.length === 0);
    };
    if (!isOpen) return;
    void fetchOptions();
  }, [hypothesis, hypothesis.area, hypothesis.isDefault, hypothesis.type, isOpen, t, trajectoryType]);

  const resetField = () => {
    setTrajectorySelected(null);
  };

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
                defaultPlaceHolder={placeholder}
                onSelect={setTrajectorySelected}
                isSearchable={true}
                setSearchTerm={async (value?: string) =>
                  await handleFetchTrajectoriesFS(trajectoryType, hypothesis, value)
                }
                resetField={resetField}
                isInputDisabled={isInputDisabled}
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
