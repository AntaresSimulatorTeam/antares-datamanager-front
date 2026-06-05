import { useTranslation } from 'react-i18next';
import { SelectOption } from '@/shared/types';
import { Button } from '@design-system-rte/react';
import SelectAndSearchableInput from '@/components/input/SelectAndSearchableInput.tsx';

interface SelectInputWithButtonProps {
  onSelect: (value: SelectOption) => void;
  onSearch: (value?: string) => Promise<SelectOption[] | undefined>;
  isDisabled: boolean;
  onClickButton?: () => void | Promise<void>;
  placeHolder?: string;
}

export const SelectInputWithButton = ({
  onSelect,
  onSearch,
  onClickButton,
  isDisabled,
  placeHolder,
}: SelectInputWithButtonProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex w-7/12 items-center justify-start gap-2">
      <SelectAndSearchableInput
        onSelect={(value: SelectOption) => void onSelect(value)}
        setSearchTerm={async (value?: string) => await onSearch(value)}
        defaultPlaceHolder={(placeHolder ?? isDisabled) ? '' : t('studyDetails.@select_trajectory')}
        isSearchable={true}
        isInputDisabled={isDisabled}
      />
      <span>{t('studyDetails.@or')}</span>
      <Button
        label={t('studyDetails.@import_file')}
        icon="upload"
        iconPosition="left"
        onClick={() => void onClickButton?.()}
        variant="primary"
        disabled={isDisabled}
      />
    </div>
  );
};
