import SelectAndSearchableInput from '@/components/input/SelectAndSearchableInput.tsx';
import { RdsButton } from 'rte-design-system-react';
import { useTranslation } from 'react-i18next';
import { SelectOption } from '@/shared/types';

interface SelectInputWithButtonProps {
  onSelect: (value: SelectOption) => void;
  onSearch: (value?: string) => Promise<SelectOption[] | undefined>;
  isDisabled: boolean;
  onClickButton?: () => void;
}

export const SelectInputWithButton = ({
  onSelect,
  onSearch,
  onClickButton,
  isDisabled,
}: SelectInputWithButtonProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex min-w-fit items-center gap-2">
      <SelectAndSearchableInput
        onSelect={(value: SelectOption) => void onSelect(value)}
        setSearchTerm={async (value?: string) => await onSearch(value)}
        defaultPlaceHolder={t('studyDetails.@select_trajectory')}
        isSearchable={true}
        isInputDisabled={isDisabled}
      />
      <span>or</span>
      <RdsButton label={t('studyDetails.@import_file')} onClick={() => onClickButton?.()} disabled={isDisabled} />
    </div>
  );
};
